/* Mirror of the pure frame math in src/NovareLanding.jsx (polish pass, {off,k} geometry). */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const easeOutExpo = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x))
const seg = (t, a, b) => easeOutExpo(clamp01((t - a) / (b - a)))
const segLin = (t, a, b) => clamp01((t - a) / (b - a))
const easeInOutCubic = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const sseg = (t, a, b) => easeInOutCubic(clamp01((t - a) / (b - a)))

const OFF = 300
const K = 1

const CENTROID = [0, 20]
const SPHERES = [
  { key: 'zen', F: [0, -150] },
  { key: 'hermit', F: [-180, 105] },
  { key: 'arena', F: [180, 105] },
]
SPHERES.forEach((s) => {
  const dx = s.F[0] - CENTROID[0]
  const dy = s.F[1] - CENTROID[1]
  s.r0 = Math.hypot(dx, dy)
  s.a0 = Math.atan2(dy, dx)
})

const SPINE_Y = 256
const SPINE_PTS = [
  [-510, SPINE_Y - 14],
  [-306, SPINE_Y + 10],
  [-102, SPINE_Y - 8],
  [102, SPINE_Y + 14],
  [306, SPINE_Y - 10],
  [510, SPINE_Y + 6],
]

const SPINE6_AT = [0.3, 0.37, 0.445, 0.575, 0.72, 0.878]

const PANEL_GEO = {
  hermit: { chipIdx: 0, dx: -75, em: [0.285, 0.35], rec: [0.5, 0.56] },
  zen: { chipIdx: 3, dx: 0, em: [0.5, 0.565], rec: [0.64, 0.685] },
  arena: { chipIdx: 4, dx: 70, em: [0.64, 0.705], rec: [0.8, 0.855], collapse: true },
}

function sphereFrame2(t, s) {
  const p = segLin(t, 0.08, 0.185)
  const e = easeOutExpo(p)
  const r = s.r0 * (1 - p * p * p)
  const a = s.a0 + 0.85 * e
  return {
    x: CENTROID[0] + Math.cos(a) * r,
    y: CENTROID[1] + Math.sin(a) * r,
    opacity: 1 - seg(t, 0.165, 0.19),
  }
}

function coreFrame(t, off, k) {
  const grow = seg(t, 0.105, 0.19)
  const s = 0.25 + 0.75 * grow
  const move = seg(t, 0.2, 0.245)
  return {
    opacity: seg(t, 0.105, 0.16) * (1 - 0.45 * seg(t, 0.285, 0.315)),
    x: off * (1 - move),
    y: 20 + (SPINE_Y * k - 20) * move,
    sx: s * (1 + 11.6 * k * seg(t, 0.212, 0.272)),
    sy: s * (1 - 0.955 * seg(t, 0.228, 0.278)),
  }
}

function panelFrame2(t, geo, off, k) {
  const [e0, e1] = geo.em
  const [r0] = geo.rec
  const chip = [SPINE_PTS[geo.chipIdx][0] * k, SPINE_PTS[geo.chipIdx][1] * k]
  const pos = [off + geo.dx, -80]
  const m = seg(t, e0, e1)
  const r = seg(t, geo.rec[0], geo.rec[1])
  let x = chip[0] + (pos[0] - chip[0]) * m
  let y = chip[1] + (pos[1] - chip[1]) * m
  let scale = 0.16 + 0.84 * m
  let opacity = seg(t, e0, e0 + 0.35 * (e1 - e0))
  if (geo.collapse) {
    x += (chip[0] - pos[0]) * r
    y += (chip[1] - pos[1]) * r
    scale -= 0.8 * r
    opacity *= 1 - 0.85 * r
  } else {
    y -= 34 * r
    scale -= 0.1 * r
    opacity *= 1 - 0.75 * r
  }
  const radius = clamp(24 + 220 * (1 - m + (geo.collapse ? r : 0)), 24, 240)
  const content = seg(t, e1 - 0.012, e1 + 0.018) * (1 - seg(t, r0, r0 + 0.03))
  return { x, y, scale, opacity, radius, content }
}

function cardFrame(t, off, k) {
  const op = seg(t, 0.437, 0.452)
  let x = off - 75
  let y = -50
  let sc = 1
  const lift = sseg(t, 0.452, 0.478)
  y -= 118 * lift
  sc += 0.05 * lift
  const t1 = sseg(t, 0.478, 0.52)
  x += 75 * t1
  y += 90 * t1 - 36 * Math.sin(Math.PI * t1)
  sc -= 0.05 * t1
  const t2 = sseg(t, 0.64, 0.678)
  x += 70 * t2
  y -= 5 * t2 + 20 * Math.sin(Math.PI * t2)
  const t3 = sseg(t, 0.812, 0.876)
  x += (510 * k - (off + 70)) * t3
  y += ((SPINE_Y + 6) * k + 83) * t3 - 40 * Math.sin(Math.PI * t3)
  sc -= 0.4 * t3
  sc += 0.04 * Math.sin(Math.PI * segLin(t, 0.868, 0.888))
  const open = clamp01(sseg(t, 0.522, 0.558) - sseg(t, 0.802, 0.832))
  const wipe = sseg(t, 0.678, 0.706)
  return { op, x, y, sc, open, wipe }
}

