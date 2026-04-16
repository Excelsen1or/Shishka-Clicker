import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AchievementCard } from './AchievementCard.jsx'

const ACHIEVEMENT_FILTER_KEY = 'shishka-clicker-achievements-filter-v1'

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'groups', label: 'Линейки' },
  { id: 'opened', label: 'Открытые' },
  { id: 'unique', label: 'Уникальные' },
  { id: 'secret', label: 'Секреты' },
]

function isVisibleByFilter(item, filter) {
  switch (filter) {
    case 'groups':
      return item.kind === 'group'
    case 'opened':
      return item.kind === 'group' ? item.currentLevel > 0 : item.unlocked
    case 'unique':
      return item.kind !== 'group' && !item.secret
    case 'secret':
      return item.secret
    case 'all':
    default:
      return true
  }
}

function estimatePlaceholderRows(count) {
  if (count <= 2) return 1
  if (count <= 6) return 2
  if (count <= 10) return 3
  return 4
}

const AchievementCategorySection = memo(function AchievementCategorySection({
  group,
  isCollapsed,
  onToggle,
  eagerlyRender = false,
}) {
  const containerRef = useRef(null)
  const [hasRendered, setHasRendered] = useState(eagerlyRender)

  useEffect(() => {
    if (hasRendered || typeof window === 'undefined') return

    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setHasRendered(true)
        observer.disconnect()
      },
      { rootMargin: '320px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasRendered])

  return (
    <article
      ref={containerRef}
      className="achievement-category achievement-category--virtualized"
      style={{
        '--achievement-placeholder-rows': estimatePlaceholderRows(
          group.items.length,
        ),
      }}
    >
      <button
        type="button"
        className="achievement-category__toggle"
        aria-expanded={!isCollapsed}
        onClick={() => onToggle(group.category)}
      >
        <div className="achievement-category__head">
          <div>
            <div className="achievement-category__kicker">Категория</div>
            <h3 className="achievement-category__title">{group.category}</h3>
          </div>
          <div className="achievement-category__summary">
            <div className="achievement-category__count">
              {group.visibleUnlocked}/{group.visibleTotal}
            </div>
            <div className="achievement-category__chevron" aria-hidden="true">
              {isCollapsed ? '+' : '−'}
            </div>
          </div>
        </div>
      </button>

      {isCollapsed ? null : hasRendered ? (
        <div className="achievement-grid">
          {group.items.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      ) : (
        <div
          className="achievement-grid achievement-grid--deferred"
          aria-hidden="true"
        >
          <div className="achievement-grid__placeholder">
            Секция будет отрисована при прокрутке.
          </div>
        </div>
      )}
    </article>
  )
})

export const AchievementsGrid = ({ grouped }) => {
  const [filter, setFilter] = useState(() => {
    if (typeof window === 'undefined') return 'all'

    try {
      const saved = window.localStorage.getItem(ACHIEVEMENT_FILTER_KEY)
      return FILTERS.some((item) => item.id === saved) ? saved : 'all'
    } catch {
      return 'all'
    }
  })
  const [collapsedCategories, setCollapsedCategories] = useState({})
  const deferredGrouped = useDeferredValue(grouped)

  const visibleGroups = useMemo(() => {
    return deferredGrouped
      .map((group) => {
        const items = group.items.filter((item) =>
          isVisibleByFilter(item, filter),
        )

        if (items.length === 0) {
          return null
        }

        const visibleUnlocked = items.reduce((count, item) => {
          if (item.kind === 'group') {
            return count + (item.currentLevel > 0 ? 1 : 0)
          }

          return count + (item.unlocked ? 1 : 0)
        }, 0)

        return {
          ...group,
          items,
          visibleUnlocked,
          visibleTotal: items.length,
        }
      })
      .filter(Boolean)
  }, [deferredGrouped, filter])

  const totalVisibleItems = useMemo(
    () => visibleGroups.reduce((sum, group) => sum + group.visibleTotal, 0),
    [visibleGroups],
  )

  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(ACHIEVEMENT_FILTER_KEY, filter)
    } catch {
      // Ignore storage failures for this optional UI preference.
    }
  }, [filter])

  return (
    <div className="achievement-category-grid">
      <div className="achievement-toolbar">
        <div
          className="achievement-toolbar__filters"
          role="tablist"
          aria-label="Фильтр достижений"
        >
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`achievement-filter${filter === item.id ? ' achievement-filter--active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="achievement-toolbar__meta">
          {visibleGroups.length} кат. / {totalVisibleItems} карт.
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="achievement-empty">
          По текущему фильтру ничего не найдено.
        </div>
      ) : (
        visibleGroups.map((group, index) => (
          <AchievementCategorySection
            key={group.category}
            group={group}
            isCollapsed={Boolean(collapsedCategories[group.category])}
            onToggle={toggleCategory}
            eagerlyRender={index < 2}
          />
        ))
      )}
    </div>
  )
}
