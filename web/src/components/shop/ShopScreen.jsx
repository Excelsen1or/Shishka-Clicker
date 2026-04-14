import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { ShopCard } from './ShopCard'

const SCREEN_META = {
  subscriptions: {
    kicker: 'Магазин',
    title: 'Подписки',
    desc: 'Подписки ускоряют добычу денег и знаний.',
    accent: 'orange',
    emptyText: 'Подписки загружаются…',
    categories: [
      { id: 'starter', title: 'Стартовые ассистенты', desc: 'Ранние сервисы для первого снежного кома и мягкого входа в AI-экономику.' },
      { id: 'production', title: 'Рабочие модели', desc: 'Основной производственный слой середины игры: стабильный доход, наука и поддержка билда.' },
      { id: 'research', title: 'Исследовательские сервисы', desc: 'Сервисы, которые сильнее всего толкают знания и помогают готовить престиж.' },
      { id: 'frontier', title: 'Фронтир-кластеры', desc: 'Дорогие late-game модели для глубокой меты и финального разгона.' },
    ],
  },
  upgrades: {
    kicker: 'Магазин',
    title: 'Апгрейды',
    desc: 'Апгрейды дают бонусы к добыче. Инвестиции открывают новые возможности для прогрессии.',
    accent: 'orange',
    emptyText: 'Апгрейды загружаются…',
    categories: [
      { id: 'manual', title: 'Ручной темп', desc: 'Апгрейды для клика, ранней стабильности и активной игры.' },
      { id: 'industry', title: 'Производство и логистика', desc: 'Контур шишек, денег и инфраструктуры для ровной средней игры.' },
      { id: 'research', title: 'Обучение и исследования', desc: 'Знаниевая ветка, усиливающая AI, науку и стратегические решения.' },
      { id: 'capital', title: 'Рост и капитал', desc: 'Поздние ускорители экономики, престижной подготовки и длинной дистанции.' },
    ],
  },
}

const ITEM_CATEGORIES = {
  subscriptions: {
    gigachat: 'starter',
    yandex_alisa: 'starter',
    gpt: 'production',
    claude: 'production',
    copilot: 'production',
    perplexity: 'research',
    gemini: 'research',
    deepseek: 'frontier',
    mistral: 'frontier',
  },
  upgrades: {
    textbooks: 'manual',
    coffee: 'manual',
    autoClicker: 'manual',
    focusMode: 'manual',
    internship: 'industry',
    pickupPointShift: 'industry',
    courierRush: 'industry',
    coneSorting: 'industry',
    resinWorkshop: 'industry',
    logisticsHub: 'industry',
    serverRack: 'industry',
    campusExchange: 'industry',
    studyGroup: 'research',
    promptEngineering: 'research',
    researchLab: 'research',
    grantProgram: 'research',
    memeMarketing: 'capital',
    brandStudio: 'capital',
    franchiseNetwork: 'capital',
    ventureFund: 'capital',
    quantFund: 'capital',
  },
}

function groupItemsByCategory(items, type, categories) {
  const categoryByItem = ITEM_CATEGORIES[type] ?? {}

  return categories
    .map((category) => ({
      ...category,
      items: items.filter((item) => (categoryByItem[item.id] ?? 'misc') === category.id),
    }))
    .filter((category) => category.items.length > 0)
}

