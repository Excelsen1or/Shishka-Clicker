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
        kicker: 'Загрузка',
        title: 'Подключаем профиль',
        desc: 'Проверяем сессию и готовим доступ к облачному сохранению.',
        label: 'Подключение',
      }
    case 'syncing':
      return {
        kicker: 'Синхронизация',
        title: 'Сверяем прогресс',
        desc: 'Обновляем игровой снимок и выравниваем текущее состояние.',
        label: 'Синхронизация',
      }
    case 'loading':
    default:
      return {
        kicker: 'Загрузка',
        title: 'Загружаем облачный сейв',
        desc: 'Еще чуть-чуть: поднимаем профиль игрока и восстанавливаем прогресс.',
        label: 'Облачный профиль',
      }
  }
}

export const ScreenFallback = ({
  mode = 'screen',
  phase = 'idle',
  progressTarget = null,
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
    <section className={`screen settings-screen ${mode === 'boot' ? 'screen--boot-loading' : ''}`.trim()}>
      <div className={`${mode === 'boot' ? 'boot-loading-shell' : ''}`.trim()}>
        <div className={`screen__header ${mode === 'boot' ? 'screen__header--boot' : ''}`.trim()}>
          <span className="screen__kicker">{copy.kicker}</span>
          <h2 className="screen__title">{copy.title}</h2>
          <p className="screen__desc">{copy.desc}</p>
        </div>

        <div className="boot-loading-meter">
          <div className="boot-loading-meter__head">
            <div className="settings-card__label">{copy.label}</div>
          </div>

          <div className="unlock-progress">
            <div className="unlock-progress__row">
              <span>Прогресс загрузки</span>
              <span>{progress}%</span>
            </div>
            <div className="unlock-progress__track">
              <div className="unlock-progress__fill unlock-progress__fill--alt" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {allowOffline ? (
          <div className="boot-loading-actions">
            <button type="button" className="settings-ghost-btn" onClick={onSkipSync}>
              Пропустить синхронизацию
            </button>
            <p className="boot-loading-actions__hint">
              Пропуск нужен только для отладки и разработки. Онлайн не будет работать, если её пропустить.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
