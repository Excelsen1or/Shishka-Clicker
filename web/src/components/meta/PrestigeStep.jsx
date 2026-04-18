export const PrestigeStep = ({
  index,
  title,
  text,
  active = false,
  locked = false,
  completed = false,
}) => {
  const className = [
    'prestige-step',
    active ? 'prestige-step--active' : '',
    locked ? 'prestige-step--locked' : '',
    completed ? 'prestige-step--completed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <div className="prestige-step__index">{index}</div>
      <div>
        <div className="prestige-step__title">{title}</div>
        <div className="prestige-step__text">{text}</div>
      </div>
    </div>
  )
}