const ShopCategory = memo(function ShopCategory({
  category,
  onBuy,
  onInspect,
  eagerlyRender = false,
  isLockedGroup = false,
}) {
  const sectionRef = useRef(null)
  const [hasRendered, setHasRendered] = useState(eagerlyRender)

  useEffect(() => {
    if (hasRendered || typeof window === 'undefined') return

    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setHasRendered(true)
        observer.disconnect()
      },
      { rootMargin: '280px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasRendered])

  return (
    <section
      ref={sectionRef}
      className={`shop-category ${isLockedGroup ? 'shop-category--virtualized-locked' : 'shop-category--virtualized'}`}
      style={{ '--shop-placeholder-count': Math.min(Math.max(category.items.length, 1), 4) }}
    >
      <div className="shop-category__head">
        <h4 className="shop-category__title">{category.title}</h4>
        <p className="shop-category__desc">{category.desc}</p>
      </div>

      {hasRendered ? (
        <div className="shop-grid shop-grid--category">
          {category.items.map((item) => (
            <ShopCard
              key={item.id}
              itemId={item.id}
              item={item}
              canBuy={item.canBuy}
              balance={item.balance}
              onBuy={onBuy}
              onInspect={onInspect}
            />
          ))}
        </div>
      ) : (
        <div className="shop-grid shop-grid--category shop-grid--deferred" aria-hidden="true">
          <div className="shop-grid__placeholder">Категория будет отрисована при прокрутке.</div>
        </div>
      )}
    </section>
  )
})

function ShopCategoryList({ groupedItems, onBuy, onInspect, isLockedGroup = false }) {
  return (
    <div className={`shop-categories${isLockedGroup ? ' shop-categories--locked' : ''}`}>
      {groupedItems.map((category, index) => (
        <ShopCategory
          key={category.id}
          category={category}
          onBuy={onBuy}
          onInspect={onInspect}
          eagerlyRender={index < 2}
          isLockedGroup={isLockedGroup}
        />
      ))}
    </div>
  )
}

function ShopCardGrid({ items, onBuy, onInspect, locked = false }) {
  return (
    <div className={`shop-grid${locked ? ' shop-grid--locked' : ''}`}>
      {items.map((item) => (
        <ShopCard
          key={item.id}
          itemId={item.id}
          item={item}
          canBuy={item.canBuy}
          balance={item.balance}
          onBuy={onBuy}
          onInspect={onInspect}
        />
      ))}
    </div>
  )
}

export const ShopScreen = observer(function ShopScreen({ type }) {
  const { uiEconomy, buySubscription, buyUpgrade, markShopItemSeen, markShopItemsSeen } = useGameStore()
  const meta = SCREEN_META[type]
  const hasItemCategories = type === 'upgrades'

  const items = type === 'subscriptions' ? uiEconomy.subscriptions : uiEconomy.upgrades
  const deferredItems = useDeferredValue(items)
  const onBuy = type === 'subscriptions' ? buySubscription : buyUpgrade

  const { unlockedItems, lockedItems, unlockedByCategory, lockedByCategory } = useMemo(() => {
    const unlocked = deferredItems.filter((item) => item.unlocked)
    const locked = deferredItems.filter((item) => !item.unlocked)

    return {
      unlockedItems: unlocked,
      lockedItems: locked,
      unlockedByCategory: hasItemCategories ? groupItemsByCategory(unlocked, type, meta.categories) : [],
      lockedByCategory: hasItemCategories ? groupItemsByCategory(locked, type, meta.categories) : [],
    }
  }, [deferredItems, hasItemCategories, meta.categories, type])

  useEffect(() => {
    const idsToMark = items
      .filter((item) => item.isNew || item.isBuyableNew)
      .map((item) => item.id)

    if (idsToMark.length) {
      markShopItemsSeen(idsToMark)
    }
  }, [items, markShopItemsSeen])

  return (
    <section className={`screen shop-screen--${meta.accent}`}>
      <div className="screen__header">
        <span className="screen__kicker">{meta.kicker}</span>
        <h2 className="screen__title">{meta.title}</h2>
        <p className="screen__desc">{meta.desc}</p>
      </div>

      {items.length === 0 ? <div className="shop-empty">{meta.emptyText}</div> : null}

      {unlockedItems.length > 0 ? (
        <section className="shop-group shop-group--active">
          {lockedItems.length > 0 ? (
            <div className="shop-group__head">
              <span className="shop-group__eyebrow">Доступно сейчас</span>
              <h3 className="shop-group__title">Разблокированные</h3>
              <p className="shop-group__desc">Выбирай с умом, выстраивай свою стратегию и просчитывай следующий шаг.</p>
            </div>
          ) : null}

          {hasItemCategories ? (
            <ShopCategoryList
              groupedItems={unlockedByCategory}
              onBuy={onBuy}
              onInspect={markShopItemSeen}
            />
          ) : (
            <ShopCardGrid items={unlockedItems} onBuy={onBuy} onInspect={markShopItemSeen} />
          )}
        </section>
      ) : null}

      {lockedItems.length > 0 ? (
        <section className="shop-group shop-group--locked">
          <div className="shop-group__head">
            <span className="shop-group__eyebrow">Следующие цели</span>
            <h3 className="shop-group__title">Заблокированные</h3>
            <p className="shop-group__desc">Эти товары откроются по мере твоего прогресса.</p>
          </div>

          {hasItemCategories ? (
            <ShopCategoryList
              groupedItems={lockedByCategory}
              onBuy={onBuy}
              onInspect={markShopItemSeen}
              isLockedGroup
            />
          ) : (
            <ShopCardGrid items={lockedItems} onBuy={onBuy} onInspect={markShopItemSeen} locked />
          )}
        </section>
      ) : null}
    </section>
  )
})
