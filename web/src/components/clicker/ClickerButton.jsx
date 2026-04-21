import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { useSettingsVisuals } from '../../context/SettingsContext'
import { useNav } from '../../context/NavContext'
import { useSound } from '../../hooks/useSound'
import raccoonHeroGif from '../../assets/hero-raccoon/def-anim.gif'
import firstLayerImage from '../../assets/background/firstlayer.png'
import secondLayerImage from '../../assets/background/secondlayer.png'
import behindCloudsImage from '../../assets/background/behindclouds.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'
import { buildClickEffectPoints } from './clickEffects'
import { ClickerEffectsOverlay } from './ClickerEffectsOverlay.jsx'
import {
  getRandomInt,
  getTierForTps,
  GREETING_LABELS,
  IDLE_LABELS,
  IDLE_TIMEOUT,
  pickRandom,
  pruneTapTimestampsInPlace,
  RETURN_LABELS,
  TAP_SPEED_TIERS,
  VISUAL_DURATIONS,
} from './clickerButtonContent.js'

export const ClickerButton = observer(function ClickerButton() {
  const [visualState, setVisualState] = useState('idle')
  const [heroFacing, setHeroFacing] = useState(1)
  const [heroAnimNonce, setHeroAnimNonce] = useState(0)
  const [clickerLabel, setClickerLabel] = useState(() =>
    pickRandom(GREETING_LABELS),
  )
  const [isLabelShaking, setIsLabelShaking] = useState(false)

  const visualTimeoutRef = useRef(null)
  const idleTimeoutRef = useRef(null)
  const tapTimestampsRef = useRef([])
  const lastTierIndexRef = useRef(0)
  const lastLabelIndexRef = useRef(0)
  const effectsOverlayRef = useRef(null)
  const buttonRef = useRef(null)

  const { mineShishki, markAutoClicker } = useGameStore()
  const { visualEffectToggles } = useSettingsVisuals()
  const { activeTab } = useNav()
  const { play } = useSound(shishkaSound, {
    volume: 0.42,
    randomPitch: [-3.9, 5.8],
  })

  const prevTabRef = useRef(activeTab)

  const isCharged =
    visualEffectToggles.clickAnimations && visualState !== 'idle'

  useEffect(() => {
    return () => {
      if (visualTimeoutRef.current)
        window.clearTimeout(visualTimeoutRef.current)
      if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const prev = prevTabRef.current
    prevTabRef.current = activeTab

    if (activeTab === 'clicker' && prev !== 'clicker') {
      const pool = RETURN_LABELS[prev]
      if (pool) {
        setClickerLabel(pickRandom(pool))
      }
    }
  }, [activeTab])

  function armVisualState(nextState) {
    setVisualState('idle')

    requestAnimationFrame(() => {
      setVisualState(nextState)

      if (visualTimeoutRef.current)
        window.clearTimeout(visualTimeoutRef.current)
      visualTimeoutRef.current = window.setTimeout(() => {
        setVisualState('idle')
      }, VISUAL_DURATIONS[nextState])
    })
  }

  function blockKeyboardActivation(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    event.stopPropagation()
  }

  function scheduleIdleLabel() {
    if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current)
    idleTimeoutRef.current = window.setTimeout(() => {
      setClickerLabel(pickRandom(IDLE_LABELS))
      lastTierIndexRef.current = -1
      setIsLabelShaking(false)
    }, IDLE_TIMEOUT)
  }

  function rotateClickerLabel() {
    const now = Date.now()
    tapTimestampsRef.current.push(now)
    pruneTapTimestampsInPlace(tapTimestampsRef.current, now)

    scheduleIdleLabel()

    const elapsed = (now - tapTimestampsRef.current[0]) / 1000
    const tps =
      elapsed > 0 ? (tapTimestampsRef.current.length - 1) / elapsed : 0

    setIsLabelShaking(tps >= 7)

    if (tps >= 11) {
      markAutoClicker()
    }

    const tier = getTierForTps(tps)
    const tierIndex = TAP_SPEED_TIERS.indexOf(tier)
    const tierChanged = tierIndex !== lastTierIndexRef.current

    if (tierChanged) {
      lastTierIndexRef.current = tierIndex
      const nextIndex = getRandomInt(0, tier.labels.length - 1)
      lastLabelIndexRef.current = nextIndex
      setClickerLabel(tier.labels[nextIndex])
      return
    }

    if (tapTimestampsRef.current.length % 3 === 0) {
      let nextIndex = getRandomInt(0, tier.labels.length - 1)
      if (tier.labels.length > 1) {
        while (nextIndex === lastLabelIndexRef.current) {
          nextIndex = getRandomInt(0, tier.labels.length - 1)
        }
      }
      lastLabelIndexRef.current = nextIndex
      setClickerLabel(tier.labels[nextIndex])
    }
  }

  function handleClick(event) {
    if (event.detail === 0) {
      event.preventDefault()
      return
    }

    play()

    const result = mineShishki()
    const nextVisualState = result.isEmojiExplosion
      ? 'prism'
      : result.isMega
        ? 'mega'
        : 'tap'
    setHeroFacing((current) => current * -1)

    if (visualEffectToggles.clickAnimations) {
      setHeroAnimNonce((current) => current + 1)
      armVisualState(nextVisualState)
    }

    rotateClickerLabel()

    const effectPoints = buildClickEffectPoints(event.currentTarget, event)
    effectsOverlayRef.current?.spawn({
      result,
      ...effectPoints,
    })
  }

  return (
    <div className="clicker-wrap clicker-wrap--pixel clicker-wrap--scene">
      <button
        ref={buttonRef}
        type="button"
        className={`clicker-btn clicker-btn--pixel ${isCharged ? 'clicker-btn--charged' : ''} ${visualState !== 'idle' ? `clicker-btn--${visualState}` : ''}`.trim()}
        data-buff-state={visualState}
        onClick={handleClick}
        onKeyDown={blockKeyboardActivation}
        onKeyUp={blockKeyboardActivation}
        aria-label="Добыть шишки"
      >
        <div className="clicker-wrap__scene" aria-hidden="true">
          <span className="clicker-wrap__scene-layer clicker-wrap__scene-layer--clouds">
            <span className="clicker-wrap__cloud-band">
              <img
                src={behindCloudsImage}
                alt=""
                className="clicker-wrap__scene-image clicker-wrap__scene-image--clouds"
                draggable={false}
              />
              <img
                src={behindCloudsImage}
                alt=""
                className="clicker-wrap__scene-image clicker-wrap__scene-image--clouds"
                draggable={false}
              />
            </span>
          </span>
          <span className="clicker-wrap__scene-layer clicker-wrap__scene-layer--mid">
            <img
              src={secondLayerImage}
              alt=""
              className="clicker-wrap__scene-image clicker-wrap__scene-image--mid"
              draggable={false}
            />
          </span>
          <span className="clicker-wrap__scene-layer clicker-wrap__scene-layer--front">
            <img
              src={firstLayerImage}
              alt=""
              className="clicker-wrap__scene-image clicker-wrap__scene-image--front"
              draggable={false}
            />
          </span>
        </div>

        <span
          className="clicker-btn__pixel-corner clicker-btn__pixel-corner--tl"
          aria-hidden="true"
        />
        <span
          className="clicker-btn__pixel-corner clicker-btn__pixel-corner--tr"
          aria-hidden="true"
        />
        <span
          className="clicker-btn__pixel-corner clicker-btn__pixel-corner--bl"
          aria-hidden="true"
        />
        <span
          className="clicker-btn__pixel-corner clicker-btn__pixel-corner--br"
          aria-hidden="true"
        />

        <div className="clicker-btn__core">
          <span className="clicker-btn__hero-motion">
            <img
              src={raccoonHeroGif}
              alt="Шишка"
              className={`clicker-btn__hero${visualState !== 'idle' ? ` clicker-btn__hero--${visualState} clicker-btn__hero--pulse-${heroAnimNonce % 2}` : ''}`}
              style={{ '--hero-facing': heroFacing }}
              draggable={false}
            />
          </span>
        </div>

        <div
          className={`clicker-btn__content${isLabelShaking ? ' clicker-btn__content--shake' : ''}`}
        >
          <span className="clicker-btn__label">{clickerLabel}</span>
        </div>
      </button>

      <ClickerEffectsOverlay ref={effectsOverlayRef} anchorRef={buttonRef} />
    </div>
  )
})
