'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useSpring } from 'framer-motion'
import { useRouter } from 'next/navigation'

/* ============================================================================
   Novare Talent — "One Intelligence" (polish pass)

   One intelligent hiring system, three interfaces.

   Desktop ≥1024px, motion allowed: a single pinned 600vh master journey,
   t ∈ [0,1], driven by ONE rAF loop with lerp smoothing. Framer Motion is
   used for micro-interactions only — it never runs its own scroll listeners.

   Stage map:
     1 hero (living ecosystem)        t 0.00–0.08
     2 convergence → core             t 0.08–0.20
     3 core stretches into pipeline   t 0.20–0.28
     4 Hermit conversation (scrubbed) t 0.28–0.44
     5 candidate card lifts + travels t 0.44–0.50
     6 ZenHyre verification           t 0.50–0.64
     7 travel → Arena X capability    t 0.64–0.80
     8 rejoin pipeline → hire done    t 0.80–0.88
     9 intelligence flows backward    t 0.88–1.00

   The pipeline spine is the page's backbone: a full-width, gently waving
   line with six stage cards. Panels emerge FROM its nodes; the candidate
   card docks back INTO it. Spine coordinates live in a viewport-centered
   space scaled by k (fit) with the right-canvas offset `off` measured at
   runtime — frame math takes {off, k}.

   <1024px or prefers-reduced-motion: calm stacked static sections.
   ========================================================================== */

/* ---- math ---------------------------------------------------------------- */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const easeOutExpo = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x))
const seg = (t, a, b) => easeOutExpo(clamp01((t - a) / (b - a)))
const segLin = (t, a, b) => clamp01((t - a) / (b - a))
const easeInOutCubic = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
/* smooth spatial ease for the traveling card — zero velocity at both ends */
const sseg = (t, a, b) => easeInOutCubic(clamp01((t - a) / (b - a)))
const easeOutBack = (x) => {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const c1 = 1.20158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

const LERP = 0.16
const MAX_STEP = 0.01

/* ---- premium icon family ------------------------------------------------
   One system: 24 grid, 1.5 stroke, rounded caps, soft lavender accent. */

const ICP = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICA = { ...ICP, stroke: '#6E5BD8' }

function Ic({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  )
}

const ICONS = {
  /* Hermit — conversation + intelligence: chat bubble, four-point sparkle */
  hermit: (
    <Ic>
      <path {...ICP} d="M19.5 13.5a2 2 0 0 1-2 2H8L4.5 19V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z" />
      <path {...ICA} d="M12 6.8l.75 1.95 1.95.75-1.95.75L12 12.2l-.75-1.95-1.95-.75 1.95-.75z" />
    </Ic>
  ),
  /* ZenHyre — verified network: connected nodes inside a shield */
  zenhyre: (
    <Ic>
      <path {...ICP} d="M12 3.2l6.8 2.4v5.2c0 4-2.7 7-6.8 8.6-4.1-1.6-6.8-4.6-6.8-8.6V5.6z" />
      <circle {...ICP} cx="12" cy="8.3" r="1.3" />
      <circle {...ICP} cx="9.2" cy="12.8" r="1.3" />
      <circle {...ICA} cx="14.8" cy="12.8" r="1.3" />
      <path {...ICP} d="M11.4 9.5 10 11.6m2.6-2.1 1.4 2.1m-3.5 1.2h2.9" />
    </Ic>
  ),
  /* Arena X — capability: radar with upward signal */
  arenax: (
    <Ic>
      <path {...ICP} d="M11 7.6l4.7 2.7v5.4L11 18.4l-4.7-2.7v-5.4z" />
      <path {...ICA} d="M11 10.4l2.3 1.35v2.5L11 15.6l-2.3-1.35v-2.5z" />
      <path {...ICA} d="M16.5 7.5 20 4m0 2.8V4h-2.8" />
    </Ic>
  ),
  /* pipeline stages */
  requirement: (
    <Ic>
      <path {...ICP} d="M19.5 13.5a2 2 0 0 1-2 2H8L4.5 19V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z" />
      <path {...ICA} d="M8.5 8.2h7" />
      <path {...ICP} d="M8.5 11.2h4.5" />
    </Ic>
  ),
  search: (
    <Ic>
      <circle {...ICP} cx="11" cy="11" r="5.6" />
      <path {...ICP} d="M15.3 15.3 20 20" />
      <path {...ICA} d="M18.6 3.6l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z" />
    </Ic>
  ),
  matches: (
    <Ic>
      <circle {...ICP} cx="6.4" cy="13.4" r="2.1" />
      <circle {...ICP} cx="17.6" cy="13.4" r="2.1" />
      <circle {...ICA} cx="12" cy="9.6" r="2.5" />
      <path {...ICP} d="M8.4 12.3 10 10.9m5.6 1.4L14 10.9" />
      <path {...ICP} d="M5 19.2c1.8-1.5 4.4-2.3 7-2.3s5.2.8 7 2.3" />
    </Ic>
  ),
  verification: (
    <Ic>
      <path {...ICP} d="M12 3.2l6.8 2.4v5.2c0 4-2.7 7-6.8 8.6-4.1-1.6-6.8-4.6-6.8-8.6V5.6z" />
      <path {...ICA} d="M9 11.6l2 2.1 4-4.4" />
    </Ic>
  ),
  capability: (
    <Ic>
      <path {...ICP} d="M12 4.6l6.4 3.7v7.4L12 19.4l-6.4-3.7V8.3z" />
      <path {...ICA} d="M12 8.4l3 1.75v3.2L12 15.6l-3-1.75v-3.2z" />
      <circle {...ICA} cx="12" cy="12" r="0.9" />
    </Ic>
  ),
  offer: (
    <Ic>
      <path {...ICP} d="M7 3h6.5L18 7.5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path {...ICP} d="M13.5 3v4.5H18" />
      <path {...ICA} d="M9.3 14.5l2 2 3.4-3.9" />
    </Ic>
  ),
  /* orbital navigation stops */
  hero: (
    <Ic>
      <circle {...ICP} cx="12" cy="6.8" r="2" />
      <circle {...ICP} cx="6.8" cy="15.4" r="2" />
      <circle {...ICA} cx="17.2" cy="15.4" r="2" />
      <path {...ICP} d="M10.7 8.5 8 13.6m5.3-5.1 2.7 5.1m-7.2 1.8h6.4" />
    </Ic>
  ),
  pipeline: (
    <Ic>
      <circle {...ICP} cx="4.8" cy="12" r="1.8" />
      <circle {...ICA} cx="12" cy="12" r="2.3" />
      <circle {...ICP} cx="19.2" cy="12" r="1.8" />
      <path {...ICP} d="M6.6 12h3.1m4.6 0h3.1" />
    </Ic>
  ),
  loop: (
    <Ic>
      <path {...ICP} d="M19 12a7 7 0 1 1-2.05-4.95" />
      <path {...ICA} d="M19.4 3.8v3.6h-3.6" />
    </Ic>
  ),
}

/* ---- shared constants ------------------------------------------------------ */

const CONTACT = 'mailto:sahil@novaretalent.com'
const SIGNUP = '/sign-up?role=recruiter'

const PRODUCT_LINKS = { hermit: '/hermit', zenhyre: '/Dashboard', arenax: 'https://arena.novaretalent.com' }
/* external product links open in a new tab */
const extProps = (href) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})

/* Single source for every live number on the page. */
const STATS = {
  profiles: 2340,
  campuses: 14,
  shortlistHrs: 48,
  offerAcceptance: 96,
  identityVerified: 100,
}
const fmtInt = (n) => n.toLocaleString('en-IN')

const METRICS = [
  { value: STATS.profiles, label: 'Verified Profiles', fmt: fmtInt },
  { value: STATS.campuses, label: 'Campuses', fmt: (n) => `${n}` },
  { value: STATS.shortlistHrs, label: 'Average Shortlist', fmt: (n) => `${n} hrs` },
  { value: STATS.offerAcceptance, label: 'Offer Acceptance', fmt: (n) => `${n}%` },
  { value: STATS.identityVerified, label: 'Identity Verified', fmt: (n) => `${n}%` },
]

const PARTNERS = [
  { name: 'NVIDIA', sub: 'Inception' },
  { name: 'SINE', sub: 'IIT Bombay' },
  { name: 'IIT Bombay', sub: 'Alumni Association' },
  { name: 'Pocket FM' },
  { name: 'Pi42' },
]

const PLACEMENTS = [
  { id: 'IITB_CS_25', track: 'Backend + Systems', to: 'Placed · Pocket FM', check: true },
  { id: 'IITD_EE_24', track: 'ML Infra', to: 'Placed · Pi42', check: true },
  { id: 'IITB_ME_25', track: 'Product', to: 'Placed · Series A fintech', check: true },
  { id: 'IITM_CS_26', track: 'Full-stack', to: 'Offer accepted', check: false },
  { id: 'IITK_EE_25', track: 'ML Research', to: 'Placed · Stealth AI lab', check: true },
  { id: 'IITKGP_CS_24', track: 'Platform', to: 'Placed · Series B infra', check: true },
  { id: 'IITH_CS_25', track: 'Backend', to: 'Placed · Pi42', check: true },
  { id: 'IITD_CS_26', track: 'Systems', to: 'Offer accepted', check: false },
]

/* Editorial deck — short, confident, editorial. Product blocks carry the
   identity structure: name · descriptor · headline · support · CTA. */
const EDITORIAL = [
  {
    hero: true,
    heroLines: ['Hire Better.', 'Hire Smarter.', 'Hire Novare.'],
    heading: 'Hire Better. Hire Smarter. Hire Novare.',
    body: "Novare Talent helps startups and enterprises hire top talent through AI-powered recruitment, intelligent candidate evaluation, and India's most trusted elite talent network.",
  },
  {
    label: 'The Pipeline',
    heading: 'One continuous hiring intelligence pipeline.',
    body: 'Every hire follows the same trusted workflow, from the first requirement to the signed offer.',
  },
  {
    product: 'Hermit',
    descriptor: 'Source qualified candidates directly from WhatsApp',
    icon: 'hermit',
    href: PRODUCT_LINKS.hermit,
    heading: 'Hiring begins where conversations already happen.',
    body: 'Describe the role in plain English. Hermit searches, qualifies, coordinates and keeps hiring moving without leaving WhatsApp.',
    cta: 'Explore Hermit',
  },
  {
    product: 'ZenHyre',
    descriptor: 'Discover and hire verified elite talent',
    icon: 'zenhyre',
    href: PRODUCT_LINKS.zenhyre,
    heading: 'A trusted network, not another database.',
    body: 'Access verified talent from leading IIT campuses with identities, academic records and professional history already validated.',
    cta: 'Explore ZenHyre',
  },
  {
    product: 'Arena X',
    descriptor: 'Upskill talent through AI-powered real-world challenges',
    icon: 'arenax',
    href: PRODUCT_LINKS.arenax,
    heading: 'Capability is the strongest signal.',
    body: 'Arena X evaluates how candidates actually think, build and solve problems through structured assessments and real performance signals.',
    cta: 'Explore Arena X',
  },
  {
    caption: 'Hire complete. Intelligence returns to the network.',
  },
]

const EDIT_WINDOWS = [
  { in: [-1, -0.5], out: [0.055, 0.095] },
  { in: [0.185, 0.225], out: [0.27, 0.3] },
  { in: [0.3, 0.335], out: [0.425, 0.465] },
  { in: [0.49, 0.53], out: [0.62, 0.655] },
  { in: [0.655, 0.695], out: [0.79, 0.825] },
  { in: [0.86, 0.9], out: [2, 3] },
]

/* ---- hero canvas geometry --------------------------------------------------- */

const SPHERES = [
  { key: 'zen', name: 'ZenHyre', sub: 'Verified talent network', size: 130, tint: 'rgba(201, 192, 250, 0.14)', F: [0, -150], z: 60, drift: 'drift-a', breathe: 'breathe-a', side: 'right', target: 0.57 },
  { key: 'hermit', name: 'Hermit', sub: 'AI hiring agent', size: 112, tint: 'rgba(247, 201, 216, 0.13)', F: [-180, 105], z: -40, drift: 'drift-b', breathe: 'breathe-b', side: 'left', target: 0.36 },
  { key: 'arena', name: 'Arena X', sub: 'Capability evaluation', size: 116, tint: 'rgba(203, 212, 232, 0.13)', F: [180, 105], z: 0, drift: 'drift-c', breathe: 'breathe-c', side: 'right', target: 0.72 },
]
const CENTROID = [0, 20]
SPHERES.forEach((s) => {
  const dx = s.F[0] - CENTROID[0]
  const dy = s.F[1] - CENTROID[1]
  s.r0 = Math.hypot(dx, dy)
  s.a0 = Math.atan2(dy, dx)
})

const ARCS = [
  { key: 'zen-hermit', between: ['zen', 'hermit'], d: 'M0 -150 Q -124 -40 -180 105', delay: 0 },
  { key: 'zen-arena', between: ['zen', 'arena'], d: 'M0 -150 Q 124 -40 180 105', delay: 1.3 },
  { key: 'hermit-arena', between: ['hermit', 'arena'], d: 'M-180 105 Q 0 40 180 105', delay: 2.6 },
]

const HERO_PARTICLES = [
  { arc: 0, dur: 8, delay: -2 },
  { arc: 0, dur: 9.5, delay: -6 },
  { arc: 0, dur: 7.2, delay: -4.5 },
  { arc: 1, dur: 8.5, delay: -1 },
  { arc: 1, dur: 7.6, delay: -5 },
  { arc: 1, dur: 10, delay: -8 },
  { arc: 2, dur: 9, delay: -3 },
  { arc: 2, dur: 7.9, delay: -6.5 },
]

const shiftFor = (self, active) => {
  if (!active || self.key === active) return 'translate3d(0,0,0)'
  const a = SPHERES.find((s) => s.key === active)
  const dx = a.F[0] - self.F[0]
  const dy = a.F[1] - self.F[1]
  const len = Math.hypot(dx, dy) || 1
  return `translate3d(${((dx / len) * 10).toFixed(1)}px, ${((dy / len) * 10).toFixed(1)}px, 0)`
}

/* ---- pipeline spine: the backbone --------------------------------------------
   Six stages on a gently waving full-width line (viewport-centered space,
   wrapper scaled by k). Panels emerge from nodes 0/3/4; the card docks at 5. */

const SPINE_Y = 256
const SPINE_PTS = [
  [-510, SPINE_Y - 14],
  [-306, SPINE_Y + 10],
  [-102, SPINE_Y - 8],
  [102, SPINE_Y + 14],
  [306, SPINE_Y - 10],
  [510, SPINE_Y + 6],
]