const activePanelFor = (t) => (t >= 0.35 && t < 0.5 ? 'hermit' : t >= 0.565 && t < 0.64 ? 'zen' : t >= 0.705 && t < 0.8 ? 'arena' : null)

let fails = 0
const ok = (name, cond, detail) => {
  if (!cond) {
    fails++
    console.log(`FAIL  ${name}  ${detail ?? ''}`)
  } else console.log(`pass  ${name}`)
}
const near = (a, b, eps = 0.02) => Math.abs(a - b) <= eps

/* --- card continuity: travels, never teleports (both k regimes) ------------- */
for (const k of [1, 0.83]) {
  let prev = cardFrame(0.437, OFF, k)
  let maxStep = 0
  let maxT = 0
  for (let t = 0.437; t <= 1.0001; t += 0.0005) {
    const c = cardFrame(t, OFF, k)
    const d = Math.hypot(c.x - prev.x, c.y - prev.y)
    if (d > maxStep) {
      maxStep = d
      maxT = t
    }
    prev = c
  }
  ok(`card continuous at k=${k} (max Δ < 10px per 0.0005t)`, maxStep < 10, `max ${maxStep.toFixed(2)}px at t=${maxT.toFixed(3)}`)
}

/* --- card waypoints ---------------------------------------------------------- */
{
  const inHermit = cardFrame(0.45, OFF, K)
  ok('card starts over Hermit panel', near(inHermit.x, OFF - 75, 2) && inHermit.op > 0.5)
  const atZen = cardFrame(0.58, OFF, K)
  ok('card at ZenHyre, profile open', near(atZen.x, OFF, 2) && near(atZen.y, -78, 3) && atZen.open > 0.99 && atZen.wipe < 0.01)
  const atArena = cardFrame(0.74, OFF, K)
  ok('card at Arena, capability wiped in', near(atArena.x, OFF + 70, 2) && atArena.wipe > 0.99)
  const docked = cardFrame(0.95, OFF, K)
  ok('card docked at Offer & Hire node', near(docked.x, 510 * K, 2) && near(docked.y, (SPINE_Y + 6) * K, 3) && docked.open < 0.01 && near(docked.sc, 0.6, 0.05), JSON.stringify(docked))
}

/* --- panels emerge from spine nodes, front at holds -------------------------- */
for (const [key, mid] of [
  ['hermit', 0.42],
  ['zen', 0.6],
  ['arena', 0.75],
]) {
  const p = panelFrame2(mid, PANEL_GEO[key], OFF, K)
  ok(`${key} panel front at t=${mid}`, near(p.opacity, 1, 0.02) && near(p.scale, 1, 0.02) && near(p.radius, 24, 1) && near(p.content, 1, 0.02), JSON.stringify(p))
  const start = panelFrame2(PANEL_GEO[key].em[0], PANEL_GEO[key], OFF, K)
  const chip = SPINE_PTS[PANEL_GEO[key].chipIdx]
  ok(`${key} panel origin = its spine node`, near(start.x, chip[0] * K, 1) && near(start.y, chip[1] * K, 1))
}
ok('arena collapsed home by dock end', panelFrame2(0.87, PANEL_GEO.arena, OFF, K).opacity < 0.18)
{
  let okGate = true
  for (let t = 0; t <= 1.0001; t += 0.0005) {
    const ap = activePanelFor(t)
    if (!ap) continue
    const p = panelFrame2(t, PANEL_GEO[ap], OFF, K)
    if (Math.abs(p.radius - 24) > 1.5) okGate = false
  }
  ok('glass never active during radius morph', okGate)
}

/* --- core: converges at canvas, becomes the full-width spine ----------------- */
{
  const c0 = coreFrame(0.19, OFF, K)
  ok('core lit at canvas centroid before move', c0.opacity > 0.95 && near(c0.x, OFF, 1) && near(c0.y, 20, 1))
  const c1 = coreFrame(0.28, OFF, K)
  ok('core stretched wide + flat at spine', c1.sx > 12 && c1.sy < 0.06 && near(c1.x, 0, 1) && near(c1.y, SPINE_Y * K, 1), JSON.stringify(c1))
  const sMid = sphereFrame2(0.19, SPHERES[1])
  ok('spheres consumed at centroid', Math.hypot(sMid.x, sMid.y - 20) < 12 && sMid.opacity < 0.05)
}

