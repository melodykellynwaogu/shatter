function clamp01(n) {
  return Math.max(0, Math.min(1, n))
}

function now(ctx) {
  return ctx.currentTime
}

function makeNoiseBuffer(ctx, seconds = 0.2) {
  const sampleRate = ctx.sampleRate
  const length = Math.max(1, Math.floor(sampleRate * seconds))
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
  return buffer
}

export function createSfx() {
  const AudioContextImpl = window.AudioContext || window.webkitAudioContext
  if (!AudioContextImpl) return null

  const ctx = new AudioContextImpl()
  const master = ctx.createGain()
  master.gain.value = 0.75
  master.connect(ctx.destination)

  const noiseShort = makeNoiseBuffer(ctx, 0.12)
  const noiseLong = makeNoiseBuffer(ctx, 0.4)

  function unlock() {
    if (ctx.state === 'suspended') return ctx.resume()
    return Promise.resolve()
  }

  function crack(intensity = 1) {
    const t0 = now(ctx)
    const amount = clamp01(intensity)

    const src = ctx.createBufferSource()
    src.buffer = noiseShort

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 1200

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2600
    bp.Q.value = 0.9

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.5 + amount * 0.55, t0 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.11)

    src.connect(hp)
    hp.connect(bp)
    bp.connect(gain)
    gain.connect(master)

    src.start(t0)
    src.stop(t0 + 0.13)

    // small "tick" impulses for a glassy feel
    for (let i = 0; i < 4; i += 1) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = 5200 - i * 700
      const g = ctx.createGain()
      const ti = t0 + 0.012 + i * 0.012
      g.gain.setValueAtTime(0.0001, ti)
      g.gain.exponentialRampToValueAtTime(0.06 + amount * 0.04, ti + 0.003)
      g.gain.exponentialRampToValueAtTime(0.0001, ti + 0.02)
      osc.connect(g)
      g.connect(master)
      osc.start(ti)
      osc.stop(ti + 0.03)
    }
  }

  function shatter(intensity = 1) {
    const t0 = now(ctx)
    const amount = clamp01(intensity)

    // broad noise burst
    const src = ctx.createBufferSource()
    src.buffer = noiseLong

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7200

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.8 + amount * 0.6, t0 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45)

    src.connect(lp)
    lp.connect(gain)
    gain.connect(master)
    src.start(t0)
    src.stop(t0 + 0.46)

    // falling "shards" — descending sines with quick decay
    const shardCount = 10
    for (let i = 0; i < shardCount; i += 1) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      const startHz = 1400 + i * 120
      const endHz = 320 + i * 22
      const ti = t0 + 0.02 + i * 0.01
      osc.frequency.setValueAtTime(startHz, ti)
      osc.frequency.exponentialRampToValueAtTime(endHz, ti + 0.28 + i * 0.01)

      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, ti)
      g.gain.exponentialRampToValueAtTime(0.12 + amount * 0.08, ti + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ti + 0.36)

      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 300

      osc.connect(hp)
      hp.connect(g)
      g.connect(master)
      osc.start(ti)
      osc.stop(ti + 0.42)
    }
  }

  function setMuted(muted) {
    master.gain.value = muted ? 0 : 0.75
  }

  function dispose() {
    try {
      master.disconnect()
    } catch {
      // ignore
    }
    ctx.close?.()
  }

  return { unlock, crack, shatter, setMuted, dispose, ctx }
}