const SPINE6 = [
  { key: 'requirement', title: 'Requirement', desc: 'Share your hiring need naturally.', icon: 'requirement', at: 0.3 },
  { key: 'search', title: 'AI Search', desc: 'Hermit searches the right talent instantly.', icon: 'search', at: 0.37 },
  { key: 'matches', title: 'Top Matches', desc: 'Curated candidates ready for review.', icon: 'matches', at: 0.445 },
  { key: 'verification', title: 'Verification', desc: 'Identity and trust confirmed.', icon: 'verification', at: 0.575 },
  { key: 'capability', title: 'Capability', desc: 'Real skills measured.', icon: 'capability', at: 0.72 },
  { key: 'offer', title: 'Offer & Hire', desc: 'Move from shortlist to signed offer.', icon: 'offer', at: 0.878 },
]

/* smooth cubic through the wave points */
const SPINE_PATH_D = SPINE_PTS.reduce((d, [x, y], i, a) => {
  if (i === 0) return `M ${x} ${y}`
  const [px, py] = a[i - 1]
  const dx = (x - px) / 2.4
  return `${d} C ${px + dx} ${py}, ${x - dx} ${y}, ${x} ${y}`
}, '')

const chipWin = (i) => [0.235 + 0.008 * i, 0.262 + 0.008 * i]
/* stage 9: chips glint right → left as intelligence returns */
const GLINT_BACK = [0.972, 0.955, 0.938, 0.921, 0.904, 0.887]
const glint = (t, start) => Math.sin(Math.PI * segLin(t, start, start + 0.024))

const PANEL_GEO = {
  hermit: { chipIdx: 0, dx: -75, em: [0.285, 0.35], rec: [0.5, 0.56] },
  zen: { chipIdx: 3, dx: 0, em: [0.5, 0.565], rec: [0.64, 0.685] },
  arena: { chipIdx: 4, dx: 70, em: [0.64, 0.705], rec: [0.8, 0.855], collapse: true },
}

/* ---- content: chat, candidate, network, capability -------------------------- */

const CANDIDATES = [
  { id: 'IITB_CS_25', track: 'Backend + Systems', elo: '1840' },
  { id: 'IITD_EE_24', track: 'ML Infra', elo: '1765' },
  { id: 'IITM_CS_26', track: 'Full-stack', elo: '1710' },
]

const CHAT_BEATS = {
  request: [0.335, 0.345],
  typing: [0.343, 0.356],
  searching: [0.356, 0.366],
  chips: [0.368, 0.386],
  msa: [0.392, 0.402],
  verify: [0.402, 0.412],
  ticks: [0.408, 0.429],
  offer: [0.427, 0.437],
}

const VERIFY_TICKS = ['Identity', 'Transcript', 'References']

const NET_CHIPS = [
  { id: 'IITB_EE_24', campus: 'IITB', track: 'Silicon', elo: '1702', x: -168, y: -128 },
  { id: 'IITD_CS_25', campus: 'IITD', track: 'Systems', elo: '1788', x: -30, y: -152 },
  { id: 'IITM_AE_24', campus: 'IITM', track: 'Controls', elo: '1671', x: 118, y: -132 },
  { id: 'IITK_CS_26', campus: 'IITK', track: 'ML Infra', elo: '1745', x: 176, y: -58 },
  { id: 'IITB_CS_24', campus: 'IITB', track: 'Backend', elo: '1810', x: -184, y: -22 },
  { id: 'IITH_CS_25', campus: 'IITH', track: 'Platform', elo: '1729', x: 172, y: 64 },
  { id: 'IITD_MA_25', campus: 'IITD', track: 'Quant', elo: '1764', x: -172, y: 88 },
  { id: 'IITKGP_CS_24', campus: 'IITKGP', track: 'Infra', elo: '1717', x: -52, y: 148 },
  { id: 'IITB_CS_26', campus: 'IITB', track: 'Full-stack', elo: '1694', x: 96, y: 152 },
]
const NET_LINKS = [
  [0, 4],
  [1, 3],
  [2, 5],
  [4, 6],
  [3, 5],
  [6, 7],
  [5, 8],
  [1, 8],
]

const RADAR_AXES = ['Systems', 'ML', 'Product', 'Comms', 'Velocity', 'Code']
const RADAR_VALS = [0.92, 0.72, 0.64, 0.78, 0.86, 0.9]
const AXIS_INFO = {
  Systems: 'Architecture depth from evaluated build tasks',
  ML: 'Applied modeling from scored projects',
  Product: 'Product sense from case evaluations',
  Comms: 'Communication from structured reviews',
  Velocity: 'Shipping speed across timed tasks',
  Code: 'Code quality from reviewed submissions',
}
const CAP_TAGS = ['Systems depth', 'Code quality', 'High velocity']
const EVAL_ROWS = [
  { id: 'eval_042', task: 'distributed cache design', score: '92' },
  { id: 'eval_038', task: 'API hardening task', score: '88' },
  { id: 'eval_031', task: 'systems debug drill', score: '95' },
]

const LOOP_POINTS = [
  'Arena X',
  'Capability Signals',
  'ZenHyre',
  'Verified Identity',
  'Hermit',
  'Hiring Outcome',
  'Platform Intelligence',
  'Better Matching',
]

/* // PLACEHOLDER — replace with consented content (photos, names, quotes) */
const FOUNDER_QUOTES = [
  { company: 'Pocket FM', role: 'Founding Engineer', result: 'Hired in four days', quote: 'Hermit surfaced candidates we couldn’t find ourselves.' },
  { company: 'Pi42', role: 'Backend Lead', result: 'Offer accepted in one week', quote: 'The shortlist was already verified. We just interviewed.' },
  { company: 'Series A fintech', role: 'ML Engineer', result: 'Two hires, one mandate', quote: 'Arena X scores matched exactly what we saw on the job.' },
]
/* // PLACEHOLDER — replace with consented content (photos, names, quotes) */
const STUDENT_QUOTES = [
  { institute: 'IIT Bombay', company: 'Pocket FM', quote: 'One verification. Every opportunity after that was warm.' },
  { institute: 'IIT Delhi', company: 'Pi42', quote: 'My ELO did the talking. No cold applications.' },
  { institute: 'IIT Madras', company: 'Series A fintech', quote: 'The eval was hard. The offer was fast.' },
  { institute: 'IIT Kanpur', company: 'Stealth AI lab', quote: 'Verified once, matched twice. Signed in ten days.' },
]

/* Orbital navigation: eight stops on one invisible ring. t = desktop journey
   target, tm = mobile journey target, anchor = normal-flow section. */
const ORBIT_SECTIONS = [
  { label: 'Hero', icon: 'hero', t: 0, tm: 0 },
  { label: 'Pipeline', icon: 'pipeline', t: 0.24, tm: 0.2 },
  { label: 'Hermit', icon: 'hermit', t: 0.36, tm: 0.6 },
  { label: 'ZenHyre', icon: 'zenhyre', t: 0.57, tm: 0.755 },
  { label: 'Arena X', icon: 'arenax', t: 0.72, tm: 0.87 },
  { label: 'Loop', icon: 'loop', anchor: 'loop' },
  { label: 'Proof', icon: 'verification', anchor: 'proof' },
  { label: 'Start Hiring', icon: 'offer', anchor: 'start-hiring' },
]

const ORB_STEP = (Math.PI * 2) / ORBIT_SECTIONS.length
const wrapDelta = (d) => {
  const n = ORBIT_SECTIONS.length
  return ((((d + n / 2) % n) + n) % n) - n / 2
}

/* continuous orbit position inside each pinned journey (0..4) */
const orbitPosDesktop = (t) => segLin(t, 0.09, 0.2) + segLin(t, 0.285, 0.33) + segLin(t, 0.5, 0.55) + segLin(t, 0.64, 0.69)
const orbitPosMobile = (t) => segLin(t, 0.07, 0.19) + segLin(t, 0.5, 0.56) + segLin(t, 0.69, 0.725) + segLin(t, 0.815, 0.845)
/* + normal-flow stops from cached section tops */
const orbitPosBeyond = (y, m, vh) =>
  segLin(y, m.loopTop - 0.9 * vh, m.loopTop - 0.25 * vh) +
  segLin(y, m.proofTop - 0.85 * vh, m.proofTop - 0.25 * vh) +
  segLin(y, m.ctaTop - 0.85 * vh, m.ctaTop - 0.25 * vh)

/* per-frame orbit layout: manual depth (scale/opacity/z) + slight rotateY */
function applyOrbit(M, p, rx, ry) {
  for (let i = 0; i < ORBIT_SECTIONS.length; i++) {
    const el = M.get(`orb:${i}`)
    if (!el) continue
    let a = (i - p) * ORB_STEP
    a = Math.atan2(Math.sin(a), Math.cos(a))
    const d = (1 + Math.cos(a)) / 2
    const x = Math.sin(a) * rx
    const y = -(1 - d) * ry
    const s = 0.55 + 0.55 * d
    const o = d < 0.08 ? 0 : 0.2 + 0.8 * Math.pow(d, 1.6)
    w(el, 'transform', `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)}) rotateY(${(Math.sin(a) * -16).toFixed(2)}deg)`)
    w(el, 'opacity', o.toFixed(3))
    w(el, 'zIndex', String(10 + Math.round(d * 100)))
    w(el, 'pointerEvents', d > 0.3 ? 'auto' : 'none')
    const tier = d > 0.72 ? 0 : d > 0.4 ? 1 : 2
    if (el.__tier !== tier) {
      el.__tier = tier
      el.classList.remove('orb-blur-1', 'orb-blur-2')
      if (tier === 1) el.classList.add('orb-blur-1')
      if (tier === 2) el.classList.add('orb-blur-2')
    }
  }
}

/* ============================================================================
   Pure frame math (mirrored by the scratch Node test) — geo = {off, k}
   ========================================================================== */

function sphereFrame2(t, s) {
  const p = segLin(t, 0.08, 0.185)
  const e = easeOutExpo(p)
  const r = s.r0 * (1 - p * p * p)
  const a = s.a0 + 0.85 * e
  return {
    x: CENTROID[0] + Math.cos(a) * r,
    y: CENTROID[1] + Math.sin(a) * r,
    scale: 1 - 0.88 * e,
    opacity: 1 - seg(t, 0.165, 0.19),
    label: 1 - seg(t, 0.08, 0.115),
  }
}

