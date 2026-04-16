export const PrestigeStep = ({ index, title, text, active = false }) => {
  return (
    <div className={`prestige-step ${active ? 'prestige-step--active' : ''}`}>
      <div className="prestige-step__index">{index}</div>
      <div>
        <div className="prestige-step__title">{title}</div>
        <div className="prestige-step__text">{text}</div>
      </div>
    </div>
  )
}
