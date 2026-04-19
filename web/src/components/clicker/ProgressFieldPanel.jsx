import { ProgressSprite } from './ProgressSprite.jsx'

export function ProgressFieldPanel({ title, items, className = '' }) {
  const fieldItems = items ?? []

  return (
    <section className={`progress-field-panel pixel-surface ${className}`.trim()}>
      <header className="progress-field-panel__header">
        <h3 className="progress-field-panel__title">{title}</h3>
        <span className="progress-field-panel__count">{fieldItems.length}</span>
      </header>

      <div className="progress-field-panel__grid">
        {fieldItems.map((item) => (
          <ProgressSprite key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