function coreFrame(t, off, k) {
  const grow = seg(t, 0.105, 0.19)
  const s = 0.25 + 0.75 * grow
  const move = seg(t, 0.2, 0.245)
  return {
    opacity: seg(t, 0.105, 0.16) * (1 - 0.45 * seg(t, 0.285, 0.315)),
    bright: seg(t, 0.135, 0.19) * (1 - seg(t, 0.24, 0.28)),
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
  const shadow = clamp01(seg(t, 0.452, 0.47) - seg(t, 0.83, 0.86))
  return { op, x, y, sc, open, wipe, shadow }
}

const checkWin = (i) => [0.558 + 0.017 * i, 0.573 + 0.017 * i]
const axisWin = (i) => [0.706 + 0.009 * i, 0.722 + 0.009 * i]
const vertexWin = (i) => [0.735 + 0.007 * i, 0.755 + 0.007 * i]
const tagWin = (i) => [0.775 + 0.008 * i, 0.79 + 0.008 * i]
const evalWin = (i) => [0.72 + 0.014 * i, 0.736 + 0.014 * i]

/* cached style writer: skips writes when the value is unchanged */
const w = (el, prop, val) => {
  if (!el) return
  const cache = el.__s || (el.__s = {})
  if (cache[prop] === val) return
  cache[prop] = val
  el.style[prop] = val
}

/* ---- capability radar geometry ---------------------------------------------- */

const RCX = 100
const RCY = 78
const RR = 54
const radarPt = (v, i) => {
  const a = (Math.PI / 180) * (-90 + i * 60)
  return [RCX + Math.cos(a) * RR * v, RCY + Math.sin(a) * RR * v]
}
const radarPointsAt = (progress) =>
  RADAR_VALS.map((v, i) => {
    const p = radarPt(v * (progress ? progress[i] : 1), i)
    return `${p[0].toFixed(1)},${p[1].toFixed(1)}`
  }).join(' ')

/* ============================================================================
   Hooks + shared atoms
   ========================================================================== */

function useMedia(query) {
  const [match, setMatch] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

function useInView(animate, threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(!animate)
  useEffect(() => {
    if (!animate) {
      setInView(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [animate, threshold])
  return [ref, inView]
}

function FadeUp({ children, animate }) {
  const [ref, inView] = useInView(animate)
  return (
    <div ref={ref} className={animate ? `io-fade ${inView ? 'is-in' : ''}` : ''}>
      {children}
    </div>
  )
}

const springPress = { type: 'spring', stiffness: 420, damping: 26 }

function Ctas({ small }) {
  return (
    <div className="flex flex-wrap items-center gap-6 pt-2">
      <motion.a
        href={SIGNUP}
        className={`pill ${small ? 'pill-sm' : ''}`}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.985 }}
        transition={springPress}
      >
        Start Hiring
      </motion.a>
      <a href={`${CONTACT}?subject=Briefing%20request`} className="textlink">
        Schedule Briefing <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  )
}

/* gentle pointer-tilt for cards (Framer springs, ±1.5°) */
function Tilt({ children, className }) {
  const rx = useSpring(0, { stiffness: 160, damping: 18 })
  const ry = useSpring(0, { stiffness: 160, damping: 18 })
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 3)
    rx.set((0.5 - (e.clientY - r.top) / r.height) * 3)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }
  return (
    <motion.div
      className={`hover-shadow ${className || ''}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

/* Editorial block: hero, section, or product identity */
function Editorial({ block, heroTag }) {
  if (block.caption) {
    return <p className="max-w-[300px] text-[15px] leading-7 text-ink-2">{block.caption}</p>
  }
  const H = block.hero && heroTag ? 'h1' : 'h2'
  return (
    <div className="max-w-[520px]">
      {block.product ? (
        <a href={block.href} {...extProps(block.href)} className="group mb-7 flex items-center gap-3.5">
          <span className="icon-badge shrink-0">{ICONS[block.icon]}</span>
          <span>
            <span className="microlabel block transition-colors group-hover:text-ink" style={{ fontSize: 12 }}>
              {block.product}
            </span>
            <span className="mt-1 block text-[12px] leading-4 text-ink-3">{block.descriptor}</span>
          </span>
        </a>
      ) : block.label ? (
        <p className="microlabel mb-7">{block.label}</p>
      ) : null}
      <H
        className="display text-ink"
        style={{
          fontSize: block.hero ? 'clamp(44px, 5vw, 72px)' : 'clamp(32px, 3.6vw, 50px)',
          lineHeight: block.hero ? 1.04 : 1.08,
        }}
      >
        {block.heroLines
          ? block.heroLines.map((line, i) => (
              <span key={line} className="block">
                {line}
              </span>
            ))
          : block.heading}
      </H>
      <p
        className={`text-ink-2 ${block.hero ? 'mt-8 text-[20px]' : 'mt-5 text-[18px]'}`}
        style={{ maxWidth: block.hero ? '58ch' : '48ch', lineHeight: 1.6 }}
      >
        {block.body}
      </p>
      {block.cta && (
        <a href={block.href} {...extProps(block.href)} className="textlink mt-8 inline-flex">
          {block.cta} <span aria-hidden="true">&rarr;</span>
        </a>
      )}
      {block.hero && (
        <>
          <TrustedByLine className="my-8" />
          <Ctas />
        </>
      )}
    </div>
  )
}

/* quiet social proof inside the hero: reinforces trust without demanding
   attention (sits between description and CTAs) */
function TrustedByLine({ className = '', compact }) {
  return (
    <div className={className}>
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">Trusted By</p>
      <p
        className={`font-medium uppercase text-ink-3 ${compact ? 'text-[9.5px] leading-5 tracking-[0.08em]' : 'text-[10.5px] tracking-[0.1em]'}`}
        style={compact ? undefined : { whiteSpace: 'nowrap' }}
      >
        NVIDIA Inception
        <span className="mx-2.5 text-lav-deep" aria-hidden="true">
          •
        </span>
        SINE IIT Bombay
        <span className="mx-2.5 text-lav-deep" aria-hidden="true">
          •
        </span>
        IIT Bombay Alumni Association
      </p>
    </div>
  )
}

function CheckIcon({ regPath, className = '', size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path
        ref={regPath}
        d="M2.5 6.2 5 8.7l4.5-5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        style={regPath ? { strokeDasharray: 1 } : undefined}
      />
    </svg>
  )
}

/* ============================================================================
   Trust marquees (Proof section)
   ========================================================================== */

function LaneMark({ p }) {
  return (
    <span className="shrink-0" style={{ color: '#6B6B76' }}>
      <span className="hidden flex-col lg:flex">
        <span className="text-[13px] font-semibold tracking-[0.02em]">{p.name}</span>
        {p.sub ? (
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-3">{p.sub}</span>
        ) : (
          <span className="mt-0.5 text-[9px]" aria-hidden="true">
            &nbsp;
          </span>
        )}
      </span>
      <span className="text-[12px] font-medium lg:hidden">
        {p.name}
        {p.sub ? ` ${p.sub}` : ''}
      </span>
    </span>
  )
}

function TalentChip({ c }) {
  return (
    <span className="talent-chip px-4 py-1.5 text-[11px] text-ink-2 lg:text-[12px]">
      <span className="token text-ink">{c.id}</span>
      <span className="text-ink-3">·</span>
      <span>{c.track}</span>
      <span className="text-ink-3" aria-hidden="true">
        &rarr;
      </span>
      <span className="tnum font-medium">{c.to}</span>
      {c.check && <CheckIcon className="text-verified" size={11} />}
    </span>
  )
}

function Lane({ label, dir, dur, children }) {
  const half = (hidden) => (
    <div className="marquee-half gap-10 pr-10" aria-hidden={hidden ? 'true' : undefined}>
      {children}
    </div>
  )
  return (
    <div className="lg:flex lg:items-center lg:gap-8">
      <p className="microlabel mb-2 shrink-0 lg:mb-0 lg:w-56">{label}</p>
      <div className="marquee min-w-0 flex-1">
        <div className={`marquee-track ${dir}`} style={{ '--marquee-dur': dur }}>
          {half(false)}
          {half(true)}
        </div>
      </div>
    </div>
  )
}

function TrustLanes() {
  return (
    <div className="space-y-4">
      <Lane label="Backed and partnered by" dir="to-left" dur="35s">
        {PARTNERS.map((p) => (
          <LaneMark key={p.name} p={p} />
        ))}
      </Lane>
      <Lane label="Trusted by exceptional talent" dir="to-right" dur="42s">
        {PLACEMENTS.map((c) => (
          <TalentChip key={c.id} c={c} />
        ))}
      </Lane>
    </div>
  )
}

/* ============================================================================
   Living ecosystem canvas pieces
   ========================================================================== */

function Sphere({ cfg, onSelect, anchorRef, labelRef, interactive, staticTransform, onHover, labelBelow, active, shiftTo }) {
  const half = cfg.size / 2
  const Tag = interactive ? 'button' : 'div'
  return (
    <div
      ref={anchorRef}
      className={`sphere-anchor absolute left-1/2 top-1/2 h-0 w-0 ${active ? 'node-active' : ''}`}
      style={staticTransform ? { transform: staticTransform } : undefined}
    >
      <div className="shift-wrap" style={{ transform: shiftTo || 'translate3d(0,0,0)' }}>
        <div className={cfg.drift}>
          <div className={cfg.breathe}>
            <Tag
              type={interactive ? 'button' : undefined}
              aria-label={interactive ? `Go to ${cfg.name}` : undefined}
              aria-hidden={interactive ? undefined : 'true'}
              className="sphere-btn"
              style={{
                position: 'absolute',
                left: -half,
                top: -half,
                width: cfg.size,
                height: cfg.size,
                '--sphere-tint': cfg.tint,
                cursor: interactive ? 'pointer' : 'default',
              }}
              onClick={interactive ? () => onSelect(cfg) : undefined}
              onMouseEnter={interactive && onHover ? () => onHover(cfg.key) : undefined}
              onMouseLeave={interactive && onHover ? () => onHover(null) : undefined}
            >
              <span className="node-glow" />
              <span className="sphere-tint" />
              <span className="sphere-spec" />
              <span className="sphere-rim" />
            </Tag>
            <div
              ref={labelRef}
              className={`sphere-label ${labelBelow ? 'text-center' : cfg.side === 'right' ? 'top-[-10px]' : 'top-[-10px] text-right'}`}
              style={labelBelow ? { left: -90, width: 180, top: half + 14 } : cfg.side === 'right' ? { left: half + 20 } : { right: half + 20 }}
            >
              <p className="microlabel sphere-label-name transition-colors">{cfg.name}</p>
              <p className="sphere-label-sub mt-1 text-[11px] text-ink-3 transition-colors">{cfg.sub}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArcField({ hoverKey, activeKey }) {
  const hot = hoverKey || activeKey
  return (
    <svg
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      width="560"
      height="480"
      viewBox="-280 -240 560 480"
      fill="none"
      aria-hidden="true"
    >
      {ARCS.map((arc) => (
        <g key={arc.key} className={hot && arc.between.includes(hot) ? 'arc-hot' : ''}>
          <path className="arc-base" d={arc.d} strokeWidth="1.25" />
          <path className="arc-pulse" d={arc.d} strokeWidth="1.5" pathLength="100" strokeLinecap="round" style={{ animationDelay: `${arc.delay}s` }} />
        </g>
      ))}
      <circle className="axis-dot" cx="0" cy="16" r="3.5" fill="#CFC7F8" />
      <circle cx="0" cy="16" r="8" stroke="rgba(150,140,220,0.35)" strokeWidth="1" />
    </svg>
  )
}

function HeroParticles() {
  return (
    <div className="absolute left-1/2 top-1/2 h-0 w-0" aria-hidden="true">
      {HERO_PARTICLES.map((p, i) => (
        <span
          key={i}
          className="flow-particle"
          style={{ offsetPath: `path("${ARCS[p.arc].d}")`, '--pt-dur': `${p.dur}s`, '--pt-delay': `${p.delay}s` }}
        />
      ))}
    </div>
  )
}

/* ============================================================================
   Product panel content
   ========================================================================== */

function Bubble({ from, children, shimmer }) {
  return (
    <div className={`flex ${from === 'you' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-[13px] leading-5 ${
          from === 'you' ? 'rounded-br-md bg-lav/60 text-ink' : `rounded-bl-md border border-hairline bg-white/70 text-ink-2 ${shimmer ? 'shimmer' : ''}`
        }`}
      >
        {children}
      </div>
    </div>
  )
}

/* Scroll-scrubbed Hermit conversation; the pipeline line continues as the
   thread beside the messages. Composed mode renders everything visible. */
function HermitChat({ reg, composed }) {
  const r = (k) => (composed ? undefined : reg(k))
  const hidden = composed ? {} : { opacity: 0 }
  return (
    <div className="relative space-y-2.5 pl-5 pt-4">
      <span className="chat-thread" aria-hidden="true" />
      <div style={hidden} ref={r('chat:request')}>
        <Bubble from="you">Need a founding backend engineer. Equity + competitive comp. Start in under 3 weeks.</Bubble>
      </div>
      <div className="relative h-10">
        <div style={hidden} ref={r('chat:typing')} className="absolute inset-0">
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-hairline bg-white/70 px-4 py-3">
              <span className="inline-flex items-center gap-1" aria-label="Hermit is typing">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-3" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </span>
            </div>
          </div>
        </div>
        <div style={hidden} ref={r('chat:searching')} className="absolute inset-0">
          <Bubble from="hermit" shimmer>
            Searching network · {fmtInt(STATS.profiles)} verified profiles
          </Bubble>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-1">
        {CANDIDATES.map((c, i) => (
          <span key={c.id} ref={r(`chat:chip:${i}`)} style={hidden} className="talent-chip px-3 py-1.5 text-[12px] text-ink-2">
            <span className="token text-ink">{c.id}</span>
            <span className="text-ink-3">·</span>
            {c.track}
            <span className="tnum text-ink-3">ELO {c.elo}</span>
          </span>
        ))}
      </div>
      <div style={hidden} ref={r('chat:msa')}>
        <Bubble from="hermit">
          <svg width="11" height="13" viewBox="0 0 11 13" className="mr-1.5 inline -mt-0.5" aria-hidden="true">
            <path d="M1 1h6l3 3v8H1z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M3 6.5h5M3 9h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          MSA prepared for signature.
        </Bubble>
      </div>
      <div style={hidden} ref={r('chat:verify')}>
        <Bubble from="hermit">
          Background verification running.
          <span className="mt-2 flex gap-4">
            {VERIFY_TICKS.map((k, i) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-[11px] text-ink-3">
                <CheckIcon regPath={composed ? undefined : reg(`tick:${i}`)} className="text-verified" size={11} />
                {k}
              </span>
            ))}
          </span>
        </Bubble>
      </div>
      <div style={hidden} ref={r('chat:offer')}>
        <Bubble from="hermit">Offer ready. Candidate holding for your confirmation.</Bubble>
      </div>
    </div>
  )
}

function HermitPanel({ live, composed, reg, shellRef, contentRef }) {
  return (
    <div ref={shellRef} className={`${live ? 'nvl-glass' : 'glass-flat'} w-full overflow-hidden`} style={{ borderRadius: 24 }}>
      <div ref={contentRef} className="p-6">
        <div className="flex items-center gap-3 border-b border-hairline pb-4">
          <span className="icon-badge icon-badge-sm shrink-0">{ICONS.hermit}</span>
          <div>
            <p className="text-[15px] font-semibold text-ink">Hermit</p>
            <p className="mt-0.5 text-[12px] text-ink-3">AI hiring agent · WhatsApp</p>
          </div>
        </div>
        <HermitChat reg={reg} composed={composed} />
      </div>
    </div>
  )
}

/* ZenHyre living verified network */
function ZenNetworkPanel({ live, shellRef, contentRef, children }) {
  const [hover, setHover] = useState(null)
  return (
    <div ref={shellRef} className={`${live ? 'nvl-glass' : 'glass-flat'} w-full overflow-hidden`} style={{ borderRadius: 24 }}>
      <div ref={contentRef} className="p-6">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <span className="icon-badge icon-badge-sm shrink-0">{ICONS.zenhyre}</span>
            <div>
              <p className="text-[15px] font-semibold text-ink">ZenHyre</p>
              <p className="mt-0.5 text-[12px] text-ink-3">Living verified network · {fmtInt(STATS.profiles)} profiles</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-verified" aria-hidden="true" />
            Live
          </span>
        </div>
        <div className="relative mx-auto h-[340px]" style={{ maxWidth: 420 }}>
          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="420" height="340" viewBox="-210 -170 420 340" fill="none" aria-hidden="true">
            {NET_LINKS.map(([a, b], i) => (
              <line
                key={i}
                className={`net-line ${hover === a || hover === b ? 'net-hot' : ''}`}
                x1={NET_CHIPS[a].x}
                y1={NET_CHIPS[a].y}
                x2={NET_CHIPS[b].x}
                y2={NET_CHIPS[b].y}
                strokeWidth="1"
              />
            ))}
          </svg>
          {NET_CHIPS.map((c, i) => (
            <div
              key={c.id}
              className={`absolute left-1/2 top-1/2 ${['drift-a', 'drift-b', 'drift-c'][i % 3]}`}
              style={{ transform: `translate3d(${c.x}px, ${c.y}px, 0)` }}
            >
              <button
                type="button"
                className="talent-chip -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] text-ink-2"
                style={{ cursor: 'default' }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                aria-label={`${c.id}, ${c.track}, ELO ${c.elo}`}
              >
                <span className="token text-[10px] text-ink">{c.id}</span>
                <span className="badge-pulse inline-flex text-verified" style={{ animationDelay: `${(i % 5) * 0.7}s` }}>
                  <CheckIcon size={9} />
                </span>
              </button>
              {hover === i && (
                <div className="talent-chip absolute left-1/2 top-3 -translate-x-1/2 px-2.5 py-1 text-[9.5px] text-ink-3" style={{ whiteSpace: 'nowrap' }}>
                  {c.campus} · {c.track} · <span className="tnum">ELO {c.elo}</span>
                </div>
              )}
            </div>
          ))}
          {children}
        </div>
      </div>
    </div>
  )
}

/* Arena X frame: header + room for the traveling card + eval stream */
function ArenaFrame({ live, shellRef, contentRef, reg, composed, children }) {
  const hidden = composed ? {} : { opacity: 0 }
  return (
    <div ref={shellRef} className={`${live ? 'nvl-glass' : 'glass-flat'} w-full overflow-hidden`} style={{ borderRadius: 24 }}>
      <div ref={contentRef} className="p-6">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <span className="icon-badge icon-badge-sm shrink-0">{ICONS.arenax}</span>
            <div>
              <p className="text-[15px] font-semibold text-ink">Arena X</p>
              <p className="mt-0.5 text-[12px] text-ink-3">Capability evaluation</p>
            </div>
          </div>
          <p className="token text-[12px] text-ink-3">live eval stream</p>
        </div>
        <div className={composed ? '' : 'h-[300px]'}>{children}</div>
        <div className="space-y-2 border-t border-hairline pt-3">
          {EVAL_ROWS.map((row, i) => (
            <p key={row.id} ref={composed ? undefined : reg(`eval:${i}`)} style={hidden} className="tnum flex justify-between text-[11px] text-ink-3">
              <span>
                <span className="token text-ink-2">{row.id}</span> · {row.task}
              </span>
              <span className="font-medium text-ink">{row.score}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---- Candidate card faces ----------------------------------------------------
   ONE persistent card. In engine mode it mounts once at the journey root and
   is transformed continuously across Stages 5–8. */

const PROFILE_CHECKS = ['Identity verified', 'Transcript confirmed', 'Projects attached', 'References verified']

function ProfileFace({ reg, composed }) {
  return (
    <ul className="space-y-3 px-5 pb-5 pt-3">
      {PROFILE_CHECKS.map((line, i) => (
        <li key={line} className="flex items-center gap-2.5 text-[13px] text-ink-2">
          <CheckIcon regPath={composed ? undefined : reg(`check:${i}`)} className="shrink-0 text-verified" />
          {line}
        </li>
      ))}
    </ul>
  )
}

function CapabilityFace({ reg, composed }) {
  const [tip, setTip] = useState(null)
  const r = (k) => (composed ? undefined : reg(k))
  return (
    <div className="relative px-5 pb-3 pt-2">
      <svg viewBox="0 0 200 156" className="mx-auto w-[200px]" role="img" aria-label="Capability radar built from evaluated tasks">
        {[1 / 3, 2 / 3, 1].map((ring) => (
          <polygon
            key={ring}
            points={RADAR_VALS.map((_, i) => radarPt(ring, i).map((n) => n.toFixed(1)).join(',')).join(' ')}
            fill="none"
            stroke="#E9E9EF"
            strokeWidth="1"
          />
        ))}
        {RADAR_AXES.map((label, i) => {
          const [x, y] = radarPt(1, i)
          const hot = tip === i
          const dim = tip !== null && !hot
          return (
            <g key={label} onMouseEnter={() => setTip(i)} onMouseLeave={() => setTip(null)} style={{ cursor: 'default' }}>
              <line
                ref={r(`axis:${i}`)}
                x1={RCX}
                y1={RCY}
                x2={x}
                y2={y}
                stroke={hot ? '#6E5BD8' : '#E2DFF0'}
                strokeOpacity={dim ? 0.45 : 1}
                strokeWidth={hot ? 1.4 : 1}
                pathLength="1"
                style={composed ? undefined : { strokeDasharray: 1, strokeDashoffset: 1 }}
              />
              <text
                x={RCX + (x - RCX) * 1.24}
                y={RCY + (y - RCY) * 1.22}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8.5"
                fontWeight="600"
                letterSpacing="0.08em"
                fill={hot ? '#17171C' : '#8A8A96'}
              >
                {label.toUpperCase()}
              </text>
            </g>
          )
        })}
        <polygon
          ref={r('poly')}
          points={composed ? radarPointsAt(null) : radarPointsAt(RADAR_VALS.map(() => 0))}
          fill="rgba(201,192,250,0.28)"
          stroke="#6E5BD8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {/* fixed-height explainer slot: no layout shift on hover */}
      <p className="h-8 px-1 pt-1 text-center text-[10.5px] leading-4 text-ink-3">
        {tip !== null ? `${RADAR_AXES[tip]} — ${AXIS_INFO[RADAR_AXES[tip]]}` : 'Hover a capability for detail'}
      </p>
      <div className="flex items-baseline justify-center gap-6">
        <p className="tnum text-[12px] text-ink-3">
          Code eval{' '}
          <span ref={r('score:eval')} className="font-semibold text-ink">
            {composed ? '94' : '0'}
          </span>
          /100
        </p>
        <p className="tnum text-[12px] text-ink-3">
          Systems{' '}
          <span ref={r('score:design')} className="font-semibold text-ink">
            {composed ? '9.2' : '0'}
          </span>
          /10
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-3">
        {CAP_TAGS.map((tag, i) => (
          <span key={tag} ref={r(`tag:${i}`)} style={composed ? undefined : { opacity: 0 }} className="talent-chip px-3 py-1 text-[10.5px] text-ink-2">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function CandidateCard({ reg }) {
  return (
    <div ref={reg('card')} className="absolute z-40" style={{ width: 300, opacity: 0, visibility: 'hidden', left: 0, top: 0, marginLeft: -150, marginTop: -166 }}>
      <div ref={reg('cardShadow')} className="absolute -inset-2 rounded-[28px]" style={{ opacity: 0, boxShadow: '0 32px 64px rgba(17,17,18,0.14)' }} aria-hidden="true" />
      <div ref={reg('cardClip')} className="glass-flat relative overflow-hidden" style={{ borderRadius: 24, height: 332 }}>
        <div className="flex h-[54px] items-center justify-between gap-3 border-b border-hairline px-4">
          <p className="token min-w-0 truncate text-[12px] text-ink" style={{ whiteSpace: 'nowrap' }}>
            {CANDIDATES[0].id} <span className="font-normal text-ink-3">· {CANDIDATES[0].track}</span>
          </p>
          <p className="tnum shrink-0 text-[11px] font-medium text-ink-2" style={{ whiteSpace: 'nowrap' }}>
            ELO {CANDIDATES[0].elo}
          </p>
        </div>
        <ProfileFace reg={reg} />
        <div ref={reg('faceC')} className="absolute inset-x-0 bottom-0 top-[54px] bg-white/95" style={{ clipPath: 'inset(0 0 0 100%)', visibility: 'hidden' }}>
          <CapabilityFace reg={reg} />
        </div>
      </div>
      <div ref={reg('dockCheck')} className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-white text-verified" style={{ opacity: 0 }}>
        <CheckIcon regPath={reg('dockCheckPath')} size={13} />
      </div>
    </div>
  )
}

/* ============================================================================
   applyFrame — every per-frame write (transform/opacity/clip only; radius
   only inside morph windows; all writes value-cached). g = {off, k}
   ========================================================================== */

function applyFrame(t, M, g) {
  const get = (k) => M.get(k)

  /* editorial */
  EDIT_WINDOWS.forEach((win, i) => {
    const el = get(`edit:${i}`)
    if (!el) return
    const fi = i === 0 ? 1 : seg(t, win.in[0], win.in[1])
    const fo = 1 - seg(t, win.out[0], win.out[1])
    const o = Math.min(fi, fo)
    w(el, 'opacity', o.toFixed(3))
    w(el, 'transform', `translate3d(0, ${((1 - fi) * 24 - (1 - fo) * 24).toFixed(2)}px, 0)`)
    w(el, 'visibility', o < 0.02 ? 'hidden' : 'visible')
  })

  /* hero network (arcs + particles) */
  {
    const el = get('heroNet')
    if (el) {
      const o = 1 - seg(t, 0.08, 0.135)
      w(el, 'opacity', o.toFixed(3))
      w(el, 'visibility', o < 0.02 ? 'hidden' : 'visible')
    }
  }

  /* spheres spiral into the core */
  SPHERES.forEach((s) => {
    const el = get(`sphere:${s.key}`)
    if (!el) return
    const f = sphereFrame2(t, s)
    w(el, 'transform', `translate3d(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px, ${s.z}px) scale(${f.scale.toFixed(4)})`)
    w(el, 'opacity', f.opacity.toFixed(3))
    w(el, 'visibility', f.opacity < 0.02 ? 'hidden' : 'visible')
    const lb = get(`slabel:${s.key}`)
    if (lb) w(lb, 'opacity', f.label.toFixed(3))
  })

  /* intelligence core → travels to viewport center and becomes the spine */
  {
    const el = get('core')
    if (el) {
      const c = coreFrame(t, g.off, g.k)
      w(el, 'opacity', c.opacity.toFixed(3))
      w(el, 'transform', `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.sx.toFixed(4)}, ${c.sy.toFixed(4)})`)
      w(el, 'visibility', c.opacity < 0.02 ? 'hidden' : 'visible')
      const b = get('coreBright')
      if (b) w(b, 'opacity', c.bright.toFixed(3))
    }
  }

  /* spine path draws; riser bends up into Hermit */
  {
    const el = get('spinePath')
    if (el) w(el, 'strokeDashoffset', (1 - seg(t, 0.235, 0.3)).toFixed(4))
    const riser = get('riser')
    if (riser) {
      w(riser, 'strokeDashoffset', (1 - seg(t, 0.29, 0.35)).toFixed(4))
      w(riser, 'opacity', (1 - seg(t, 0.5, 0.53)).toFixed(3))
    }
    const flow = get('spineFlow')
    if (flow) {
      const o = seg(t, 0.3, 0.335)
      w(flow, 'opacity', o.toFixed(3))
      w(flow, 'visibility', o < 0.02 ? 'hidden' : 'visible')
    }
    const back = get('backflow')
    if (back) {
      const o = seg(t, 0.885, 0.915)
      w(back, 'opacity', o.toFixed(3))
      w(back, 'visibility', o < 0.02 ? 'hidden' : 'visible')
    }
  }

  /* stage cards grow from the spine; glint right→left in stage 9 */
  SPINE6.forEach((_, i) => {
    const el = get(`chipwrap:${i}`)
    if (!el) return
    const [a, b] = chipWin(i)
    const m = seg(t, a, b)
    w(el, 'opacity', m.toFixed(3))
    w(el, 'transform', `translate3d(0, ${(12 * (1 - m)).toFixed(2)}px, 0) scale(${(0.5 + 0.5 * m).toFixed(4)})`)
    const gl = get(`chipGlint:${i}`)
    if (gl) w(gl, 'opacity', glint(t, GLINT_BACK[i]).toFixed(3))
  })

  /* panels emerge from spine nodes */
  Object.entries(PANEL_GEO).forEach(([key, geo]) => {
    const wrap = get(`pwrap:${key}`)
    if (!wrap) return
    const p = panelFrame2(t, geo, g.off, g.k)
    w(wrap, 'opacity', p.opacity.toFixed(3))
    w(wrap, 'transform', `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) scale(${p.scale.toFixed(4)})`)
    w(wrap, 'visibility', p.opacity < 0.02 ? 'hidden' : 'visible')
    const shell = get(`pshell:${key}`)
    if (shell) w(shell, 'borderRadius', `${p.radius.toFixed(1)}px`)
    const content = get(`pcontent:${key}`)
    if (content) w(content, 'opacity', p.content.toFixed(3))
  })

  /* scrubbed conversation */
  {
    const row = (key, a, b, kill) => {
      const el = get(key)
      if (!el) return
      const o = seg(t, a, b) * (kill ? 1 - seg(t, kill[0], kill[1]) : 1)
      w(el, 'opacity', o.toFixed(3))
      w(el, 'transform', `translate3d(0, ${(8 * (1 - seg(t, a, b))).toFixed(2)}px, 0)`)
    }
    row('chat:request', ...CHAT_BEATS.request)
    row('chat:typing', CHAT_BEATS.typing[0], CHAT_BEATS.typing[0] + 0.006, [CHAT_BEATS.typing[1] - 0.004, CHAT_BEATS.typing[1]])
    row('chat:searching', ...CHAT_BEATS.searching)
    for (let i = 0; i < 3; i++) row(`chat:chip:${i}`, CHAT_BEATS.chips[0] + i * 0.006, CHAT_BEATS.chips[0] + 0.01 + i * 0.006)
    row('chat:msa', ...CHAT_BEATS.msa)
    row('chat:verify', ...CHAT_BEATS.verify)
    row('chat:offer', ...CHAT_BEATS.offer)
    for (let i = 0; i < 3; i++) {
      const el = get(`tick:${i}`)
      if (el) w(el, 'strokeDashoffset', (1 - seg(t, CHAT_BEATS.ticks[0] + i * 0.007, CHAT_BEATS.ticks[0] + 0.008 + i * 0.007)).toFixed(4))
    }
  }

  /* THE traveling candidate card */
  {
    const el = get('card')
    if (el) {
      const c = cardFrame(t, g.off, g.k)
      w(el, 'opacity', c.op.toFixed(3))
      w(el, 'visibility', c.op < 0.02 ? 'hidden' : 'visible')
      w(el, 'transform', `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.sc.toFixed(4)})`)
      const clip = get('cardClip')
      if (clip) {
        const bottom = 278 * (1 - c.open)
        const side = 10 * (1 - c.open)
        const r = 22 + 2 * c.open
        w(clip, 'clipPath', `inset(0px ${side.toFixed(1)}px ${bottom.toFixed(1)}px ${side.toFixed(1)}px round ${r.toFixed(1)}px)`)
      }
      const sh = get('cardShadow')
      if (sh) w(sh, 'opacity', c.shadow.toFixed(3))
      const faceC = get('faceC')
      if (faceC) {
        w(faceC, 'clipPath', `inset(0 0 0 ${(100 - 100 * c.wipe).toFixed(2)}%)`)
        w(faceC, 'visibility', c.wipe < 0.01 ? 'hidden' : 'visible')
      }
      for (let i = 0; i < 4; i++) {
        const ck = get(`check:${i}`)
        if (ck) w(ck, 'strokeDashoffset', (1 - seg(t, ...checkWin(i))).toFixed(4))
      }
      for (let i = 0; i < 6; i++) {
        const ax = get(`axis:${i}`)
        if (ax) w(ax, 'strokeDashoffset', (1 - seg(t, ...axisWin(i))).toFixed(4))
      }
      const poly = get('poly')
      if (poly) {
        const prog = RADAR_VALS.map((_, i) => easeOutBack(segLin(t, ...vertexWin(i))))
        const pts = radarPointsAt(prog)
        if (poly.__pts !== pts) {
          poly.__pts = pts
          poly.setAttribute('points', pts)
        }
      }
      const sEval = get('score:eval')
      if (sEval) {
        const v = String(Math.round(94 * seg(t, 0.72, 0.785)))
        if (sEval.__v !== v) {
          sEval.__v = v
          sEval.textContent = v
        }
      }
      const sDesign = get('score:design')
      if (sDesign) {
        const v = (9.2 * seg(t, 0.72, 0.785)).toFixed(1)
        if (sDesign.__v !== v) {
          sDesign.__v = v
          sDesign.textContent = v
        }
      }
      for (let i = 0; i < 3; i++) {
        const tag = get(`tag:${i}`)
        if (tag) w(tag, 'opacity', seg(t, ...tagWin(i)).toFixed(3))
      }
      const dock = get('dockCheck')
      if (dock) w(dock, 'opacity', seg(t, 0.872, 0.884).toFixed(3))
      const dockPath = get('dockCheckPath')
      if (dockPath) w(dockPath, 'strokeDashoffset', (1 - seg(t, 0.874, 0.892)).toFixed(4))
    }
  }

  /* arena eval stream rows tick in */
  for (let i = 0; i < EVAL_ROWS.length; i++) {
    const el = get(`eval:${i}`)
    if (el) {
      const o = seg(t, ...evalWin(i)) * (1 - seg(t, 0.8, 0.83))
      w(el, 'opacity', o.toFixed(3))
    }
  }
}

const activePanelFor = (t) => (t >= 0.35 && t < 0.5 ? 'hermit' : t >= 0.565 && t < 0.64 ? 'zen' : t >= 0.705 && t < 0.8 ? 'arena' : null)
const stagesPassed = (t) => SPINE6.reduce((n, s) => n + (t >= s.at ? 1 : 0), 0)

/* ============================================================================
   Orbital navigation — one rotating object shared by both engines
   ========================================================================== */

function OrbitalNav({ reg, active, onGo, onHover, compact }) {
  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center"
      style={{ top: compact ? 66 : 76 }}
      aria-label="Journey"
    >
      <div className={`orb-shell pointer-events-auto ${compact ? 'h-[52px] w-[276px]' : 'h-[60px] w-[600px]'}`}>
        <span className="orb-ring" aria-hidden="true" />
        {ORBIT_SECTIONS.map((s, i) => (
          <button
            key={s.label}
            ref={reg(`orb:${i}`)}
            type="button"
            className={`orb-item ${i === active ? 'orb-active' : ''}`}
            style={{ opacity: 0 }}
            onClick={() => onGo(s)}
            onMouseEnter={onHover ? () => onHover(i) : undefined}
            onMouseLeave={onHover ? () => onHover(null) : undefined}
            aria-label={`Go to ${s.label}`}
            aria-current={i === active ? 'step' : undefined}
          >
            <span className="orb-glass">
              <span className="orb-breathe flex items-center gap-1.5">
                <span className={compact ? 'scale-[0.65]' : 'scale-[0.8]'} style={{ display: 'inline-flex' }}>
                  {ICONS[s.icon]}
                </span>
                <span className="orb-label">{s.label}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}

/* ============================================================================
   The pinned master journey (desktop engine)
   ========================================================================== */

function ScrollStage() {
  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const fieldRef = useRef(null)
  const spineWrapRef = useRef(null)
  const M = useRef(new Map())
  const reg = useCallback((key) => (el) => {
    if (el) M.current.set(key, el)
  }, [])

  const measureRef = useRef({ top: 0, span: 1, loopTop: 0, proofTop: 0, ctaTop: 0, vh: 900 })
  const geoRef = useRef({ off: 300, k: 1 })
  const [activePanel, setActivePanel] = useState(null)
  const [railIdx, setRailIdx] = useState(0)
  const [activeStages, setActiveStages] = useState(0)
  const [hoverNode, setHoverNode] = useState(null)
  const [activeNode, setActiveNode] = useState('zen')
  const activePanelRef = useRef(null)
  const railRef = useRef(0)
  const stagesRef = useRef(0)
  const orbHover = useRef(null)
  const orbit = useRef({ pxT: 0, pyT: 0, px: 0, py: 0, dragT: 0, drag: 0, dragging: false, startX: 0, base: 0, moved: 0, suppressClick: false })

  /* hero activation cycle */
  useEffect(() => {
    if (hoverNode) {
      setActiveNode(hoverNode)
      return
    }
    if (railIdx > 0) return
    const order = ['zen', 'hermit', 'arena']
    const iv = setInterval(() => {
      setActiveNode((prev) => order[(order.indexOf(prev) + 1) % 3])
    }, 7000)
    return () => clearInterval(iv)
  }, [hoverNode, railIdx])

  useEffect(() => {
    let raf = 0
    let current = 0
    let lastRX = null
    let lastRY = null
    let orbCur = 0
    let orbVel = 0
    let orbBias = 0

    const measure = () => {
      const el = trackRef.current
      if (!el) return
      const m = measureRef.current
      m.top = el.getBoundingClientRect().top + window.scrollY
      m.span = Math.max(el.offsetHeight - window.innerHeight, 1)
      const loop = document.getElementById('loop')
      const proof = document.getElementById('proof')
      const cta = document.getElementById('start-hiring')
      m.loopTop = loop ? loop.getBoundingClientRect().top + window.scrollY : Infinity
      m.proofTop = proof ? proof.getBoundingClientRect().top + window.scrollY : Infinity
      m.ctaTop = cta ? cta.getBoundingClientRect().top + window.scrollY : Infinity
      m.vh = window.innerHeight
      /* spine fit + right-canvas offset (viewport-centered space) */
      const g = geoRef.current
      g.k = Math.min(1, (window.innerWidth / 2 - 96) / 510)
      if (stageRef.current) {
        const r = stageRef.current.getBoundingClientRect()
        g.off = r.left + r.width / 2 - window.innerWidth / 2
      }
      if (spineWrapRef.current) spineWrapRef.current.style.transform = `scale(${g.k.toFixed(4)})`
      const riser = M.current.get('riser')
      if (riser) {
        const ex = (g.off - 75) / g.k
        riser.setAttribute('d', `M ${SPINE_PTS[0][0]} ${SPINE_PTS[0][1] - 12} C ${SPINE_PTS[0][0]} 140, ${ex} 190, ${ex} ${Math.round(128 / g.k)}`)
      }
      applyFrame(current, M.current, g)
    }

    measure()
    applyFrame(0, M.current, geoRef.current)
    window.addEventListener('resize', measure)

    const loop = () => {
      const o = orbit.current
      const m = measureRef.current
      const target = clamp01((window.scrollY - m.top) / m.span)

      const d = target - current
      if (Math.abs(d) > 0.0003) {
        current += clamp(d * LERP, -MAX_STEP, MAX_STEP)
        applyFrame(current, M.current, geoRef.current)
        const ap = activePanelFor(current)
        if (ap !== activePanelRef.current) {
          activePanelRef.current = ap
          setActivePanel(ap)
        }
        const sp = stagesPassed(current)
        if (sp !== stagesRef.current) {
          stagesRef.current = sp
          setActiveStages(sp)
        }
      }

      /* orbital navigation: scroll-synchronized rotation with a soft spring
         (tiny overshoot) + hover nudge. Runs every frame; the cached writer
         makes settled frames free. */
      const y = window.scrollY
      const pTarget = orbitPosDesktop(current) + orbitPosBeyond(y, m, m.vh)
      const biasTarget = orbHover.current !== null ? clamp(wrapDelta(orbHover.current - pTarget) * 0.12, -0.3, 0.3) : 0
      orbBias += (biasTarget - orbBias) * 0.1
      orbVel = (orbVel + (pTarget + orbBias - orbCur) * 0.06) * 0.72
      orbCur += orbVel
      applyOrbit(M.current, orbCur, 252, 30)
      const idx = clamp(Math.round(pTarget), 0, ORBIT_SECTIONS.length - 1)
      if (idx !== railRef.current) {
        railRef.current = idx
        setRailIdx(idx)
      }

      o.px += (o.pxT - o.px) * 0.12
      o.py += (o.pyT - o.py) * 0.12
      o.drag += (o.dragT - o.drag) * (o.dragging ? 0.35 : 0.08)
      const rx = o.py
      const ry = 28 * segLin(current, 0, 0.22) + o.px + o.drag
      if (fieldRef.current && (lastRX === null || Math.abs(rx - lastRX) > 0.02 || Math.abs(ry - lastRY) > 0.02)) {
        lastRX = rx
        lastRY = ry
        fieldRef.current.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const goTo = (item) => {
    const m = measureRef.current
    if (item.anchor) {
      const top = item.anchor === 'loop' ? m.loopTop : item.anchor === 'proof' ? m.proofTop : m.ctaTop
      window.scrollTo({ top: Math.round(top - 40), behavior: 'smooth' })
    } else {
      window.scrollTo({ top: Math.round(m.top + item.t * m.span), behavior: 'smooth' })
    }
  }
  const onOrbHover = (i) => {
    orbHover.current = i
  }

  const onPointerMove = (e) => {
    const o = orbit.current
    if (o.dragging) {
      if (e.buttons === 0) {
        endDrag(e)
        return
      }
      o.moved += Math.abs(e.movementX) + Math.abs(e.movementY)
      o.dragT = clamp(o.base + (e.clientX - o.startX) * 0.15, -40, 40)
      return
    }
    const rect = stageRef.current.getBoundingClientRect()
    o.pxT = (clamp01((e.clientX - rect.left) / rect.width) - 0.5) * 14
    o.pyT = (0.5 - clamp01((e.clientY - rect.top) / rect.height)) * 10
  }
  const onPointerDown = (e) => {
    if (e.button !== 0) return
    const o = orbit.current
    o.dragging = true
    o.moved = 0
    o.startX = e.clientX
    o.base = o.drag
    stageRef.current.setPointerCapture(e.pointerId)
    stageRef.current.style.cursor = 'grabbing'
  }
  const endDrag = (e) => {
    const o = orbit.current
    if (!o.dragging) return
    o.dragging = false
    o.dragT = 0
    o.suppressClick = o.moved > 6
    o.moved = 0
    setTimeout(() => {
      o.suppressClick = false
    }, 0)
    if (stageRef.current) {
      if (e && stageRef.current.hasPointerCapture?.(e.pointerId)) stageRef.current.releasePointerCapture(e.pointerId)
      stageRef.current.style.cursor = 'grab'
    }
  }
  const onSelectSphere = (cfg) => {
    if (orbit.current.suppressClick) return
    const m = measureRef.current
    window.scrollTo({ top: Math.round(m.top + cfg.target * m.span), behavior: 'smooth' })
  }

  return (
    <>
      <OrbitalNav reg={reg} active={railIdx} onGo={goTo} onHover={onOrbHover} />
      <section ref={trackRef} id="products" className="relative" style={{ height: '600vh' }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-[1360px] grid-cols-12 items-center gap-8 px-12">
            {/* Left editorial */}
            <div className="relative col-span-5" style={{ minHeight: 480 }}>
              {EDITORIAL.map((block, i) => (
                <div key={i} ref={reg(`edit:${i}`)} className={`flex items-center ${i === 0 ? 'relative' : 'absolute inset-0'}`}>
                  <Editorial block={block} heroTag />
                </div>
              ))}
            </div>

            {/* Right canvas: the living hero system */}
            <div className="col-span-7">
              <div
                ref={stageRef}
                className={`relative h-[600px] ${railIdx > 0 ? 'stage-paused' : ''}`}
                style={{ perspective: '1200px', touchAction: 'pan-y', cursor: 'grab' }}
                onPointerMove={onPointerMove}
                onPointerLeave={(e) => {
                  orbit.current.pxT = 0
                  orbit.current.pyT = 0
                  endDrag(e)
                }}
                onPointerDown={onPointerDown}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                <div ref={fieldRef} className="pointer-events-none absolute inset-0 z-0" style={{ transformStyle: 'preserve-3d' }}>
                  <div ref={reg('heroNet')} className="hero-net pointer-events-none absolute inset-0">
                    <ArcField hoverKey={hoverNode} activeKey={activeNode} />
                    <HeroParticles />
                  </div>
                  {SPHERES.map((cfg) => (
                    <Sphere
                      key={cfg.key}
                      cfg={cfg}
                      interactive
                      active={activeNode === cfg.key}
                      shiftTo={shiftFor(cfg, activeNode)}
                      onSelect={onSelectSphere}
                      onHover={setHoverNode}
                      anchorRef={reg(`sphere:${cfg.key}`)}
                      labelRef={reg(`slabel:${cfg.key}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Journey layer: viewport-centered space for core, spine, panels, card.
              pointer-events-none so its large decorative SVGs (esp. the spine box)
              never intercept hover on the hero spheres below; interactive panels
              re-enable pointer events individually. */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[15] h-0 w-0">
            {/* intelligence core (becomes the spine) */}
            <div
              ref={reg('core')}
              className="absolute"
              style={{
                left: -45,
                top: -45,
                width: 90,
                height: 90,
                borderRadius: '50%',
                opacity: 0,
                background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.98), rgba(207,199,248,0.75) 55%, rgba(176,164,242,0.35) 100%)',
                boxShadow: '0 0 60px 12px rgba(176,164,242,0.35)',
              }}
              aria-hidden="true"
            >
              <div ref={reg('coreBright')} className="absolute inset-0" style={{ borderRadius: '50%', opacity: 0, background: 'radial-gradient(circle, rgba(255,255,255,1), transparent 70%)' }} />
            </div>

            {/* pipeline spine (scaled to fit) */}
            <div ref={spineWrapRef} className="absolute h-0 w-0">
              <svg className="absolute" style={{ left: -620, top: -60, overflow: 'visible' }} width="1240" height="500" viewBox="-620 -60 1240 500" fill="none" aria-hidden="true">
                <path
                  ref={reg('spinePath')}
                  d={SPINE_PATH_D}
                  stroke="rgba(150,140,220,0.4)"
                  strokeWidth="1.5"
                  pathLength="1"
                  style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                />
                <path ref={reg('riser')} d="M -510 244 C -510 140, -380 190, -380 150" stroke="rgba(150,140,220,0.4)" strokeWidth="1.25" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
              </svg>
              {SPINE6.map((s, i) => (
                <div
                  key={s.key}
                  className={`absolute h-0 w-0 ${i < activeStages ? 'chip-live' : ''}`}
                  style={{ left: SPINE_PTS[i][0], top: SPINE_PTS[i][1] }}
                >
                  <div ref={reg(`chipwrap:${i}`)} style={{ opacity: 0 }}>
                    <span ref={reg(`chipGlint:${i}`)} className="absolute -left-4 -top-4 h-8 w-8 rounded-full" style={{ opacity: 0, boxShadow: '0 0 26px 8px rgba(176,164,242,0.6)' }} aria-hidden="true" />
                    <span className="spine-dot" />
                    <div className="glass-flat absolute w-[176px] -translate-x-1/2 px-4 pb-3.5 pt-3.5 text-center" style={{ top: 18, borderRadius: 14 }}>
                      <span className="icon-badge icon-badge-sm mx-auto !flex">{ICONS[s.icon]}</span>
                      <p className="spine-title mt-2.5 text-[12px] font-semibold">{s.title}</p>
                      <p className="mt-1 text-[10.5px] leading-4 text-ink-3">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* intelligence flowing forward along the spine */}
              <div ref={reg('spineFlow')} className="absolute h-0 w-0" style={{ opacity: 0, visibility: 'hidden' }} aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="flow-particle" style={{ offsetPath: `path("${SPINE_PATH_D}")`, '--pt-dur': `${7 + i * 1.4}s`, '--pt-delay': `${-i * 2.7}s` }} />
                ))}
              </div>
              {/* stage 9: intelligence returning */}
              <div ref={reg('backflow')} className="absolute h-0 w-0" style={{ opacity: 0, visibility: 'hidden' }} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="flow-particle"
                    style={{ offsetPath: `path("${SPINE_PATH_D}")`, animationDirection: 'reverse', '--pt-dur': `${5.5 + i * 1.2}s`, '--pt-delay': `${-i * 2}s` }}
                  />
                ))}
              </div>
            </div>

            {/* product panels */}
            <div ref={reg('pwrap:hermit')} className="pointer-events-auto absolute z-10 w-[430px]" style={{ opacity: 0, visibility: 'hidden', marginLeft: -215, marginTop: -210 }}>
              <HermitPanel live={activePanel === 'hermit'} reg={reg} shellRef={reg('pshell:hermit')} contentRef={reg('pcontent:hermit')} />
            </div>
            <div ref={reg('pwrap:zen')} className="pointer-events-auto absolute z-20 w-[470px]" style={{ opacity: 0, visibility: 'hidden', marginLeft: -235, marginTop: -225 }}>
              <ZenNetworkPanel live={activePanel === 'zen'} shellRef={reg('pshell:zen')} contentRef={reg('pcontent:zen')} />
            </div>
            <div ref={reg('pwrap:arena')} className="pointer-events-auto absolute z-30 w-[430px]" style={{ opacity: 0, visibility: 'hidden', marginLeft: -215, marginTop: -235 }}>
              <ArenaFrame live={activePanel === 'arena'} reg={reg} shellRef={reg('pshell:arena')} contentRef={reg('pcontent:arena')} />
            </div>

            {/* THE persistent traveling candidate card */}
            <CandidateCard reg={reg} />
          </div>
        </div>
      </section>
    </>
  )
}

