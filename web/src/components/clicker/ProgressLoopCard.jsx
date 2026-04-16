import { Coin, Gem, PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { ConeIcon } from '../ui/ConeIcon'

export const ProgressLoopCard = () => {
  return (
    <article className="meta-card progress-loop-card">
      <div className="meta-card__kicker">Петля прогресса</div>
      <div className="progress-loop__steps">
        <div className="loop-step">
          <b>1.</b> Кликаешь и фармишь{' '}
          <b>
            <ConeIcon /> шишки
          </b>
          .
        </div>
        <div className="loop-step">
          <b>2.</b> Вкладываешь их в ветки за{' '}
          <b>
            <PxlKitIcon
              icon={Coin}
              size={16}
              colorful
              className="pixel-inline-icon"
            />{' '}
            деньги
          </b>
          ,{' '}
          <b>
            <PxlKitIcon
              icon={Scroll}
              size={16}
              colorful
              className="pixel-inline-icon"
            />{' '}
            знания
          </b>{' '}
          и{' '}
          <b>
            <ConeIcon /> шишечные апгрейды
          </b>
          .
        </div>
        <div className="loop-step">
          <b>3.</b> Открываешь престиж, закрываешь квоту цикла и получаешь
          редкие{' '}
          <b>
            <PxlKitIcon
              icon={Gem}
              size={16}
              colorful
              className="pixel-inline-icon"
            />{' '}
            осколки
          </b>
          .
        </div>
      </div>
    </article>
  )
}
