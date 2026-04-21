import { EntityPlaceholderIcon } from '../ui/EntityPlaceholderIcon.jsx'

export function ProgressSprite({ item }) {
  const count = Math.max(0, item.count ?? 0)

  return (
    <article
      className={`progress-sprite progress-sprite--${item.type} progress-sprite--${item.state}`.trim()}
      data-type={item.type}
      data-state={item.state}
    >
      <EntityPlaceholderIcon
        code={item.code}
        label={item.title}
        type={item.type}
        state={item.state}
      />

      <div className="progress-sprite__body">
        <span className="progress-sprite__title">{item.title}</span>
        <span className="progress-sprite__count">
          {count > 0 ? `x${count}` : '—'}
        </span>
      </div>
    </article>
  )
}