/* ============================================================================
   MOBILE JOURNEY — an independently directed keynote, not a shrunk desktop.

   One pinned ~1150vh track. Every viewport of scroll is one chapter:
   hero → signature convergence (three nodes physically merge into the core)
   → the core stretches VERTICALLY into a right-side timeline → six pipeline
   steps, one per screen → the top node expands into Hermit → the candidate
   card travels DOWNWARD through ZenHyre and Arena X → docks at Offer & Hire.
   Same machinery as desktop: one rAF loop, lerp, pure frame math.
   ========================================================================== */

const MSPHERES = [
  { key: 'zen', name: 'ZenHyre', sub: 'Verified talent network', size: 80, tint: 'rgba(201, 192, 250, 0.14)', F: [0, -95], z: 0, drift: 'drift-a', breathe: 'breathe-a', side: 'right' },
  { key: 'hermit', name: 'Hermit', sub: 'AI hiring agent', size: 70, tint: 'rgba(247, 201, 216, 0.13)', F: [-112, 64], z: 0, drift: 'drift-b', breathe: 'breathe-b', side: 'left' },
  { key: 'arena', name: 'Arena X', sub: 'Capability evaluation', size: 72, tint: 'rgba(203, 212, 232, 0.13)', F: [112, 64], z: 0, drift: 'drift-c', breathe: 'breathe-c', side: 'right' },
]
const MCENTROID = [0, 10]
MSPHERES.forEach((s) => {
  const dx = s.F[0] - MCENTROID[0]
  const dy = s.F[1] - MCENTROID[1]
  s.r0 = Math.hypot(dx, dy)
  s.a0 = Math.atan2(dy, dx)
})

