const SHARDS = Array.from({ length: 10 }, (_, i) => `s${i + 1}`)

export default function GlassCeiling({ phase, height, label }) {
  return (
    <div
      className={`glassCeiling glassCeiling--${phase}`}
      style={{ '--ceilingHeight': height }}
      aria-hidden="true"
    >
      <div className="glassCeiling__pane">
        <div className="glassCeiling__label">{label}</div>
        <svg className="glassCeiling__cracks" viewBox="0 0 1200 260" preserveAspectRatio="none">
          <path className="crack crack--a" d="M480 260 L520 205 L500 165 L540 110 L520 70 L560 0" />
          <path className="crack crack--b" d="M620 260 L585 210 L610 170 L575 125 L595 85 L560 0" />
          <path className="crack crack--c" d="M560 150 L455 115 L395 85 L340 40" />
          <path className="crack crack--d" d="M565 155 L700 125 L815 75 L900 35" />
          <path className="crack crack--e" d="M555 130 L520 100 L490 75 L460 55" />
          <path className="crack crack--f" d="M575 135 L610 105 L650 80 L695 55" />
        </svg>
      </div>

      <div className="glassCeiling__shards">
        {SHARDS.map((s) => (
          <div key={s} className={`glassShard ${s}`} />
        ))}
      </div>
    </div>
  )
}
