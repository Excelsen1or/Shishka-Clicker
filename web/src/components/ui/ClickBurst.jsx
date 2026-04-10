export function ClickBurst({ bursts }) {
  if (!bursts.length) return null

  return (
    <div className="bursts-layer">
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="click-burst"
          style={{ left: burst.x, top: burst.y }}
        >
          {burst.value}
        </span>
      ))}
    </div>
  )
}
