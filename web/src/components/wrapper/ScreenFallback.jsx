import { useEffect, useMemo, useState } from 'react'

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
      kicker: 'Загрузка',
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
        kicker: 'Загрузка',
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
  const target = progressTarget ?? resolveTargetProgress(phase)
  const [progress, setProgress] = useState(target)

  useEffect(() => {
    setProgress(target)
  }, [target])

  return (
    <section
      className={`screen settings-screen ${mode === 'boot' ? 'screen--boot-loading' : ''}`.trim()}
    >
      <div className={`${mode === 'boot' ? 'boot-loading-shell' : ''}`.trim()}>
        <div
          className={`screen__header ${mode === 'boot' ? 'screen__header--boot' : ''}`.trim()}
        >
          <span className="screen__kicker">{copy.kicker}</span>
          <h2 className="screen__title">{copy.title}</h2>
          <p className="screen__desc">{copy.desc}</p>
        </div>

        <div className="boot-loading-meter">
          <div className="boot-loading-meter__head">
            <div className="settings-card__label">{copy.label}</div>
            <div className="boot-loading-meter__value">{progress}%</div>
          </div>

          <div className="unlock-progress">
            <div className="unlock-progress__row"></div>
            <div className="unlock-progress__track">
              <div
                className="unlock-progress__fill unlock-progress__fill--alt"
                style={{ width: `${progress}%` }}
              />
            </div>
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
