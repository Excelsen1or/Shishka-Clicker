import {
  Coin,
  Gem,
  Lightning,
  PxlKitIcon,
  Scroll,
  Trophy,
  Community,
} from '../../lib/pxlkit'

const TONE_ICON_MAP = {
  amber: Lightning,
  emerald: Trophy,
  cyan: Coin,
  violet: Scroll,
  fuchsia: Gem,
  rose: Community,
  slate: Trophy,
}

function getCardToneClass(achievement) {
  const tone = achievement.theme?.tone ?? 'slate'
  return `achievement-card--tone-${tone}`
}

function renderToneIcon(achievement) {
  const tone = achievement.theme?.tone ?? 'slate'
  const icon = TONE_ICON_MAP[tone] ?? Trophy

  return (
    <PxlKitIcon
      icon={icon}
      size={18}
      colorful
      className="pixel-inline-icon"
      aria-label={achievement.category}
    />
  )
}

function renderStatus(achievement) {
  if (achievement.kind === 'group') {
    if (achievement.currentLevel >= achievement.maxLevel) {
      return (
        <>
          <PxlKitIcon
            icon={Trophy}
            size={16}
            colorful
            className="pixel-inline-icon"
          />{' '}
          Макс.
        </>
      )
    }

    if (achievement.currentLevel > 0) {
      return (
        <>
          <PxlKitIcon
            icon={Lightning}
            size={16}
            colorful
            className="pixel-inline-icon"
          />{' '}
          Прогресс {achievement.currentLevel}/{achievement.maxLevel}
        </>
      )
    }

    return achievement.secret ? (
      <>
        <PxlKitIcon
          icon={Community}
          size={16}
          colorful
          className="pixel-inline-icon"
        />{' '}
        Скрыто
      </>
    ) : (
      <>
        <PxlKitIcon
          icon={Gem}
          size={16}
          colorful
          className="pixel-inline-icon"
        />{' '}
        Не начато
      </>
    )
  }

  return achievement.unlocked ? (
    <>
      <PxlKitIcon
        icon={Trophy}
        size={16}
        colorful
        className="pixel-inline-icon"
      />{' '}
      Открыто
    </>
  ) : achievement.secret ? (
    <>
      <PxlKitIcon
        icon={Community}
        size={16}
        colorful
        className="pixel-inline-icon"
      />{' '}
      Скрыто
    </>
  ) : (
    <>
      <PxlKitIcon
        icon={Lightning}
        size={16}
        colorful
        className="pixel-inline-icon"
      />{' '}
      В процессе
    </>
  )
}

export const AchievementCard = ({ achievement }) => {
  const toneClass = getCardToneClass(achievement)
  const icon = renderToneIcon(achievement)

  if (achievement.kind === 'group') {
    const isDone = achievement.currentLevel >= achievement.maxLevel
    const nextPercent =
      achievement.nextTarget > 0
        ? Math.max(
            0,
            Math.min(
              100,
              (achievement.progressValue / achievement.nextTarget) * 100,
            ),
          )
        : 100

    return (
      <article
        className={`meta-card achievement-card achievement-card--group ${toneClass} ${achievement.unlocked ? 'achievement-card--done' : ''}`}
      >
        <div className="achievement-card__head">
          <span className="achievement-card__eyebrow">
            <span className="achievement-card__icon" aria-hidden="true">
              {icon}
            </span>
            {achievement.category}
          </span>
          <span className="achievement-card__level">
            ур. {achievement.levelLabel}
          </span>
        </div>

        <h3 className="achievement-card__title">{achievement.title}</h3>

        <p className="achievement-card__desc">
          {isDone ? 'Линейка закрыта полностью.' : achievement.nextDescription}
        </p>

        <div className="achievement-card__progress">
          <div className="achievement-card__progress-meta">
            <span>
              {isDone
                ? 'Финальный уровень'
                : `До ${achievement.nextLevelLabel}`}
            </span>
            <span>{achievement.progressText}</span>
          </div>
          <div className="achievement-card__track">
            <div
              className="achievement-card__track-fill"
              style={{ width: `${isDone ? 100 : nextPercent}%` }}
            />
          </div>
        </div>

        <div className="achievement-card__status">
          {renderStatus(achievement)}
        </div>
      </article>
    )
  }

  return (
    <article
      className={`meta-card achievement-card ${toneClass} ${achievement.unlocked ? 'achievement-card--done' : ''} ${achievement.secret ? 'achievement-card--secret' : ''}`}
    >
      <div className="achievement-card__head">
        <span className="achievement-card__eyebrow">
          <span className="achievement-card__icon" aria-hidden="true">
            {icon}
          </span>
          {achievement.category}
        </span>
        <span className="achievement-card__level">ур. {achievement.tier}</span>
      </div>
      <h3 className="achievement-card__title">
        {achievement.unlocked
          ? achievement.title
          : achievement.secret
            ? '??? Секретное достижение'
            : achievement.title}
      </h3>
      <p className="achievement-card__desc">
        {achievement.unlocked || !achievement.secret
          ? achievement.description
          : 'Откроется только после выполнения скрытого условия.'}
      </p>
      <div className="achievement-card__status">
        {renderStatus(achievement)}
      </div>
    </article>
  )
}