const MARCS = [
  { key: 'zh', d: 'M0 -95 Q -78 -25 -112 64', delay: 0 },
  { key: 'za', d: 'M0 -95 Q 78 -25 112 64', delay: 1.3 },
  { key: 'ha', d: 'M-112 64 Q 0 25 112 64', delay: 2.6 },
]

/* vertical timeline: right side of the screen */
const MRAIL_X = 152
const MLINE = [-140, 170]
const mNodeY = (i) => -130 + 56 * i
const MSTEP_AT = [0.245, 0.297, 0.349, 0.401, 0.453, 0.505]

/* chapter text windows (top zone) */
const MCHAPTERS = [
  { hero: true, in: [-1, -0.5], out: [0.048, 0.075] },
  { message: ['Three products.', 'One intelligence.'], in: [0.06, 0.09], out: [0.15, 0.175] },
  ...SPINE6.map((s, i) => ({
    step: i,
    title: s.title,
    desc: s.desc,
    in: [0.237 + 0.052 * i, 0.257 + 0.052 * i],
    out: [0.279 + 0.052 * i, 0.286 + 0.052 * i],
  })),
  { productIdx: 2, in: [0.555, 0.585], out: [0.665, 0.69] },
  { productIdx: 3, in: [0.715, 0.745], out: [0.79, 0.812] },
  { productIdx: 4, in: [0.833, 0.86], out: [0.912, 0.932] },
  { end: true, in: [0.945, 0.975], out: [2, 3] },
]

