import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { ClickerButton } from './ClickerButton.jsx'
import { ProgressFieldPanel } from './ProgressFieldPanel.jsx'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format.js'

const CLICKER_DECK_TABS = [
  { id: 'buildings', label: 'Здания' },
  { id: 'market', label: 'Рынок и хайп' },
  { id: 'upgrades', label: 'Усиления' },
  { id: 'meta', label: 'Мета' },
]

function ClickerDeckStat({ label, value, hint, tone = 'default' }) {
  return (
    <article
      className={`clicker-deck__stat clicker-deck__stat--${tone} pixel-surface`.trim()}
    >
      <span className="clicker-deck__stat-label">{label}</span>
      <strong className="clicker-deck__stat-value">{value}</strong>
      {hint ? <span className="clicker-deck__stat-hint">{hint}</span> : null}
    </article>
  )
}

function LockedDeckPanel({ title, lock }) {
  return (
    <section className="clicker-deck-lock pixel-surface">
      <span className="clicker-deck-lock__kicker">Секция закрыта</span>
      <h4 className="clicker-deck-lock__title">{title}</h4>
      <p className="clicker-deck-lock__text">{lock.text}</p>
      {Number.isFinite(lock.progress) && Number.isFinite(lock.goal) ? (
        <div className="clicker-deck-lock__progress">
          <span>Прогресс</span>
          <span>
            {formatNumber(lock.progress)} / {formatNumber(lock.goal)}
          </span>
        </div>
      ) : null}
    </section>
  )
}

export const ClickerScreen = observer(function ClickerScreen() {
  const { clickerFieldData, uiEconomy, uiPrestige, uiState } = useGameStore()
  const [activeDeckTab, setActiveDeckTab] = useState('buildings')
  const activeEvent = uiState?.activeEvent ?? null
  const activeCampaign = uiState?.activeCampaign ?? null
  const buildingCount = clickerFieldData.buildingsFieldItems.filter(
    (item) => item.count > 0,
  ).length
  const upgradeCount = clickerFieldData.upgradesFieldItems.filter(
    (item) => item.count > 0,
  ).length
  const metaCount = clickerFieldData.metaFieldItems.filter(
    (item) => item.count > 0,
  ).length
  const marketExposure = clickerFieldData.marketFieldItems.filter(
    (item) => item.count > 0,
  ).length

  const deckLocks = clickerFieldData.deckLocks
  const safeActiveDeckTab = useMemo(() => {
    if (deckLocks[activeDeckTab]?.unlocked) {
      return activeDeckTab
    }

    return 'buildings'
  }, [activeDeckTab, deckLocks])

  return (
    <section className="screen clicker-screen clicker-screen--deck">
      <div className="clicker-deck-layout">
        <div className="clicker-deck-layout__hero">
          <ClickerButton />
        </div>

        <section className="clicker-deck pixel-surface" aria-label="Пульт прогресса">
          <header className="clicker-deck__header">
            <div>
              <h3 className="clicker-deck__title">Прогресс, покупки и мета-петля</h3>
            </div>
            <div className="clicker-deck__status">
              <span>{activeCampaign ? `Хайп: ${activeCampaign.title}` : 'Хайп: нет'}</span>
              <span>{deckLocks.market.unlocked ? 'Рынок открыт' : 'Рынок закрыт'}</span>
            </div>
          </header>

          <div className="pixel-tabbar pixel-tabbar--deck" role="tablist" aria-label="Панели прогресса">
            {CLICKER_DECK_TABS.map((tab) => {
              const isActive = tab.id === safeActiveDeckTab
              const isLocked = !deckLocks[tab.id]?.unlocked

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  disabled={isLocked}
                  className={`pixel-tabbar__btn ${isActive ? 'pixel-tabbar__btn--active' : ''} ${isLocked ? 'pixel-tabbar__btn--locked' : ''}`.trim()}
                  onClick={() => setActiveDeckTab(tab.id)}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {safeActiveDeckTab === 'buildings' ? (
            <div className="clicker-deck__body">
              <div className="clicker-deck__stats">
                <ClickerDeckStat
                  label="Зданий приобретено"
                  value={formatNumber(buildingCount)}
                />
                <ClickerDeckStat
                  label="Шишек в секунду"
                  value={`+${formatNumber(uiEconomy.shishkiPerSecond)}`}
                  tone="accent"
                />
              </div>
              <ProgressFieldPanel
                title="Здания"
                items={clickerFieldData.buildingsFieldItems}
                className="progress-field-panel--deck"
              />
            </div>
          ) : null}

          {safeActiveDeckTab === 'market' ? (
            deckLocks.market.unlocked ? (
              <div className="clicker-deck__body">
                <div className="clicker-deck__stats">
                  <ClickerDeckStat
                    label="Экспозиция"
                    value={formatNumber(marketExposure)}
                    hint="позиций и кампаний в игре"
                  />
                  <ClickerDeckStat
                    label="Окно"
                    value={activeEvent ? activeEvent.title : 'Спокойно'}
                    hint={activeEvent ? 'событие активно' : 'ждём новый всплеск'}
                    tone="accent"
                  />
                </div>
                <ProgressFieldPanel
                  title="Рынок и хайп"
                  items={clickerFieldData.marketFieldItems}
                  className="progress-field-panel--deck"
                />
              </div>
            ) : (
              <LockedDeckPanel title="Рынок и хайп" lock={deckLocks.market} />
            )
          ) : null}

          {safeActiveDeckTab === 'upgrades' ? (
            deckLocks.upgrades.unlocked ? (
              <div className="clicker-deck__body">
                <div className="clicker-deck__stats">
                  <ClickerDeckStat
                    label="Усилений приобретено"
                    value={formatNumber(upgradeCount)}
                  />
                  <ClickerDeckStat
                    label="Сила клика"
                    value={formatNumber(uiState.clickPower)}
                    tone="accent"
                  />
                </div>
                <ProgressFieldPanel
                  title="Усиления"
                  items={clickerFieldData.upgradesFieldItems}
                  className="progress-field-panel--deck"
                />
              </div>
            ) : (
              <LockedDeckPanel title="Усиления" lock={deckLocks.upgrades} />
            )
          ) : null}

          {safeActiveDeckTab === 'meta' ? (
            deckLocks.meta.unlocked ? (
              <div className="clicker-deck__body">
                <div className="clicker-deck__stats">
                  <ClickerDeckStat
                    label="Небесные"
                    value={formatNumber(uiPrestige.heavenlyShishki)}
                    hint="резерв на ребёрс"
                  />
                  <ClickerDeckStat
                    label="Комочки"
                    value={formatNumber(uiPrestige.tarLumps)}
                    hint="перманентные уровни"
                    tone="accent"
                  />
                  <ClickerDeckStat
                    label="Мета-линий"
                    value={formatNumber(metaCount)}
                    hint="открытых перманентных усилений"
                  />
                </div>
                <ProgressFieldPanel
                  title="Мета"
                  items={clickerFieldData.metaFieldItems}
                  className="progress-field-panel--deck"
                />
              </div>
            ) : (
              <LockedDeckPanel title="Мета" lock={deckLocks.meta} />
            )
          ) : null}
        </section>
      </div>
    </section>
  )
})
