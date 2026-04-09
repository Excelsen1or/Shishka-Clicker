import { useGameContext } from '../../context/GameContext'
import { ShopCard } from './ShopCard'

const SCREEN_META = {
  subscriptions: {
    kicker: 'Магазин',
    title: 'AI-сервисы',
    desc: 'Подписки ускоряют добычу денег и знаний. Новые сервисы открываются только после реального прогресса.',
    accent: 'fuchsia',
    emptyText: 'Подписки загружаются…',
  },
  upgrades: {
    kicker: 'Магазин',
    title: 'Инвестиции и исследования',
    desc: 'Улучшения влияют на клик, автоматизацию и позднюю игру. Теперь тут есть полноценная ветка апгрейдов за шишки, а не только за деньги и знания.',
    accent: 'cyan',
    emptyText: 'Апгрейды загружаются…',
  },
}

export function ShopScreen({ type }) {
  const { economy, state, buySubscription, buyUpgrade } = useGameContext()
  const meta = SCREEN_META[type]

  const items = type === 'subscriptions' ? economy.subscriptions : economy.upgrades
  const onBuy = type === 'subscriptions' ? buySubscription : buyUpgrade

  return (
    <section className={`screen shop-screen shop-screen--${meta.accent}`}>
      <div className="screen__glow" />

      <div className="screen__header">
        <span className="screen__kicker">{meta.kicker}</span>
        <h2 className="screen__title">{meta.title}</h2>
        <p className="screen__desc">{meta.desc}</p>
      </div>

      <div className="shop-grid">
        {items.length === 0 && (
          <div className="shop-empty">{meta.emptyText}</div>
        )}
        {items.map((item, i) => {
          const balance = state[item.currency]
          return (
            <ShopCard
              key={item.id}
              item={item}
              canBuy={balance >= item.cost}
              onBuy={() => onBuy(item.id)}
              delay={i}
            />
          )
        })}
      </div>
    </section>
  )
}