/* scrubbed chat beats (mobile timeline) */
const MCHAT = {
  request: [0.585, 0.594],
  typing: [0.592, 0.6],
  typingKill: [0.601, 0.606],
  searching: [0.603, 0.611],
  chips: [0.613, 0.632],
  msa: [0.633, 0.641],
  verify: [0.641, 0.649],
  ticks: [0.646, 0.665],
  offer: [0.664, 0.672],
}

function mSphereFrame(t, s) {
  const p = segLin(t, 0.055, 0.13)
  const e = easeOutExpo(p)
  const r = s.r0 * (1 - p * p * p)
  const a = s.a0 + 0.85 * e
  return {
    x: MCENTROID[0] + Math.cos(a) * r,
    y: MCENTROID[1] + Math.sin(a) * r,
    scale: 1 - 0.85 * e,
    opacity: 1 - seg(t, 0.112, 0.133),
    label: 1 - seg(t, 0.055, 0.078),
  }
}

function mCoreFrame(t) {
  const grow = seg(t, 0.1, 0.135)
  const s = 0.25 + 0.75 * grow
  const move = seg(t, 0.15, 0.2)
  const stretch = seg(t, 0.16, 0.215)
  return {
    opacity: seg(t, 0.1, 0.135) * (1 - 0.5 * seg(t, 0.225, 0.255)),
    bright: seg(t, 0.115, 0.14) * (1 - seg(t, 0.185, 0.22)),
    x: MRAIL_X * move,
    y: 10 + 5 * move,
    sx: s * (1 - 0.952 * stretch),
    sy: s * (1 + 4.05 * stretch),
  }
}

function mHermitFrame(t) {
  const m = seg(t, 0.545, 0.59)
  const r = seg(t, 0.68, 0.712)
  const chip = [MRAIL_X, mNodeY(0)]
  const pos = [-22, 20]
  const x = chip[0] + (pos[0] - chip[0]) * m + (chip[0] - pos[0]) * r * 0.9
  const y = chip[1] + (pos[1] - chip[1]) * m + (chip[1] - pos[1]) * r * 0.9
  const scale = 0.12 + 0.88 * m - 0.78 * r
  const opacity = seg(t, 0.545, 0.562) * (1 - 0.92 * r)
  const radius = clamp(24 + 200 * (1 - m + r), 24, 200)
  const content = seg(t, 0.582, 0.598) * (1 - seg(t, 0.68, 0.7))
  return { x, y, scale, opacity, radius, content }
}

function mCardFrame(t) {
  const op = seg(t, 0.665, 0.678)
  let x = -22
  let y = 45
  let sc = 1
  const lift = sseg(t, 0.678, 0.702)
  y -= 85 * lift
  sc += 0.04 * lift
  const d1 = sseg(t, 0.702, 0.732)
  y += 70 * d1
  sc -= 0.04 * d1
  const d2 = sseg(t, 0.8, 0.835)
  y += 25 * d2
  const t3 = sseg(t, 0.928, 0.962)
  x += (130 - -22) * t3
  y += (150 - 55) * t3 - 24 * Math.sin(Math.PI * t3)
  sc -= 0.58 * t3
  sc += 0.04 * Math.sin(Math.PI * segLin(t, 0.956, 0.976))
  const open = clamp01(sseg(t, 0.735, 0.768) - sseg(t, 0.918, 0.945))
  const wipe = sseg(t, 0.806, 0.836)
  const shadow = clamp01(seg(t, 0.68, 0.695) - seg(t, 0.93, 0.95))
  return { op, x, y, sc, open, wipe, shadow }
}

const mCheckWin = (i) => [0.745 + 0.012 * i, 0.757 + 0.012 * i]
const mAxisWin = (i) => [0.845 + 0.007 * i, 0.856 + 0.007 * i]
const mVertexWin = (i) => [0.862 + 0.006 * i, 0.878 + 0.006 * i]
const mTagWin = (i) => [0.895 + 0.007 * i, 0.906 + 0.007 * i]

const mActiveNode = (t) => (t >= 0.92 ? 5 : t >= 0.83 ? 4 : t >= 0.71 ? 3 : t >= 0.545 ? 1 : MSTEP_AT.reduce((n, a) => n + (t >= a ? 1 : 0), 0) - 1)
const mPassed = (t) => MSTEP_AT.reduce((n, a) => n + (t >= a ? 1 : 0), 0)

const MAURA = [
  { x: -122, y: -62, id: 'IITD_CS_25' },
  { x: 92, y: -84, id: 'IITK_CS_26' },
  { x: -102, y: 122, id: 'IITB_CS_24' },
  { x: 102, y: 112, id: 'IITH_CS_25' },
]

function applyFrameM(t, M) {
  const get = (k) => M.get(k)

  /* chapter texts */
  MCHAPTERS.forEach((ch, i) => {
    const el = get(`mch:${i}`)
    if (!el) return
    const fi = i === 0 ? 1 : seg(t, ch.in[0], ch.in[1])
    const fo = 1 - seg(t, ch.out[0], ch.out[1])
    const o = Math.min(fi, fo)
    w(el, 'opacity', o.toFixed(3))
    w(el, 'transform', `translate3d(0, ${((1 - fi) * 18 - (1 - fo) * 18).toFixed(2)}px, 0)`)
    w(el, 'visibility', o < 0.02 ? 'hidden' : 'visible')
  })

  /* formation rises from its hero parking spot as convergence begins */
  {
    const form = get('mform')
    if (form) w(form, 'transform', `translate3d(0, ${(185 * (1 - seg(t, 0.05, 0.125))).toFixed(2)}px, 0)`)
    const net = get('mnet')
    if (net) {
      const o = 1 - seg(t, 0.055, 0.105)
      w(net, 'opacity', o.toFixed(3))
      w(net, 'visibility', o < 0.02 ? 'hidden' : 'visible')
    }
  }
  MSPHERES.forEach((s) => {
    const el = get(`msphere:${s.key}`)
    if (!el) return
    const f = mSphereFrame(t, s)
    w(el, 'transform', `translate3d(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px, 0) scale(${f.scale.toFixed(4)})`)
    w(el, 'opacity', f.opacity.toFixed(3))
    w(el, 'visibility', f.opacity < 0.02 ? 'hidden' : 'visible')
    const lb = get(`mslabel:${s.key}`)
    if (lb) w(lb, 'opacity', f.label.toFixed(3))
  })

  /* core → vertical timeline */
  {
    const el = get('mcore')
    if (el) {
      const c = mCoreFrame(t)
      w(el, 'opacity', c.opacity.toFixed(3))
      w(el, 'transform', `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.sx.toFixed(4)}, ${c.sy.toFixed(4)})`)
      w(el, 'visibility', c.opacity < 0.02 ? 'hidden' : 'visible')
      const b = get('mcoreBright')
      if (b) w(b, 'opacity', c.bright.toFixed(3))
    }
    const line = get('mline')
    if (line) w(line, 'strokeDashoffset', (1 - seg(t, 0.2, 0.245)).toFixed(4))
    const flow = get('mflow')
    if (flow) {
      const o = seg(t, 0.24, 0.27) * (1 - seg(t, 0.955, 0.975))
      w(flow, 'opacity', o.toFixed(3))
      w(flow, 'visibility', o < 0.02 ? 'hidden' : 'visible')
    }
    const back = get('mback')
    if (back) {
      const o = seg(t, 0.955, 0.985)
      w(back, 'opacity', o.toFixed(3))
      w(back, 'visibility', o < 0.02 ? 'hidden' : 'visible')
    }
  }

  /* timeline nodes pop in */
  for (let i = 0; i < 6; i++) {
    const el = get(`mnodewrap:${i}`)
    if (!el) continue
    const m = seg(t, 0.2 + 0.008 * i, 0.228 + 0.008 * i)
    w(el, 'opacity', m.toFixed(3))
    w(el, 'transform', `scale(${(0.4 + 0.6 * m).toFixed(4)})`)
  }

  /* Hermit card expands from the top node; chat scrubs */
  {
    const wrap = get('mhermit')
    if (wrap) {
      const p = mHermitFrame(t)
      w(wrap, 'opacity', p.opacity.toFixed(3))
      w(wrap, 'transform', `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) scale(${p.scale.toFixed(4)})`)
      w(wrap, 'visibility', p.opacity < 0.02 ? 'hidden' : 'visible')
      const shell = get('mhermitShell')
      if (shell) w(shell, 'borderRadius', `${p.radius.toFixed(1)}px`)
      const content = get('mhermitContent')
      if (content) w(content, 'opacity', p.content.toFixed(3))
    }
    const row = (key, a, b, kill) => {
      const el = get(key)
      if (!el) return
      const o = seg(t, a, b) * (kill ? 1 - seg(t, kill[0], kill[1]) : 1)
      w(el, 'opacity', o.toFixed(3))
      w(el, 'transform', `translate3d(0, ${(8 * (1 - seg(t, a, b))).toFixed(2)}px, 0)`)
    }
    row('chat:request', ...MCHAT.request)
    row('chat:typing', MCHAT.typing[0], MCHAT.typing[1], MCHAT.typingKill)
    row('chat:searching', ...MCHAT.searching)
    for (let i = 0; i < 3; i++) row(`chat:chip:${i}`, MCHAT.chips[0] + i * 0.005, MCHAT.chips[0] + 0.008 + i * 0.005)
    row('chat:msa', ...MCHAT.msa)
    row('chat:verify', ...MCHAT.verify)
    row('chat:offer', ...MCHAT.offer)
    for (let i = 0; i < 3; i++) {
      const el = get(`tick:${i}`)
      if (el) w(el, 'strokeDashoffset', (1 - seg(t, MCHAT.ticks[0] + i * 0.006, MCHAT.ticks[0] + 0.007 + i * 0.006)).toFixed(4))
    }
  }

  /* ZenHyre aura around the traveling card */
  {
    const el = get('maura')
    if (el) {
      const o = seg(t, 0.72, 0.75) * (1 - seg(t, 0.795, 0.815))
      w(el, 'opacity', o.toFixed(3))
      w(el, 'visibility', o < 0.02 ? 'hidden' : 'visible')
    }
  }

  /* THE candidate card — same persistent element, traveling downward */
  {
    const el = get('card')
    if (el) {
      const c = mCardFrame(t)
      w(el, 'opacity', c.op.toFixed(3))
      w(el, 'visibility', c.op < 0.02 ? 'hidden' : 'visible')
      w(el, 'transform', `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.sc.toFixed(4)})`)
      const clip = get('cardClip')
      if (clip) {
        const bottom = 278 * (1 - c.open)
        const side = 10 * (1 - c.open)
        const r = 22 + 2 * c.open
        w(clip, 'clipPath', `inset(0px ${side.toFixed(1)}px ${bottom.toFixed(1)}px ${side.toFixed(1)}px round ${r.toFixed(1)}px)`)
      }
      const sh = get('cardShadow')
      if (sh) w(sh, 'opacity', c.shadow.toFixed(3))
      const faceC = get('faceC')
      if (faceC) {
        w(faceC, 'clipPath', `inset(0 0 0 ${(100 - 100 * c.wipe).toFixed(2)}%)`)
        w(faceC, 'visibility', c.wipe < 0.01 ? 'hidden' : 'visible')
      }
      for (let i = 0; i < 4; i++) {
        const ck = get(`check:${i}`)
        if (ck) w(ck, 'strokeDashoffset', (1 - seg(t, ...mCheckWin(i))).toFixed(4))
      }
      for (let i = 0; i < 6; i++) {
        const ax = get(`axis:${i}`)
        if (ax) w(ax, 'strokeDashoffset', (1 - seg(t, ...mAxisWin(i))).toFixed(4))
      }
      const poly = get('poly')
      if (poly) {
        const prog = RADAR_VALS.map((_, i) => easeOutBack(segLin(t, ...mVertexWin(i))))
        const pts = radarPointsAt(prog)
        if (poly.__pts !== pts) {
          poly.__pts = pts
          poly.setAttribute('points', pts)
        }
      }
      const sEval = get('score:eval')
      if (sEval) {
        const v = String(Math.round(94 * seg(t, 0.86, 0.905)))
        if (sEval.__v !== v) {
          sEval.__v = v
          sEval.textContent = v
        }
      }
      const sDesign = get('score:design')
      if (sDesign) {
        const v = (9.2 * seg(t, 0.86, 0.905)).toFixed(1)
        if (sDesign.__v !== v) {
          sDesign.__v = v
          sDesign.textContent = v
        }
      }
      for (let i = 0; i < 3; i++) {
        const tag = get(`tag:${i}`)
        if (tag) w(tag, 'opacity', seg(t, ...mTagWin(i)).toFixed(3))
      }
      const dock = get('dockCheck')
      if (dock) w(dock, 'opacity', seg(t, 0.962, 0.972).toFixed(3))
      const dockPath = get('dockCheckPath')
      if (dockPath) w(dockPath, 'strokeDashoffset', (1 - seg(t, 0.964, 0.98)).toFixed(4))
    }
  }
}