/* --- stage activation covers the whole journey ------------------------------- */
{
  const passedAt = (t) => SPINE6_AT.reduce((n, a) => n + (t >= a ? 1 : 0), 0)
  ok('no stages live before pipeline completes', passedAt(0.29) === 0)
  ok('Requirement live as Hermit opens', passedAt(0.31) === 1)
  ok('three stages live as card lifts', passedAt(0.45) === 3)
  ok('Verification live at ZenHyre', passedAt(0.58) === 4)
  ok('Capability live at Arena X', passedAt(0.73) === 5)
  ok('all six live at dock', passedAt(0.88) === 6)
}



/* ===================== MOBILE JOURNEY MIRROR ===================== */
const MRAIL_X = 152
const MLINE_Y = 256 // unused, mobile uses node positions
const mNodeY = (i) => -130 + 56 * i
const MSTEP_AT = [0.245, 0.297, 0.349, 0.401, 0.453, 0.505]

function mHermitFrame(t) {
  const m = seg(t, 0.545, 0.59)
  const r = seg(t, 0.68, 0.712)
  const chip = [MRAIL_X, mNodeY(0)]
  const pos = [-22, 20]
  const x = chip[0] + (pos[0] - chip[0]) * m + (chip[0] - pos[0]) * r * 0.9
  const y = chip[1] + (pos[1] - chip[1]) * m + (chip[1] - pos[1]) * r * 0.9
  const scale = 0.12 + 0.88 * m - 0.78 * r
  const opacity = seg(t, 0.545, 0.562) * (1 - 0.92 * r)
  return { x, y, scale, opacity }
}

function mCardFrame(t) {
  const op = seg(t, 0.665, 0.678)
  let x = -22, y = 45, sc = 1
  const lift = sseg(t, 0.678, 0.702); y -= 85 * lift; sc += 0.04 * lift
  const d1 = sseg(t, 0.702, 0.732); y += 70 * d1; sc -= 0.04 * d1
  const d2 = sseg(t, 0.8, 0.835); y += 25 * d2
  const t3 = sseg(t, 0.928, 0.962)
  x += (130 - -22) * t3
  y += (150 - 55) * t3 - 24 * Math.sin(Math.PI * t3)
  sc -= 0.58 * t3
  sc += 0.04 * Math.sin(Math.PI * segLin(t, 0.956, 0.976))
  const open = clamp01(sseg(t, 0.735, 0.768) - sseg(t, 0.918, 0.945))
  const wipe = sseg(t, 0.806, 0.836)
  return { op, x, y, sc, open, wipe }
}

{
  let prev = mCardFrame(0.665), maxStep = 0, maxT = 0
  for (let t = 0.665; t <= 1.0001; t += 0.0005) {
    const c = mCardFrame(t)
    const d = Math.hypot(c.x - prev.x, c.y - prev.y)
    if (d > maxStep) { maxStep = d; maxT = t }
    prev = c
  }
  ok('mobile card continuous (max Δ < 8px per 0.0005t)', maxStep < 8, `max ${maxStep.toFixed(2)}px at t=${maxT.toFixed(3)}`)
}
{
  const zen = mCardFrame(0.78)
  ok('mobile card centered at ZenHyre, profile open', near(zen.x, -22, 2) && near(zen.y, 30, 3) && zen.open > 0.99 && zen.wipe < 0.01)
  const arena = mCardFrame(0.88)
  ok('mobile card at Arena, capability wiped in', near(arena.y, 55, 3) && arena.wipe > 0.99)
  const docked = mCardFrame(0.985)
  ok('mobile card docked at Offer node as chip', near(docked.x, 130, 2) && near(docked.y, 150, 3) && docked.open < 0.01 && near(docked.sc, 0.42, 0.05), JSON.stringify(docked))
}
{
  const h = mHermitFrame(0.545)
  ok('mobile Hermit expands from top node', near(h.x, MRAIL_X, 1) && near(h.y, mNodeY(0), 1))
  const front = mHermitFrame(0.62)
  ok('mobile Hermit front during chat', near(front.opacity, 1, 0.02) && near(front.scale, 1, 0.02) && near(front.x, -22, 1))
  ok('mobile Hermit receded before card descends', mHermitFrame(0.73).opacity < 0.12)
}
{
  const passedAt = (t) => MSTEP_AT.reduce((n, a) => n + (t >= a ? 1 : 0), 0)
  ok('mobile: one step activates per chapter', passedAt(0.27) === 1 && passedAt(0.32) === 2 && passedAt(0.52) === 6)
  /* chapters never overlap: each step chapter fully out before next fully in */
  let overlapOk = true
  for (let i = 0; i < 5; i++) {
    const outEnd = 0.286 + 0.052 * i
    const nextInStart = 0.237 + 0.052 * (i + 1)
    if (outEnd > nextInStart + 0.001) overlapOk = false
  }
  ok('mobile step chapters hand off cleanly', overlapOk)
}

console.log(fails ? `\n${fails} FAILURES` : '\nall checks passed')
process.exit(fails ? 1 : 0)
