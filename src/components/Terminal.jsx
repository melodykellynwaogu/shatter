import { useEffect, useRef, useState } from 'react'

export default function Terminal({ disabled, lines, onSubmit, placeholder }) {
  const [value, setValue] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  function handleKeyDown(e) {
    if (e.key !== 'Enter') return
    if (disabled) return
    if (!value.trim()) return

    onSubmit(value)
    setValue('')
  }

  return (
    <div className={`terminal ${disabled ? 'is-disabled' : ''}`}>
      <div className="terminal__screen" role="log" aria-label="Terminal output">
        {lines.map((line, idx) => (
          <div className="terminal__line" key={`${idx}-${line}`}>
            {line}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="terminal__inputRow">
        <span className="terminal__prompt" aria-hidden="true">
          $
        </span>
        <input
          className="terminal__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          spellCheck="false"
          autoCapitalize="none"
          autoCorrect="off"
          aria-label="Terminal command input"
        />
      </div>
    </div>
  )
}

