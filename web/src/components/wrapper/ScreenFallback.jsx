import { useMemo } from 'react'
import { Lightning, PxlKitIcon, Robot, SparkleSmall } from '../../lib/pxlkit'
import { formatNumber } from '../../lib/format.js'

function resolveTargetProgress(phase) {
  switch (phase) {
    case 'connecting':
      return 18
    case 'loading':
      return 46
    case 'syncing':
      return 76
    case 'ready':
      return 100
    default:
      return 58
  }
}

function resolveLoadingCopy(phase, mode) {
  if (mode === 'screen') {
    return {
      title: 'Подготавливаем экран',
      desc: 'Подтягиваем модуль интерфейса и собираем нужный экран.',
      label: 'Интерфейс',
    }
  }

  switch (phase) {
    case 'connecting':
      return {
        kicker: 'Подключение',
        title: 'Готовим профиль игрока',
        desc: 'Проверяем сессию, авторизацию и доступ к облачному сохранению.',
        label: 'Сессия',
      }
    case 'syncing':
      return {
        kicker: 'Синхронизация',
        title: 'Сверяем прогресс с облаком',
        desc: 'Поднимаем актуальный сейв, фиксируем версию и добираем данные интерфейса.',
        label: 'Облачный сейв',
      }
    case 'ready':
      return {
        kicker: 'Финиш',
        title: 'Запуск почти завершён',
        desc: 'Последние штрихи перед входом в игру.',
        label: 'Финализация',
      }
    case 'loading':
    default:
      return {
        title: 'Собираем стартовый экран',
        desc: 'Ждём, пока подтянутся профиль, сейв и рейтинг, чтобы интерфейс открылся уже с данными.',
        label: 'Старт',
      }
  }
}

function resolveStepStateLabel(state) {
  switch (state) {
    case 'done':
      return 'Готово'
    case 'active':
      return 'В работе'
    case 'error':
      return 'С ошибкой'
    default:
      return 'Ожидание'
  }
}

export const ScreenFallback = ({
  mode = 'screen',
  phase = 'idle',
  progressTarget = null,
  steps = [],
  allowOffline = false,
  onSkipSync = null,
}) => {
  const copy = useMemo(() => resolveLoadingCopy(phase, mode), [mode, phase])
  const progress = progressTarget ?? resolveTargetProgress(phase)

  const completedSteps = steps.filter((step) => step.state === 'done').length
  const activeStep = steps.find((step) => step.state === 'active')
  const statusTone =
    phase === 'ready'
      ? 'ready'
      : steps.some((step) => step.state === 'error')
        ? 'error'
        : 'active'

  return (
    <section
      className={`screen settings-screen ${mode === 'boot' ? 'screen--boot-loading' : ''}`.trim()}
    >
      <div
        className={`${mode === 'boot' ? 'boot-loading-shell' : ''} boot-loading-shell--pixel`.trim()}
      >
        <div
          className={`screen__header ${mode === 'boot' ? 'screen__header--boot' : ''}`.trim()}
        >
          <div className="boot-loading-marquee">
            <span className="pixel-badge boot-loading-marquee__badge">
              <PxlKitIcon
                icon={Lightning}
                size={12}
                colorful
                className="pixel-inline-icon"
              />
              <span>{mode === 'boot' ? 'BOOT SECTOR' : 'PIXEL UI'}</span>
            </span>
            <span
              className={`boot-loading-marquee__status boot-loading-marquee__status--${statusTone}`}
            >
              {phase === 'ready' ? 'READY' : 'SYNC'}
            </span>
          </div>

          <span className="screen__kicker">{copy.kicker}</span>
          <h2 className="screen__title">{copy.title}</h2>
          <p className="screen__desc">{copy.desc}</p>

          <div className="boot-loading-ledger" aria-hidden="true">
            <span>
              <PxlKitIcon
                icon={Robot}
                size={12}
                colorful
                className="pixel-inline-icon"
              />
              PIPELINE
            </span>
            <span>
              <PxlKitIcon
                icon={SparkleSmall}
                size={12}
                colorful
                className="pixel-inline-icon"
              />
              {formatNumber(completedSteps)}/
              {formatNumber(Math.max(steps.length, 1))} READY
            </span>
          </div>
        </div>

        <div className="boot-loading-meter">
          <div className="boot-loading-meter__head">
            <div className="settings-card__label">{copy.label}</div>
            <div className="boot-loading-meter__value">
              {formatNumber(progress)}%
            </div>
          </div>

          <div className="unlock-progress">
            <div className="unlock-progress__row" />
            <div className="unlock-progress__track">
              <div
                className="unlock-progress__fill unlock-progress__fill--alt"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="boot-loading-progress-meta">
            <span>{copy.label}</span>
            <span>{activeStep?.label ?? 'Ожидание'}</span>
          </div>

          {steps.length ? (
            <div className="boot-loading-steps">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`boot-loading-step boot-loading-step--${step.state}`.trim()}
                >
                  <div
                    className="boot-loading-step__marker"
                    aria-hidden="true"
                  />
                  <div className="boot-loading-step__body">
                    <div className="boot-loading-step__head">
                      <strong>{step.label}</strong>
                      <span>{resolveStepStateLabel(step.state)}</span>
                    </div>
                    <p>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {allowOffline ? (
          <div className="boot-loading-actions">
            <button
              type="button"
              className="settings-ghost-btn"
              onClick={onSkipSync}
            >
              Пропустить синхронизацию
            </button>
            <p className="boot-loading-actions__hint">
              Пропуск нужен только для отладки и разработки. Онлайн не будет
              работать, если её пропустить.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
