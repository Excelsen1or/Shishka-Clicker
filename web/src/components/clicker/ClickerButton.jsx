import {useEffect, useRef, useState} from 'react'
import { useGameContext } from '../../context/GameContext'
import { useBursts } from '../../hooks/useBursts'
import { useSound } from '../../hooks/useSound'
import { ClickBurst } from '../ui/ClickBurst'
import { formatNumber } from '../../lib/format'
import buttonImage from '../../assets/disco.gif'
import vityaImage from '../../assets/v4.png'
import shishkaSound from '../../assets/audio/ui/shishka.mp3'

export function ClickerButton() {
  const cones = useRef([])
  const containerRef = useRef(null)

  const { state, mineShishki } = useGameContext()
  const { bursts, addBurst } = useBursts()
  const { play } = useSound(shishkaSound, { volume: 0.5 })

  const spawnCones = (e, amount) => {
    const id = Date.now()

    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 2 + 2

      const newCone = {
        id: id + i,
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 300
      }

      cones.current.push(newCone)
    }
  }



  useEffect(() => {
    let frame

    const update = () => {
      const container = containerRef.current
      if (!container) return

      container.innerHTML = ''

      cones.current = cones.current.filter(p => p.life > 0)

      cones.current.forEach(p => {
        // физика
        p.vy += 0.04 // гравитация
        p.x += p.vx
        p.y += p.vy
        p.life--

        // создаём DOM элемент
        const el = document.createElement('div')
        el.textContent = '🌰'
        el.style.position = 'absolute'
        el.style.left = p.x + 'px'
        el.style.top = p.y + 'px'
        el.style.pointerEvents = 'none'

        container.appendChild(el)
      })

      frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [])

  function handleClick(e) {
    if (e.detail === 0) { e.preventDefault(); return }

    play()
    mineShishki()

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX
    const y = e.clientY
    addBurst(x, y, `+${formatNumber(state.clickPower)}`)
    spawnCones(e, state.clickPower)
  }

  function preventKeyboard(e) {
    if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
  }

  const isActive = state.shishkiPerSecond > 0

  return (
    <div className="clicker-wrap">
      {/*{cones.current.map((item) => (*/}
      {/*  <div*/}
      {/*    key={Math.random()}*/}
      {/*    className="falling"*/}
      {/*    style={{*/}
      {/*      left: item.x,*/}
      {/*      top: item.y,*/}
      {/*      transform: 'translate(-50%, -50%)'*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    🌰*/}
      {/*  </div>*/}
      {/*))}*/}
      <div
        className="clicker-btn"
        onClick={handleClick}
        onKeyDown={preventKeyboard}
        aria-label="Добыть шишки"
      >
        <div ref={containerRef} />
        <div className="clicker-btn__halo" />
        <div className="clicker-btn__ring clicker-btn__ring--outer" />
        <div className="clicker-btn__ring clicker-btn__ring--inner" />
        <img
          src={isActive ? buttonImage : vityaImage}
          alt="Шишка"
          className="clicker-btn__hero"
          draggable={false}
        />
        <div className="clicker-btn__label">Кликни и добудь вышку</div>
        <div className="clicker-btn__sub">За клик: +{formatNumber(state.clickPower)} 🌰</div>
      </div>

      <ClickBurst bursts={bursts} />
    </div>
  )
}
