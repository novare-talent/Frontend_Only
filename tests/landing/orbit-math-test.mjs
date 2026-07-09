/* Mirror of orbital navigation math in src/NovareLanding.jsx */
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const segLin = (t, a, b) => clamp01((t - a) / (b - a))
const N = 8
const ORB_STEP = (Math.PI * 2) / N

const orbitPosDesktop = (t) => segLin(t, 0.09, 0.2) + segLin(t, 0.285, 0.33) + segLin(t, 0.5, 0.55) + segLin(t, 0.64, 0.69)
const orbitPosMobile = (t) => segLin(t, 0.07, 0.19) + segLin(t, 0.5, 0.56) + segLin(t, 0.69, 0.725) + segLin(t, 0.815, 0.845)
const orbitPosBeyond = (y, m, vh) =>
  segLin(y, m.loopTop - 0.9 * vh, m.loopTop - 0.25 * vh) +
  segLin(y, m.proofTop - 0.85 * vh, m.proofTop - 0.25 * vh) +
  segLin(y, m.ctaTop - 0.85 * vh, m.ctaTop - 0.25 * vh)

const depth = (i, p) => {
  let a = (i - p) * ORB_STEP
  a = Math.atan2(Math.sin(a), Math.cos(a))
  return (1 + Math.cos(a)) / 2
}

let fails = 0
const ok = (name, cond, detail) => { if (!cond) { fails++; console.log(`FAIL  ${name}  ${detail ?? ''}`) } else console.log(`pass  ${name}`) }
const near = (a, b, eps = 0.02) => Math.abs(a - b) <= eps

/* front item at every hold */
ok('desktop: Hero front at t=0', near(orbitPosDesktop(0), 0))
ok('desktop: Pipeline front at t=0.24', near(orbitPosDesktop(0.24), 1))
ok('desktop: Hermit front at t=0.36', near(orbitPosDesktop(0.36), 2))
ok('desktop: ZenHyre front at t=0.60', near(orbitPosDesktop(0.6), 3))
ok('desktop: Arena front at t=0.75..1', near(orbitPosDesktop(0.75), 4) && near(orbitPosDesktop(1), 4))
ok('mobile: Hero front at t=0', near(orbitPosMobile(0), 0))
ok('mobile: Pipeline front at steps', near(orbitPosMobile(0.3), 1) && near(orbitPosMobile(0.45), 1))
ok('mobile: Hermit front during chat', near(orbitPosMobile(0.62), 2))
ok('mobile: ZenHyre front', near(orbitPosMobile(0.76), 3))
ok('mobile: Arena front', near(orbitPosMobile(0.87), 4))

/* beyond-track stops: monotone 0→3 across loop/proof/cta */
{
  const m = { loopTop: 10000, proofTop: 11500, ctaTop: 13500 }
  const vh = 900
  ok('beyond: 0 before loop approach', near(orbitPosBeyond(8000, m, vh), 0))
  ok('beyond: +1 at loop', near(orbitPosBeyond(m.loopTop - 0.25 * vh, m, vh), 1))
  ok('beyond: +2 at proof', near(orbitPosBeyond(m.proofTop - 0.25 * vh, m, vh), 2))
  ok('beyond: +3 at cta', near(orbitPosBeyond(m.ctaTop - 0.2 * vh, m, vh), 3))
  let mono = true, prev = -1
  for (let y = 8000; y < 14000; y += 10) { const p = orbitPosBeyond(y, m, vh); if (p < prev - 1e-9) mono = false; prev = p }
  ok('beyond: monotone with scroll', mono)
}

/* depth model: front biggest, symmetric falloff, wrap correct at p=7 */
ok('depth: front=1, back=0', near(depth(0, 0), 1) && near(depth(4, 0), 0))
ok('depth: symmetric neighbors', near(depth(1, 0), depth(7, 0)))
ok('depth: wrap — Hero adjacent when CTA front', near(depth(0, 7), depth(6, 7)))

/* spring settles near target with tiny overshoot */
{
  let cur = 0, vel = 0, target = 2, maxCur = 0
  for (let f = 0; f < 300; f++) { vel = (vel + (target - cur) * 0.06) * 0.72; cur += vel; maxCur = Math.max(maxCur, cur) }
  ok('spring settles at target', near(cur, 2, 0.01))
  ok('spring has tiny overshoot (<6%)', maxCur > 2.001 && maxCur < 2.12, `peak ${maxCur.toFixed(3)}`)
}

console.log(fails ? `\n${fails} FAILURES` : '\nall checks passed')
process.exit(fails ? 1 : 0)
