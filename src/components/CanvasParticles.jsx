import { useEffect, useMemo, useRef } from 'react'

const SNIPPETS = [
  "const future = 'inclusive'",
  'function innovate() {}',
  '01001011',
  '01010110',
  'break ceiling',
  'deploy equality',
  'innovate',
  'lead',
  'build',
  'equal',
  'create',
  'discover',
]

function mulberry32(seed) {
  let t = seed
  return function next() {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function pick(arr, r) {
  return arr[Math.floor(r() * arr.length)]
}

export default function CanvasParticles({ phase, ceilingIndex, ceilingVh, reducedMotion }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    raf: 0,
    w: 1,
    h: 1,
    dpr: 1,
    lastT: 0,
    prevCeilingIndex: -1,
    prevPhase: '',
    pointer: { x: 0, y: 0, active: false },
    particles: [],
  })

  const seed = useMemo(() => 1337, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const state = stateRef.current
    const rand = mulberry32(seed)

    function resetParticles(w, h) {
      const count = Math.round(clamp((w * h) / 52000, 22, 44))
      state.particles = Array.from({ length: count }, (_, i) => {
        const x = rand() * w
        const y = h + rand() * h
        const baseSpeed = 34 + rand() * 46
        const size = 11 + rand() * 7
        const opacity = 0.45 + rand() * 0.45
        const drift = (rand() * 2 - 1) * (12 + rand() * 26)
        return {
          id: `p_${i}`,
          text: pick(SNIPPETS, rand),
          x,
          y,
          vx: 0,
          vy: -baseSpeed,
          baseSpeed,
          size,
          opacity,
          drift,
        }
      })
    }

    function resize() {
      const parent = canvas.parentElement
      const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2)
      state.w = w
      state.h = h
      state.dpr = dpr
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      resetParticles(w, h)
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect()
      state.pointer.x = (e.clientX - rect.left) / rect.width
      state.pointer.y = (e.clientY - rect.top) / rect.height
      state.pointer.active = true
    }

    function onPointerLeave() {
      state.pointer.active = false
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onPointerMove, { passive: true })
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      cancelAnimationFrame(state.raf)
    }
  }, [seed])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = stateRef.current

    function step(t) {
      state.raf = requestAnimationFrame(step)
      draw(t, false)
    }

    function draw(t, freeze) {
      const dt = state.lastT ? Math.min(0.05, (t - state.lastT) / 1000) : 0.016
      state.lastT = t

      const { w, h, dpr, particles, pointer } = state
      const px = pointer.x * w
      const py = pointer.y * h
      const pointerActive = pointer.active

      if (state.prevCeilingIndex !== ceilingIndex) {
        if (phase === 'barrier') {
          for (const p of particles) {
            p.y = h + 80 + Math.random() * h * 0.45
            p.x = Math.random() * w
            p.vx = 0
            p.vy = -p.baseSpeed * 0.9
          }
        }
        state.prevCeilingIndex = ceilingIndex
      }
      state.prevPhase = phase

      const ceilingY = (ceilingVh / 100) * h
      const ceilingPad = 14

      const phaseSpeed =
        phase === 'barrier' ? 0.9 : phase === 'cracking' ? 1.4 : phase === 'shattered' ? 2.4 : 1

      const glow = 0.8 + ceilingIndex * 0.22
      const glowBoost = phase === 'shattered' ? 0.9 : phase === 'cracking' ? 0.4 : 0

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'

      for (const p of particles) {
        if (!freeze) {
          const targetVy = -p.baseSpeed * phaseSpeed
          p.vy = lerp(p.vy, targetVy, 0.06)
          p.vx = lerp(p.vx, p.drift * 0.04, 0.04)

          if (pointerActive) {
            const dx = p.x - px
            const dy = p.y - py
            const dist = Math.hypot(dx, dy)
            const radius = 140
            if (dist > 0.001 && dist < radius) {
              const force = (1 - dist / radius) ** 2
              const fx = (dx / dist) * (520 * force)
              const fy = (dy / dist) * (520 * force)
              p.vx += fx * dt
              p.vy += fy * dt
            }
          }

          p.x += p.vx * dt
          p.y += p.vy * dt

          if (phase !== 'shattered') {
            const topLimit = ceilingY + ceilingPad
            if (p.y < topLimit) {
              p.y = topLimit
              p.vy = 0
            }
          }

          if (p.y < -60) {
            p.y = h + 60 + Math.random() * h * 0.5
            p.x = Math.random() * w
          }
          if (p.x < -200) p.x = w + 200
          if (p.x > w + 200) p.x = -200
        }

        const alpha = p.opacity
        const colorA = `rgba(108,242,255,${alpha})`
        const shadow1 = `rgba(0,234,255,${0.24 * (glow + glowBoost)})`
        const shadow2 = `rgba(108,242,255,${0.14 * (glow + glowBoost)})`

        ctx.font = `${p.size}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
        ctx.fillStyle = colorA
        ctx.shadowColor = shadow1
        ctx.shadowBlur = 16 * (glow + glowBoost)
        ctx.fillText(p.text, p.x, p.y)
        ctx.shadowColor = shadow2
        ctx.shadowBlur = 26 * (glow + glowBoost)
        ctx.fillText(p.text, p.x, p.y)
      }
    }

    state.lastT = 0
    if (reducedMotion) {
      draw(performance.now(), true)
      return
    }

    state.raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(state.raf)
  }, [phase, ceilingIndex, ceilingVh, reducedMotion])

  return <canvas className="particleCanvas" ref={canvasRef} aria-hidden="true" />
}