function MChapterText({ ch }) {
  if (ch.hero) {
    return (
      <div>
        <h1 className="display text-ink" style={{ fontSize: 'clamp(36px, 10.5vw, 46px)', lineHeight: 1.06 }}>
          {EDITORIAL[0].heroLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-4 text-[15px] text-ink-2" style={{ lineHeight: 1.6 }}>
          {EDITORIAL[0].body}
        </p>
        <TrustedByLine className="my-5" compact />
        <Ctas small />
      </div>
    )
  }
  if (ch.message) {
    return (
      <h2 className="display text-ink" style={{ fontSize: 'clamp(36px, 10vw, 46px)', lineHeight: 1.1 }}>
        {ch.message[0]}
        <br />
        {ch.message[1]}
      </h2>
    )
  }
  if (ch.step !== undefined) {
    return (
      <div>
        <p className="microlabel mb-4">The Pipeline · {String(ch.step + 1).padStart(2, '0')} / 06</p>
        <h2 className="display text-ink" style={{ fontSize: 'clamp(32px, 9vw, 42px)', lineHeight: 1.1 }}>
          {ch.title}
        </h2>
        <p className="mt-3 max-w-[240px] text-[14px] leading-6 text-ink-2">{ch.desc}</p>
      </div>
    )
  }
  if (ch.productIdx !== undefined) {
    const block = EDITORIAL[ch.productIdx]
    return (
      <div>
        <span className="mb-4 flex items-center gap-3">
          <span className="icon-badge icon-badge-sm shrink-0">{ICONS[block.icon]}</span>
          <span>
            <span className="microlabel block" style={{ fontSize: 11 }}>
              {block.product}
            </span>
            <span className="mt-0.5 block text-[11px] text-ink-3">{block.descriptor}</span>
          </span>
        </span>
        <h2 className="display text-ink" style={{ fontSize: 'clamp(28px, 7.8vw, 36px)', lineHeight: 1.12 }}>
          {block.heading}
        </h2>
      </div>
    )
  }
  return (
    <div>
      <h2 className="display text-ink" style={{ fontSize: 'clamp(32px, 9vw, 42px)', lineHeight: 1.1 }}>
        One system.
        <br />
        Hire complete.
      </h2>
      <p className="mt-3 text-[14px] leading-6 text-ink-2">Intelligence returns to the network.</p>
    </div>
  )
}

function MobileStage() {
  const trackRef = useRef(null)
  const M = useRef(new Map())
  const reg = useCallback((key) => (el) => {
    if (el) M.current.set(key, el)
  }, [])
  const measureRef = useRef({ top: 0, span: 1, loopTop: Infinity, proofTop: Infinity, ctaTop: Infinity, vh: 800 })
  const [rail, setRail] = useState({ passed: 0, active: -1 })
  const railRef = useRef('')
  const [orbActive, setOrbActive] = useState(0)
  const orbActiveRef = useRef(0)

  useEffect(() => {
    let raf = 0
    let current = 0
    let orbCur = 0
    let orbVel = 0

    const measure = () => {
      const el = trackRef.current
      if (!el) return
      const m = measureRef.current
      m.top = el.getBoundingClientRect().top + window.scrollY
      m.span = Math.max(el.offsetHeight - window.innerHeight, 1)
      const loop = document.getElementById('loop')
      const proof = document.getElementById('proof')
      const cta = document.getElementById('start-hiring')
      m.loopTop = loop ? loop.getBoundingClientRect().top + window.scrollY : Infinity
      m.proofTop = proof ? proof.getBoundingClientRect().top + window.scrollY : Infinity
      m.ctaTop = cta ? cta.getBoundingClientRect().top + window.scrollY : Infinity
      m.vh = window.innerHeight
    }
    measure()
    applyFrameM(0, M.current)
    window.addEventListener('resize', measure)

    const loop = () => {
      const m = measureRef.current
      const target = clamp01((window.scrollY - m.top) / m.span)
      const d = target - current
      if (Math.abs(d) > 0.0003) {
        current += clamp(d * LERP, -MAX_STEP, MAX_STEP)
        applyFrameM(current, M.current)
        const key = `${mPassed(current)}:${mActiveNode(current)}`
        if (key !== railRef.current) {
          railRef.current = key
          setRail({ passed: mPassed(current), active: mActiveNode(current) })
        }
      }
      /* orbital navigation: same object as desktop, tighter geometry */
      const pTarget = orbitPosMobile(current) + orbitPosBeyond(window.scrollY, m, m.vh)
      orbVel = (orbVel + (pTarget - orbCur) * 0.06) * 0.72
      orbCur += orbVel
      applyOrbit(M.current, orbCur, 112, 22)
      const ai = clamp(Math.round(pTarget), 0, ORBIT_SECTIONS.length - 1)
      if (ai !== orbActiveRef.current) {
        orbActiveRef.current = ai
        setOrbActive(ai)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const goTo = (item) => {
    const m = measureRef.current
    if (item.anchor) {
      const top = item.anchor === 'loop' ? m.loopTop : item.anchor === 'proof' ? m.proofTop : m.ctaTop
      window.scrollTo({ top: Math.round(top - 30), behavior: 'smooth' })
    } else {
      window.scrollTo({ top: Math.round(m.top + item.tm * m.span), behavior: 'smooth' })
    }
  }

  return (
    <section ref={trackRef} id="products" className="relative" style={{ height: '1150vh' }}>
      <OrbitalNav reg={reg} active={orbActive} onGo={goTo} compact />
      <div className="sticky top-0 overflow-hidden" style={{ height: '100svh' }}>
        {/* chapter texts (top zone, below the orbital nav) */}
        <div className="absolute inset-x-0 top-0 z-30 px-7 pt-36">
          {MCHAPTERS.map((ch, i) => (
            <div key={i} ref={reg(`mch:${i}`)} className={i === 0 ? 'relative' : 'absolute inset-x-7 top-36'} style={i === 0 ? undefined : { opacity: 0 }}>
              <MChapterText ch={ch} />
            </div>
          ))}
        </div>

        {/* visual zone (anchored below center) */}
        <div className="absolute left-1/2 top-1/2 z-10 h-0 w-0" style={{ marginTop: 70 }}>
          {/* living formation — parked lower at the hero, rises as it converges */}
          <div ref={reg('mform')} className="absolute h-0 w-0" style={{ transform: 'translate3d(0, 185px, 0)' }}>
          <div className="slow-orbit absolute h-0 w-0">
            <div ref={reg('mnet')} className="hero-net absolute h-0 w-0">
              <svg className="absolute" style={{ left: -195, top: -170 }} width="390" height="340" viewBox="-195 -170 390 340" fill="none" aria-hidden="true">
                {MARCS.map((arc) => (
                  <g key={arc.key}>
                    <path className="arc-base" d={arc.d} strokeWidth="1.1" />
                    <path className="arc-pulse" d={arc.d} strokeWidth="1.3" pathLength="100" strokeLinecap="round" style={{ animationDelay: `${arc.delay}s` }} />
                  </g>
                ))}
                <circle className="axis-dot" cx="0" cy="10" r="2.5" fill="#CFC7F8" />
              </svg>
              {MARCS.map((arc, i) => (
                <span key={i} className="flow-particle" style={{ offsetPath: `path("${arc.d}")`, '--pt-dur': `${7.5 + i * 1.3}s`, '--pt-delay': `${-i * 2.4}s` }} />
              ))}
            </div>
            {MSPHERES.map((cfg) => (
              <Sphere key={cfg.key} cfg={cfg} interactive={false} labelBelow anchorRef={reg(`msphere:${cfg.key}`)} labelRef={reg(`mslabel:${cfg.key}`)} />
            ))}
          </div>
          </div>

          {/* intelligence core → vertical timeline */}
          <div
            ref={reg('mcore')}
            className="absolute"
            style={{
              left: -32,
              top: -32,
              width: 64,
              height: 64,
              borderRadius: '50%',
              opacity: 0,
              background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.98), rgba(207,199,248,0.75) 55%, rgba(176,164,242,0.35) 100%)',
              boxShadow: '0 0 44px 10px rgba(176,164,242,0.35)',
            }}
            aria-hidden="true"
          >
            <div ref={reg('mcoreBright')} className="absolute inset-0" style={{ borderRadius: '50%', opacity: 0, background: 'radial-gradient(circle, rgba(255,255,255,1), transparent 70%)' }} />
          </div>

          {/* crisp timeline + downward particles */}
          <svg className="absolute" style={{ left: MRAIL_X - 20, top: MLINE[0] - 10, overflow: 'visible' }} width="40" height={MLINE[1] - MLINE[0] + 20} viewBox={`-20 ${MLINE[0] - 10} 40 ${MLINE[1] - MLINE[0] + 20}`} fill="none" aria-hidden="true">
            <path ref={reg('mline')} d={`M0 ${MLINE[0]} Q 3 15 0 ${MLINE[1]}`} stroke="rgba(150,140,220,0.4)" strokeWidth="1.25" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
          </svg>
          <div ref={reg('mflow')} className="absolute h-0 w-0" style={{ opacity: 0, visibility: 'hidden' }} aria-hidden="true">
            {[0, 1].map((i) => (
              <span key={i} className="flow-particle" style={{ offsetPath: `path("M${MRAIL_X} ${MLINE[0]} Q ${MRAIL_X + 3} 15 ${MRAIL_X} ${MLINE[1]}")`, '--pt-dur': `${5.5 + i * 1.6}s`, '--pt-delay': `${-i * 2.6}s` }} />
            ))}
          </div>
          <div ref={reg('mback')} className="absolute h-0 w-0" style={{ opacity: 0, visibility: 'hidden' }} aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="flow-particle" style={{ offsetPath: `path("M${MRAIL_X} ${MLINE[0]} Q ${MRAIL_X + 3} 15 ${MRAIL_X} ${MLINE[1]}")`, animationDirection: 'reverse', '--pt-dur': `${4.5 + i * 1.1}s`, '--pt-delay': `${-i * 1.7}s` }} />
            ))}
          </div>

          {/* timeline nodes */}
          {SPINE6.map((s, i) => (
            <div
              key={s.key}
              className={`absolute h-0 w-0 ${i < rail.passed ? 'mnode-done' : ''} ${i === rail.active ? 'mnode-active' : ''}`}
              style={{ left: MRAIL_X, top: mNodeY(i) }}
            >
              <div ref={reg(`mnodewrap:${i}`)} style={{ opacity: 0 }}>
                <span className="mnode">
                  <span className="scale-[0.7]">{ICONS[s.icon]}</span>
                </span>
              </div>
            </div>
          ))}

          {/* Hermit card (expands from the top node) */}
          <div ref={reg('mhermit')} className="absolute z-20 w-[330px]" style={{ opacity: 0, visibility: 'hidden', marginLeft: -165, marginTop: -185 }}>
            <div ref={reg('mhermitShell')} className="glass-flat w-full overflow-hidden" style={{ borderRadius: 24 }}>
              <div ref={reg('mhermitContent')} className="p-5">
                <div className="flex items-center gap-3 border-b border-hairline pb-3">
                  <span className="icon-badge icon-badge-sm shrink-0">{ICONS.hermit}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-ink">Hermit</p>
                    <p className="mt-0.5 text-[11px] text-ink-3">AI hiring agent · WhatsApp</p>
                  </div>
                </div>
                <HermitChat reg={reg} composed={false} />
              </div>
            </div>
          </div>

          {/* ZenHyre aura: verified-network context around the card */}
          <div ref={reg('maura')} className="absolute h-0 w-0" style={{ opacity: 0, visibility: 'hidden' }} aria-hidden="true">
            {MAURA.map((c, i) => (
              <div key={c.id} className={`absolute ${['drift-a', 'drift-b', 'drift-c'][i % 3]}`} style={{ left: c.x - 22, top: c.y }}>
                <span className="talent-chip px-2.5 py-1 text-[9.5px] text-ink-2">
                  <span className="token text-[9.5px] text-ink">{c.id}</span>
                  <span className="badge-pulse inline-flex text-verified" style={{ animationDelay: `${i * 0.8}s` }}>
                    <CheckIcon size={8} />
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* THE persistent candidate card */}
          <CandidateCard reg={reg} />
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   Static pipeline (fallback modes) — six stage cards, one system
   ========================================================================== */

function PipelineStatic({ animate }) {
  const [ref, on] = useInView(animate, 0.2)
  return (
    <div ref={ref} className={on ? 'pipe-on' : ''}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPINE6.map((s, i) => (
          <div key={s.key} className="pipe-node lift-card glass-flat px-5 py-5" style={{ borderRadius: 16, transitionDelay: `${i * 90}ms` }}>
            <span className="icon-badge">{ICONS[s.icon]}</span>
            <p className="mt-3 text-[14px] font-semibold text-ink">{s.title}</p>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-3">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================================
   Static stacked flow — <1024px and prefers-reduced-motion (and first paint)
   ========================================================================== */

function SphereFormation() {
  return (
    <div className="relative" style={{ width: 560, height: 520 }} aria-hidden="true">
      <ArcField hoverKey={null} activeKey={null} />
      {SPHERES.map((cfg) => (
        <Sphere key={cfg.key} cfg={cfg} interactive={false} labelBelow staticTransform={`translate3d(${cfg.F[0]}px, ${cfg.F[1]}px, 0) scale(0.9)`} />
      ))}
    </div>
  )
}

function StaticCard({ face }) {
  return (
    <div className="glass-flat relative mx-auto overflow-hidden" style={{ borderRadius: 24, maxWidth: 320 }}>
      <div className="flex h-[54px] items-center justify-between gap-3 border-b border-hairline px-4">
        <p className="token min-w-0 truncate text-[12px] text-ink" style={{ whiteSpace: 'nowrap' }}>
          {CANDIDATES[0].id} <span className="font-normal text-ink-3">· {CANDIDATES[0].track}</span>
        </p>
        <p className="tnum shrink-0 text-[11px] font-medium text-ink-2" style={{ whiteSpace: 'nowrap' }}>
          ELO {CANDIDATES[0].elo}
        </p>
      </div>
      {face === 'profile' ? <ProfileFace composed reg={() => undefined} /> : <CapabilityFace composed reg={() => undefined} />}
    </div>
  )
}

function StaticFlow({ animate }) {
  const sections = [
    {
      block: EDITORIAL[0],
      panel: (
        <div className="flex justify-center overflow-hidden">
          <div className="origin-top scale-[0.62] sm:scale-75 md:scale-90" style={{ marginBottom: 'clamp(-180px, -16vw, -40px)' }}>
            <SphereFormation />
          </div>
        </div>
      ),
    },
    { block: EDITORIAL[1], panel: <PipelineStatic animate={animate} /> },
    { block: EDITORIAL[2], panel: <HermitPanel composed live={false} reg={() => undefined} /> },
    {
      block: EDITORIAL[3],
      panel: (
        <ZenNetworkPanel live={false}>
          <div className="absolute left-1/2 top-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2">
            <StaticCard face="profile" />
          </div>
        </ZenNetworkPanel>
      ),
    },
    {
      block: EDITORIAL[4],
      panel: (
        <ArenaFrame composed live={false} reg={() => undefined}>
          <div className="py-4">
            <StaticCard face="capability" />
          </div>
        </ArenaFrame>
      ),
    },
  ]
  return (
    <div id="products" className="mx-auto max-w-[640px] px-6 lg:max-w-[1100px]">
      {sections.map((s, i) => (
        <section key={i} className={`py-16 ${i > 0 ? 'border-t border-hairline' : 'pt-32'}`}>
          <FadeUp animate={animate}>
            <Editorial block={s.block} heroTag />
            <div className="mt-12">{s.panel}</div>
          </FadeUp>
        </section>
      ))}
    </div>
  )
}

/* ============================================================================
   The Intelligence Loop (normal flow)
   ========================================================================== */

function LoopSection({ animate }) {
  const [ref, on] = useInView(animate, 0.2)
  const R = 190
  return (
    <section id="loop" ref={ref} aria-labelledby="loop-heading" className="mx-auto max-w-[1360px] px-6 pt-32 lg:px-12">
      <div className={`grid items-center gap-16 lg:grid-cols-2 ${animate ? `io-fade ${on ? 'is-in' : ''}` : ''}`}>
        <div className="max-w-[520px]">
          <p className="microlabel mb-7">The Intelligence Loop</p>
          <h2 id="loop-heading" className="display text-ink" style={{ fontSize: 'clamp(33px, 3.7vw, 52px)', lineHeight: 1.07 }}>
            Every hire makes the platform smarter.
          </h2>
          <p className="mt-5 text-[16px] leading-7 text-ink-2" style={{ maxWidth: '44ch' }}>
            Hiring outcomes continuously improve matching, verification and capability evaluation across the ecosystem.
          </p>
        </div>
        <div className="relative mx-auto h-[340px] w-[300px] sm:h-[480px] sm:w-[480px]" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 scale-[0.62] sm:scale-100">
            <svg className="absolute inset-0 h-full w-full" viewBox="-240 -240 480 480" fill="none">
              <circle cx="0" cy="0" r={R} stroke="rgba(150,140,220,0.3)" strokeWidth="1.25" />
              {LOOP_POINTS.map((_, i) => {
                const a = (Math.PI / 180) * (-90 + i * 45)
                return <circle key={i} cx={Math.cos(a) * R} cy={Math.sin(a) * R} r="4" fill="#CFC7F8" stroke="#6E5BD8" strokeWidth="1" />
              })}
            </svg>
            <div className="absolute left-1/2 top-1/2 h-0 w-0">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="flow-particle" style={{ offsetPath: `path("M 0 ${-R} a ${R} ${R} 0 1 1 -0.1 0")`, '--pt-dur': '26s', '--pt-delay': `${-i * 5.2}s` }} />
              ))}
              {LOOP_POINTS.map((label, i) => {
                const a = (Math.PI / 180) * (-90 + i * 45)
                const x = Math.cos(a) * (R + 34)
                const y = Math.sin(a) * (R + 30)
                return (
                  <p key={label} className="microlabel absolute w-[130px] text-center" style={{ left: x - 65, top: y - 8, color: '#6B6B76' }}>
                    {label}
                  </p>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================================
   Proof: heading + marquees + metrics + testimonials, then closing CTA
   ========================================================================== */

function CountUp({ value, fmt, animate }) {
  const [ref, on] = useInView(animate, 0.5)
  const [v, setV] = useState(animate ? 0 : value)
  useEffect(() => {
    if (!on) return
    if (!animate) {
      setV(value)
      return
    }
    let raf
    const t0 = performance.now()
    const step = (now) => {
      const p = Math.min((now - t0) / 1300, 1)
      setV(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [on, animate, value])
  return (
    <span ref={ref} className="tnum">
      {fmt(v)}
    </span>
  )
}

function PhotoPlaceholder({ label }) {
  /* // PLACEHOLDER — replace with consented photography */
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-white/70 text-[12px] font-semibold text-ink-3" aria-hidden="true">
      {label}
    </span>
  )
}

function ProofSection({ animate }) {
  return (
    <div id="proof" className="mx-auto max-w-[1360px] px-6 lg:px-12">
      <FadeUp animate={animate}>
        <section aria-label="Partners and placements" className="mt-32 border-t border-hairline pt-24">
          <h2 className="display text-ink" style={{ fontSize: 'clamp(30px, 3.2vw, 46px)', lineHeight: 1.15, maxWidth: '24ch' }}>
            Trusted by ambitious companies.
            <br />
            Preferred by exceptional talent.
          </h2>
          <div className="mt-16">
            <TrustLanes />
          </div>
        </section>
      </FadeUp>

      {/* metrics row — single source: STATS */}
      <FadeUp animate={animate}>
        <section aria-label="Proof metrics" className="mt-20 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-hairline pt-20 sm:grid-cols-3 lg:grid-cols-5">
          {METRICS.map((m) => (
            <div key={m.label}>
              <p className="display text-[clamp(30px,2.6vw,40px)] text-ink">
                <CountUp value={m.value} fmt={m.fmt} animate={animate} />
              </p>
              <p className="microlabel mt-2">{m.label}</p>
            </div>
          ))}
        </section>
      </FadeUp>

      {/* founder testimonials — // PLACEHOLDER content, replace when consented */}
      <FadeUp animate={animate}>
        <section aria-label="Founder testimonials" className="mt-24">
          <p className="microlabel mb-10">What founders say</p>
          <div className="grid gap-6 md:grid-cols-3">
            {FOUNDER_QUOTES.map((f) => (
              <Tilt key={f.company} className="glass-flat rounded-3xl p-7">
                <div className="flex items-center gap-4">
                  <PhotoPlaceholder label={f.company.slice(0, 2)} />
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{f.company}</p>
                    <p className="mt-0.5 text-[12px] text-ink-3">
                      {f.role} · {f.result}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-[15px] leading-7 text-ink-2">&ldquo;{f.quote}&rdquo;</p>
              </Tilt>
            ))}
          </div>
        </section>
      </FadeUp>

      {/* student testimonials — // PLACEHOLDER content, replace when consented */}
      <FadeUp animate={animate}>
        <section aria-label="Student testimonials" className="mt-16">
          <p className="microlabel mb-10">What candidates say</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STUDENT_QUOTES.map((s) => (
              <Tilt key={s.institute} className="glass-flat rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <PhotoPlaceholder label={s.institute.split(' ')[1]?.slice(0, 2) || 'II'} />
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{s.institute}</p>
                    <p className="mt-0.5 text-[11px] text-ink-3">&rarr; {s.company}</p>
                  </div>
                </div>
                <p className="mt-4 text-[14px] leading-6 text-ink-2">&ldquo;{s.quote}&rdquo;</p>
              </Tilt>
            ))}
          </div>
        </section>
      </FadeUp>

      {/* closing CTA */}
      <FadeUp animate={animate}>
        <section id="start-hiring" className="mt-24 border-t border-hairline py-32 text-center">
          <p className="microlabel tnum mb-8">
            {fmtInt(STATS.profiles)} verified profiles · {STATS.campuses} campuses · Backed by NVIDIA Inception
          </p>
          <h2 className="display mx-auto text-ink" style={{ fontSize: 'clamp(36px, 4vw, 60px)', lineHeight: 1.08, maxWidth: '18ch' }}>
            Ready to build your next team?
          </h2>
          <p className="mx-auto mt-6 text-[16px] leading-7 text-ink-2" style={{ maxWidth: '46ch' }}>
            From the first WhatsApp message to the final offer, Novare handles the hiring journey end to end.
          </p>
          <div className="mt-10 flex justify-center">
            <Ctas />
          </div>
        </section>
      </FadeUp>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-6 py-16 md:grid-cols-3 lg:px-12">
        <div>
          <p className="display text-[20px] text-ink">Novare Talent</p>
          <address className="mt-4 text-[13px] not-italic leading-6 text-ink-3">
            Novare Talent Private Limited
            <br />
            SINE, IIT Bombay, Powai
            <br />
            Mumbai 400076
          </address>
        </div>
        <nav aria-label="Products">
          <p className="microlabel mb-4">Products</p>
          <ul className="space-y-2 text-[14px] text-ink-2">
            {[
              ['ZenHyre', PRODUCT_LINKS.zenhyre],
              ['Hermit', PRODUCT_LINKS.hermit],
              ['Arena X', PRODUCT_LINKS.arenax],
            ].map(([p, href]) => (
              <li key={p}>
                <a href={href} {...extProps(href)} className="underline-link transition-colors hover:text-ink">
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="microlabel mb-4">Contact</p>
          <a href={CONTACT} className="underline-link text-[14px] text-ink-2 transition-colors hover:text-ink">
            sahil@novaretalent.com
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-[1360px] border-t border-hairline px-6 py-6 lg:px-12">
        <p className="text-[12px] text-ink-3">&copy; 2026 Novare Talent Private Limited. All rights reserved.</p>
      </div>
    </footer>
  )
}

/* Role-aware dashboard entry: signed-in users land on their dashboard
   (/Dashboard or /client by role), everyone else on /sign-in. */
function DashboardLink({ className }) {
  const router = useRouter()
  const go = useCallback(
    async (e) => {
      e.preventDefault()
      try {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { getUserRole, getDashboardPathByRole } = await import('@/utils/getUserRole')
          const role = await getUserRole()
          router.push(getDashboardPathByRole(role))
          return
        }
      } catch {
        /* fall through to sign-in */
      }
      router.push('/sign-in')
    },
    [router]
  )
  return (
    <a href="/sign-in" onClick={go} className={className}>
      Visit Dashboard
    </a>
  )
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-6">
      <nav className="nvl-glass glass-nav mx-auto flex h-14 max-w-[1312px] items-center justify-between rounded-full pl-6 pr-2" aria-label="Main">
        <a href="#top" className="display text-[17px] text-ink">
          Novare Talent
        </a>
        <div className="flex items-center gap-6">
          <a href={`${CONTACT}?subject=Briefing%20request`} className="underline-link hidden text-[14px] font-medium text-ink-2 transition-colors hover:text-ink sm:block">
            Schedule Briefing
          </a>
          <DashboardLink className="underline-link hidden text-[14px] font-medium text-ink-2 transition-colors hover:text-ink sm:block" />
          <motion.a href={SIGNUP} className="pill pill-sm" whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }} transition={springPress}>
            Start Hiring
          </motion.a>
        </div>
      </nav>
    </header>
  )
}

/* ============================================================================
   Root
   ========================================================================== */

export default function NovareLanding() {
  const isDesktop = useMedia('(min-width: 1024px)')
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')
  /* review aid: ?static forces the stacked fallback at any viewport width */
  const forceStatic = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('static')
  /* first paint is always the static in-order document; engines mount after
     media queries resolve (progressive enhancement + SEO) */
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  const engine = ready && isDesktop && !reducedMotion && !forceStatic
  const mobileEngine = ready && !isDesktop && !reducedMotion && !forceStatic

  return (
    <div id="top" className="nvl-root ambient min-h-screen">
      <Nav />
      {/* the root layout already provides <main id="main-content"> */}
      <div>
        {engine ? <ScrollStage /> : mobileEngine ? <MobileStage /> : <StaticFlow animate={!reducedMotion} />}
        <LoopSection animate={!reducedMotion} />
        <ProofSection animate={!engine && !reducedMotion} />
      </div>
      <Footer />
    </div>
  )
}
