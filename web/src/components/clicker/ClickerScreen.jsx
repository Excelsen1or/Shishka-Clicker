import { observer } from 'mobx-react-lite'
import { ClickerButton } from './ClickerButton.jsx'
import { ProgressFieldPanel } from './ProgressFieldPanel.jsx'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format.js'

export const ClickerScreen = observer(function ClickerScreen() {
  const { clickerFieldData, uiEconomy, uiPrestige } = useGameStore()

  return (
    <section className="screen clicker-screen clicker-screen--field">
      <div className="clicker-field-layout">
        <section className="clicker-field-layout__zone clicker-field-layout__zone--left">
          <ProgressFieldPanel title="Здания" items={clickerFieldData.buildingsFieldItems} />
        </section>

        <section className="clicker-field-layout__center">
          <div className="clicker-core-strip pixel-surface" aria-label="Кликер-метрики">
            <div className="clicker-core-strip__item">
              <span className="clicker-core-strip__label">Шишки/сек</span>
              <strong className="clicker-core-strip__value">
                +{formatNumber(uiEconomy.shishkiPerSecond)}
              </strong>
            </div>
            <div className="clicker-core-strip__item">
              <span className="clicker-core-strip__label">Квота</span>
              <strong className="clicker-core-strip__value">
                {formatNumber(uiPrestige.currentRunShishki)} / {formatNumber(uiPrestige.currentQuotaTarget)}
              </strong>
            </div>
          </div>
          <ClickerButton />
        </section>

        <section className="clicker-field-layout__zone clicker-field-layout__zone--right">
          <ProgressFieldPanel title="Рынок и хайп" items={clickerFieldData.marketFieldItems} />
        </section>

        <section className="clicker-field-layout__bottom">
          <ProgressFieldPanel title="Усиления и мета" items={clickerFieldData.metaFieldItems} />
        </section>
      </div>
    </section>
  )
})
