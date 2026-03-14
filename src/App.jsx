import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import CanvasParticles from './components/CanvasParticles.jsx'
import GlassCeiling from './components/GlassCeiling.jsx'
import Terminal from './components/Terminal.jsx'
import useMediaQuery from './hooks/useMediaQuery.js'
import { createSfx } from './sfx.js'

const CEILINGS = [
  { id: 'entry', title: 'Entry', vh: 34, desc: 'First steps. First rejections. Still rising.' },
  {
    id: 'recognition',
    title: 'Recognition',
    vh: 26,
    desc: 'Your work matters. Make it visible. Claim the credit.',
  },
  {
    id: 'leadership',
    title: 'Leadership',
    vh: 18,
    desc: 'Not permission—position. Not a seat—your seat.',
  },
]

function App() {
  const [ceilingIndex, setCeilingIndex] = useState(0)
  const [phase, setPhase] = useState('barrier') // barrier | cracking | shattered
  const [showMessage, setShowMessage] = useState(false)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', false)
  const prefersReducedTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)', false)
  const [a11yMode, setA11yMode] = useState(false)
  const [soundOnOverride, setSoundOnOverride] = useState(null)
  const [soundReady, setSoundReady] = useState(false)
  const [terminalLines, setTerminalLines] = useState([
    'timetrack@shatter:~$',
    'Type `break ceiling` or `run equality.exe` and press Enter.',
  ])

  const canTrigger = phase === 'barrier'
  const isFinalCeiling = ceilingIndex >= CEILINGS.length - 1
  const ceiling = CEILINGS[Math.min(ceilingIndex, CEILINGS.length - 1)]
  const reducedMotion = a11yMode || prefersReducedMotion
  const reducedTransparency = a11yMode || prefersReducedTransparency

  const acceptedCommands = useMemo(
    () => new Set(['break ceiling', 'run equality.exe', 'run equality.exe;']),
    [],
  )

  const sfxRef = useRef(null)

  const soundOn = soundOnOverride ?? !reducedMotion

  useEffect(() => {
    const instance = sfxRef.current
    if (!instance) return
    instance.setMuted(!soundOn)
  }, [soundOn])

  useEffect(() => {
    return () => sfxRef.current?.dispose?.()
  }, [])

  async function ensureAudioUnlocked() {
    if (!sfxRef.current) sfxRef.current = createSfx()
    if (!sfxRef.current) return false

    try {
      await sfxRef.current.unlock()
      setSoundReady(true)
      return true
    } catch {
      return false
    }
  }

  function triggerBreak(source) {
    if (!canTrigger) return
    setTerminalLines((lines) => [
      ...lines,
      `barrier ${ceilingIndex + 1}/${CEILINGS.length}: ${ceiling.title}`,
      ceiling.desc,
      `${source}: pressure rising…`,
    ])
    if (soundOn) {
      ensureAudioUnlocked().then((ok) => {
        if (!ok) return
        sfxRef.current?.setMuted(false)
        sfxRef.current?.crack(1)
      })
    }
    setPhase('cracking')
  }

  function onTerminalSubmit(raw) {
    const command = raw.trim().toLowerCase()
    setTerminalLines((lines) => [...lines, `> ${raw}`])

    if (acceptedCommands.has(command)) {
      triggerBreak('system')
      return
    }

    setTerminalLines((lines) => [
      ...lines,
      `command not found: ${raw}`,
      'hint: try `break ceiling`',
    ])
  }

  useEffect(() => {
    if (phase !== 'cracking') return

    const toShatter = window.setTimeout(() => {
      if (soundOn) sfxRef.current?.shatter(1)
      setPhase('shattered')
    }, 1600)
    const toAfter = window.setTimeout(() => {
      if (isFinalCeiling) {
        setShowMessage(true)
        setTerminalLines((lines) => [
          ...lines,
          'barriers cleared.',
          'new prompt: define your own limits.',
        ])
        return
      }

      setTerminalLines((lines) => [
        ...lines,
        `next barrier unlocked: ${CEILINGS[ceilingIndex + 1].title}`,
        CEILINGS[ceilingIndex + 1].desc,
        'keep going.',
      ])
      setCeilingIndex((i) => i + 1)
      setPhase('barrier')
    }, 2400)

    return () => {
      window.clearTimeout(toShatter)
      window.clearTimeout(toAfter)
    }
  }, [phase, soundOn, ceilingIndex, isFinalCeiling])

  return (
    <div
      className={`scene scene--${phase} ${reducedTransparency ? 'scene--reducedTransparency' : ''} ${reducedMotion ? 'scene--reducedMotion' : ''} ${a11yMode ? 'scene--a11y' : ''}`}
    >
      <div className="scene__bg" aria-hidden="true" />

      <div className="scene__stage" role="img" aria-label="Rising code blocked by a glass ceiling">
        <CanvasParticles
          phase={phase}
          ceilingIndex={ceilingIndex}
          ceilingVh={ceiling.vh}
          reducedMotion={reducedMotion}
        />
        <GlassCeiling phase={phase} height={`${ceiling.vh}vh`} label={ceiling.title} />
      </div>

      <div className="scene__controls">
        <div className="controls__row">
          <button
            className="breakButton"
            type="button"
            onClick={() => triggerBreak('button')}
            disabled={!canTrigger}
          >
            Break the Ceiling
          </button>
          <button
            className="a11yToggle"
            type="button"
            onClick={() => setA11yMode((v) => !v)}
            aria-pressed={a11yMode}
            title="High contrast + reduced motion + reduced transparency"
          >
            Accessibility: {a11yMode ? 'On' : 'Off'}
          </button>
          <button
            className="soundToggle"
            type="button"
            onClick={() => {
              const next = !soundOn
              setSoundOnOverride(next)
              if (next) ensureAudioUnlocked()
            }}
            aria-pressed={soundOn}
            title={
              reducedMotion
                ? 'Sound is off by default due to reduced-motion settings.'
                : 'Toggle sound effects'
            }
          >
            Sound: {soundOn ? (soundReady ? 'On' : 'On*') : 'Off'}
          </button>
          <div className="controls__hint">
            {phase === 'barrier'
              ? `Barrier ${ceilingIndex + 1}/${CEILINGS.length} — ${ceiling.title}`
              : phase === 'cracking'
                ? 'Cracks are spreading…'
                : 'The ceiling is gone.'}
          </div>
        </div>

        <Terminal
          disabled={!canTrigger}
          lines={terminalLines}
          onSubmit={onTerminalSubmit}
          placeholder="break ceiling"
        />
      </div>

      <div className={`scene__message ${showMessage ? 'is-visible' : ''}`} aria-live="polite">
        <div className="message__title">The ceiling was never your limit.</div>
        <div className="message__subtitle">It was the limit you were taught to accept.</div>
        <div className="message__tag">#WeCoded</div>
      </div>
    </div>
  )
}

export default App
