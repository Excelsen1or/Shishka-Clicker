import { memo, useCallback, useEffect, useRef, useState } from 'react'

const RANGE_COMMIT_DELAY_MS = 80

export const RangeRow = memo(function RangeRow({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '%',
}) {
  const [draftValue, setDraftValue] = useState(value)
  const commitTimeoutRef = useRef(null)

  useEffect(() => {
    setDraftValue(value)
  }, [value])

  const commitValue = useCallback(
    (nextValue) => {
      if (commitTimeoutRef.current) {
        window.clearTimeout(commitTimeoutRef.current)
        commitTimeoutRef.current = null
      }

      if (nextValue !== value) {
        onChange(nextValue)
      }
    },
    [onChange, value],
  )

  const scheduleCommit = useCallback(
    (nextValue) => {
      if (commitTimeoutRef.current) {
        window.clearTimeout(commitTimeoutRef.current)
      }

      commitTimeoutRef.current = window.setTimeout(() => {
        commitTimeoutRef.current = null
        if (nextValue !== value) {
          onChange(nextValue)
        }
      }, RANGE_COMMIT_DELAY_MS)
    },
    [onChange, value],
  )

  useEffect(
    () => () => {
      if (commitTimeoutRef.current) {
        window.clearTimeout(commitTimeoutRef.current)
      }
    },
    [],
  )

  return (
    <label className="settings-range">
      <div className="settings-range__head">
        <div className="settings-range__copy settings-copy-group">
          <div className="settings-card__label">{label}</div>
          <div className="settings-card__hint">{hint}</div>
        </div>
        <div className="settings-range__value">
          {draftValue}
          {suffix}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={draftValue}
        onChange={(event) => {
          const nextValue = Number(event.target.value)
          setDraftValue(nextValue)
          scheduleCommit(nextValue)
        }}
        onPointerUp={() => commitValue(draftValue)}
        onKeyUp={() => commitValue(draftValue)}
        onBlur={() => commitValue(draftValue)}
      />
    </label>
  )
})
