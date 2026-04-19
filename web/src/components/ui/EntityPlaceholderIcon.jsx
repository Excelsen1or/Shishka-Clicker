function getPlaceholderCode(code, label) {
  const source = String(code ?? label ?? '').trim()

  if (!source) {
    return '??'
  }

  const chunks = source
    .split(/[^a-zA-Z0-9]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (chunks.length === 0) {
    return source.slice(0, 2).toUpperCase()
  }

  if (chunks.length === 1) {
    return chunks[0].slice(0, 2).toUpperCase()
  }

  return chunks
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase()
}

export function EntityPlaceholderIcon({
  code,
  label,
  type,
  state = 'owned',
  size = 32,
}) {
  const placeholderCode = getPlaceholderCode(code, label)

  return (
    <span
      className={`entity-placeholder-icon entity-placeholder-icon--${type} entity-placeholder-icon--${state}`.trim()}
      role="img"
      aria-label={label}
      title={label}
      data-type={type}
      data-state={state}
      data-size={size}
      style={{ width: size, height: size }}
    >
      <span className="entity-placeholder-icon__frame" aria-hidden="true" />
      <span className="entity-placeholder-icon__code" aria-hidden="true">
        {placeholderCode}
      </span>
      <span className="entity-placeholder-icon__pip" aria-hidden="true" />
    </span>
  )
}
