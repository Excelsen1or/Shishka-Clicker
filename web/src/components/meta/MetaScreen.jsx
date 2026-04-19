import { observer } from 'mobx-react-lite'
import { StatCard } from '../stats/StatCard.jsx'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format'

export const MetaScreen = observer(function MetaScreen() {
  const { uiState, uiPrestige, uiEconomy, prestigeReset, buyPrestigeUpgrade } =
    useGameStore()

  const prestigeStats = [
    {
      iconKey: 'rebirth',
      label: 'Ребёрсов',
      value: formatNumber(uiState.rebirths),
      hint: 'сделано циклов',
    },
    {
      iconKey: 'shards',
      label: 'Небесные',
      value: formatNumber(uiState.heavenlyShishki),
      hint: 'на руках сейчас',
    },
    {
      iconKey: 'knowledge',
      label: 'Комочки',
      value: formatNumber(uiState.tarLumps),
      hint: 'редкий мета-ресурс',
    },
  ]

  return (
    <section className="screen meta-screen">
      <div className="screen__header">
        <span className="screen__kicker">Мета</span>
        <h2 className="screen__title">Небесные шишки и смола</h2>
        <p className="screen__desc">
          Закрывай квоты, жми ребёрс и вкручивай постоянные бусты в новую жизнь.
        </p>
      </div>

      <section className="stats-bar stats-bar--shop">
        {prestigeStats.map((item) => (
          <StatCard key={item.label} {...item} variant="pixel" formatValue={false} />
        ))}
      </section>

      <article className="meta-card pixel-surface">
        <div className="meta-card__kicker">Текущая квота</div>
        <h3>
          {formatNumber(uiPrestige.currentRunShishki)} /{' '}
          {formatNumber(uiPrestige.currentQuotaTarget)} шишек
        </h3>
        <p>
          Следующая цель: {formatNumber(uiPrestige.nextQuotaTarget)}. Каждое
          закрытие квоты даёт +1 небесную шишку без ребёрса.
        </p>
        <button type="button" className="shop-card__btn" onClick={prestigeReset}>
          Переродиться
        </button>
      </article>

      <section className="shop-grid">
        {uiEconomy.prestigeUpgrades.map((item) => (
          <article
            key={item.id}
            className="shop-card shop-card--shishki shop-card--rarity-common"
          >
            <div className="shop-card__head">
              <div className="shop-card__meta">
                <div>
                  <h3 className="shop-card__title">{item.title}</h3>
                  <p className="shop-card__desc">
                    Постоянное улучшение мета-экономики.
                  </p>
                </div>
              </div>
              <div className="shop-card__chips">
                <span className="shop-card__tier">ур. {formatNumber(item.level)}</span>
              </div>
            </div>
            <div className="shop-card__body">
              <div className="shop-card__effect-line">
                Цена: {formatNumber(item.cost)} небесных шишек
              </div>
            </div>
            <div className="shop-card__footer">
              <button
                type="button"
                className="shop-card__btn"
                onClick={() => buyPrestigeUpgrade(item.id)}
                disabled={uiState.heavenlyShishki < item.cost}
              >
                {uiState.heavenlyShishki < item.cost ? 'Нужно больше небесных' : 'Купить'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </section>
  )
})
