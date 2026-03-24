"use client";

import { useMousePositionRef } from "@/hooks/useMousePosition";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// ── Grid constants ──
const GRID_W = 40;
const GRID_D = 28;
const CELL_SIZE = 1.2;
const INFLUENCE_RADIUS = 6;
const MAX_RISE = 1.8;
const RIPPLE_SPEED = 4;
const RIPPLE_DECAY = 1.8;
const RIPPLE_HEIGHT = 0.6;
const RIPPLE_WIDTH = 2.5;
const LERP_FACTOR = 0.06;

// ── Colors ──
const VIOLET = new THREE.Color(0x7F03E3);
const BRIGHT_VIOLET = new THREE.Color(0xddd6fe);
const BG_COLOR = new THREE.Color(0x030014);

interface Ripple {
  x: number;
  z: number;
  birth: number;
}

export default function ThreeGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useMousePositionRef();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030014, 0.03);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 2);

    // ── Grid geometry ──
    const geometry = new THREE.PlaneGeometry(
      GRID_W * CELL_SIZE,
      GRID_D * CELL_SIZE,
      GRID_W,
      GRID_D
    );
    geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    // Store base positions
    const posAttr = geometry.getAttribute("position");
    const basePositions = new Float32Array(posAttr.array.length);
    basePositions.set(posAttr.array);

    // Target heights for smooth lerping
    const targetHeights = new Float32Array(posAttr.count);
    const currentHeights = new Float32Array(posAttr.count);

    // ── Per-vertex colors for grid ──
    const colors = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count; i++) {
      colors[i * 3] = VIOLET.r;
      colors[i * 3 + 1] = VIOLET.g;
      colors[i * 3 + 2] = VIOLET.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // ── Grid wireframe with MeshBasicMaterial ──
    // Note: with vertexColors=true, material.color multiplies vertex colors,
    // so set to white to avoid darkening
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      vertexColors: true,
      side: THREE.DoubleSide,
    });

    const gridMesh = new THREE.Mesh(geometry, gridMaterial);
    scene.add(gridMesh);

    // ── Node dots at vertices ──
    const dotGeometry = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(posAttr.count * 3);
    const dotSizes = new Float32Array(posAttr.count);
    const dotColors = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count; i++) {
      dotPositions[i * 3] = posAttr.getX(i);
      dotPositions[i * 3 + 1] = posAttr.getY(i);
      dotPositions[i * 3 + 2] = posAttr.getZ(i);
      dotSizes[i] = 3.0;
      dotColors[i * 3] = VIOLET.r;
      dotColors[i * 3 + 1] = VIOLET.g;
      dotColors[i * 3 + 2] = VIOLET.b;
    }
    dotGeometry.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    dotGeometry.setAttribute("aSize", new THREE.BufferAttribute(dotSizes, 1));
    dotGeometry.setAttribute("color", new THREE.BufferAttribute(dotColors, 3));

    const dotMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
        uFogColor: { value: BG_COLOR },
        uFogDensity: { value: 0.035 },
      },
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;
        varying float vFogFactor;
        uniform float uPixelRatio;
        uniform float uFogDensity;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = aSize * uPixelRatio * (8.0 / -mvPosition.z);

          float fogDistance = length(mvPosition.xyz);
          vFogFactor = 1.0 - exp(-uFogDensity * fogDistance * fogDistance);
          vFogFactor = clamp(vFogFactor, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vFogFactor;
        uniform vec3 uFogColor;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.2, d) * (1.0 - vFogFactor * 0.9);
          vec3 finalColor = mix(vColor, uFogColor, vFogFactor);
          gl_FragColor = vec4(finalColor, alpha * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
    });

    const dots = new THREE.Points(dotGeometry, dotMaterial);
    scene.add(dots);

    // ── Cursor glow light ──
    const glowLight = new THREE.PointLight(0x7c3aed, 0, 8);
    glowLight.position.set(0, 2, 0);
    scene.add(glowLight);

    // Subtle ambient light
    const ambient = new THREE.AmbientLight(0x7c3aed, 0.03);
    scene.add(ambient);

    // ── Raycaster for cursor → grid mapping ──
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const hitPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();
    const cursorWorld = { x: 0, z: 0, active: false };

    // ── Ripples ──
    const ripples: Ripple[] = [];
    let lastRippleTime = 0;

    // ── Resize ──
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();

    // ── Animation loop (manual timing instead of deprecated THREE.Clock) ──
    let animId = 0;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) / 1000;
      const mouse = mousePos.current;

      // ── Cursor → world position ──
      if (!mouse.isTouch && mouse.x > 0 && mouse.y > 0) {
        const rect = container.getBoundingClientRect();
        mouseVec.x = ((mouse.x - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((mouse.y - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVec, camera);
        const ray = raycaster.ray;
        ray.intersectPlane(hitPlane, hitPoint);

        if (hitPoint) {
          cursorWorld.x = hitPoint.x;
          cursorWorld.z = hitPoint.z;
          cursorWorld.active = true;

          // Spawn ripples
          if (time - lastRippleTime > 0.7) {
            ripples.push({ x: hitPoint.x, z: hitPoint.z, birth: time });
            lastRippleTime = time;
            if (ripples.length > 8) ripples.shift();
          }

          // Position glow light
          glowLight.position.set(hitPoint.x, 1.5, hitPoint.z);
          glowLight.intensity = 3;
        }
      } else {
        cursorWorld.active = false;
        glowLight.intensity *= 0.95; // Fade out
      }

      // ── Update vertex heights ──
      for (let i = 0; i < posAttr.count; i++) {
        const bx = basePositions[i * 3];     // x
        const bz = basePositions[i * 3 + 2]; // z

        let target = 0;

        // Ambient wave
        target += Math.sin(bx * 0.3 + time * 0.4) *
                  Math.cos(bz * 0.25 + time * 0.3) * 0.25;

        if (cursorWorld.active) {
          // Cursor rise
          const dx = bx - cursorWorld.x;
          const dz = bz - cursorWorld.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < INFLUENCE_RADIUS) {
            const t = dist / INFLUENCE_RADIUS;
            target += MAX_RISE * (1 - t) * (1 - t);
          }

          // Ripples
          for (const ripple of ripples) {
            const rdx = bx - ripple.x;
            const rdz = bz - ripple.z;
            const rDist = Math.sqrt(rdx * rdx + rdz * rdz);
            const age = time - ripple.birth;
            const rippleRadius = age * RIPPLE_SPEED;
            const ringDist = Math.abs(rDist - rippleRadius);

            if (ringDist < RIPPLE_WIDTH) {
              const wave = Math.cos((ringDist / RIPPLE_WIDTH) * Math.PI) * 0.5 + 0.5;
              const decay = Math.exp(-age * RIPPLE_DECAY);
              target += wave * RIPPLE_HEIGHT * decay;
            }
          }
        }

        // Smooth lerp
        targetHeights[i] = target;
        currentHeights[i] += (targetHeights[i] - currentHeights[i]) * LERP_FACTOR;

        // Apply displacement (Y is up after rotation)
        posAttr.setY(i, currentHeights[i]);

        // Update colors — brighter near cursor
        if (cursorWorld.active) {
          const dx = bx - cursorWorld.x;
          const dz = bz - cursorWorld.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const glow = dist < INFLUENCE_RADIUS ? 1 - dist / INFLUENCE_RADIUS : 0;

          const r = VIOLET.r + (BRIGHT_VIOLET.r - VIOLET.r) * glow;
          const g = VIOLET.g + (BRIGHT_VIOLET.g - VIOLET.g) * glow;
          const b = VIOLET.b + (BRIGHT_VIOLET.b - VIOLET.b) * glow;

          // Grid mesh colors
          colors[i * 3] = r;
          colors[i * 3 + 1] = g;
          colors[i * 3 + 2] = b;

          // Dot colors + sizes
          dotColors[i * 3] = r;
          dotColors[i * 3 + 1] = g;
          dotColors[i * 3 + 2] = b;
          dotSizes[i] = 3.0 + glow * 5.0;
        } else {
          colors[i * 3] = VIOLET.r;
          colors[i * 3 + 1] = VIOLET.g;
          colors[i * 3 + 2] = VIOLET.b;
          dotColors[i * 3] = VIOLET.r;
          dotColors[i * 3 + 1] = VIOLET.g;
          dotColors[i * 3 + 2] = VIOLET.b;
          dotSizes[i] = 3.0;
        }

        // Sync dot positions
        dotPositions[i * 3] = posAttr.getX(i);
        dotPositions[i * 3 + 1] = currentHeights[i];
        dotPositions[i * 3 + 2] = posAttr.getZ(i);
      }

      posAttr.needsUpdate = true;
      geometry.getAttribute("color").needsUpdate = true;

      dotGeometry.getAttribute("position").needsUpdate = true;
      (dotGeometry.getAttribute("aSize") as THREE.BufferAttribute).needsUpdate = true;
      dotGeometry.getAttribute("color").needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener("resize", resize);

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      geometry.dispose();
      gridMaterial.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      cleanupRef.current?.();
    };
  }, [mousePos]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}
