import { useCallback, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'
import wrongImg from '../../assets/wrong.png'
import {useSound} from "../../hooks/useSound.js"
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'


const RESOURCES = [
  { key: 'shishki', label: 'Шишки', icon: '🌰' },
  { key: 'money', label: 'Деньги', icon: '💵' },
  { key: 'knowledge', label: 'Знания', icon: '📚' },
  { key: 'prestigeShards', label: 'Осколки', icon: '💎' },
]

const PRESETS = [1e3, 1e4, 100e3, 1e6, 1e9]

const DevConsolePanel = observer(function DevConsolePanel() {
  const { devConsoleResources, _devGiveResource, _devSetResource } = useGameContext()
  const [cheatsEnabled, setCheatsEnabled] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [log, setLog] = useState([])
  const footerRef = useRef(null)
  const [showWrongOverlay, setShowWrongOverlay] = useState(false)
  const inputRef = useRef(null)
  const overlayTimerRef = useRef(null)
  const { play } = useSound(denySound, { volume: 0.1 })

  const commandsDesc = {
    "date": "показывает текущую дату",
    "clear": "очищает консоль"
  }

  const commands = {
    "date": () => pushLog(new Date().toLocaleString()),
    "sv.cheats true": () => {
      setCheatsEnabled(true)
      pushLog('Читы активированы. Админ-панель открыта.', 'success')
    },
    "help": () => {
      const divider = "============================"

      pushLog(divider)
      for (const [key, value] of Object.entries(commandsDesc)) {
        pushLog(`${key} - ${value}`, "info")
      }
      pushLog(divider)
    },
    "clear": () => setLog([])
  }

  const pushLog = useCallback((text, type = 'info') => {
    setLog((prev) => [...prev.slice(-49), { text, type, ts: Date.now() }])
  }, [])

  useEffect(() => {
    window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(overlayTimerRef.current)
  }, [])

  useEffect(() => {
    footerRef.current?.scrollIntoView({
      behavior: "smooth"
    })
  }, [log])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const cmd = inputValue.trim()
    if (!cmd) return
    setInputValue('')

    pushLog(`> ${cmd}`, 'cmd')

    if (!cheatsEnabled) {
      // если в командах есть текущая команда, выполняем
      if (cmd in commands) {
        commands[cmd]()
        return
      }

      // если команды нет
      pushLog('Не угадал, такого нет.', 'error')
      setShowWrongOverlay(true)
      clearTimeout(overlayTimerRef.current)
      overlayTimerRef.current = setTimeout(() => setShowWrongOverlay(false), 1600)
      await play()

      return
    }

    if (cmd === 'sv.cheats false') {
      setCheatsEnabled(false)
      pushLog('Читы деактивированы.', 'warn')
      return
    }

    if (cmd === 'help') {
      pushLog('Команды: give <ресурс> <число> | set <ресурс> <число> | status | sv.cheats false', 'info')
      pushLog('Ресурсы: shishki, money, knowledge, shards', 'info')
      return
    }

    if (cmd === 'status') {
      pushLog(
        `Шишки: ${devConsoleResources.shishkiText} | Деньги: ${devConsoleResources.moneyText} | Знания: ${devConsoleResources.knowledgeText} | Осколки: ${devConsoleResources.prestigeShardsText}`,
        'info',
      )
      return
    }

    const giveMatch = cmd.match(/^give\s+(shishki|money|knowledge|shards)\s+([0-9eE+.]+)$/i)
    if (giveMatch) {
      const key = giveMatch[1].toLowerCase() === 'shards' ? 'prestigeShards' : giveMatch[1].toLowerCase()
      const amount = Number(giveMatch[2])
      if (!Number.isFinite(amount) || amount <= 0) {
        pushLog('Невалидное число.', 'error')
        return
      }
      _devGiveResource(key, amount)
      pushLog(`+${formatNumber(amount)} к ${key}`, 'success')
      return
    }

    const setMatch = cmd.match(/^set\s+(shishki|money|knowledge|shards)\s+([0-9eE+.]+)$/i)
    if (setMatch) {
      const key = setMatch[1].toLowerCase() === 'shards' ? 'prestigeShards' : setMatch[1].toLowerCase()
      const amount = Number(setMatch[2])
      if (!Number.isFinite(amount) || amount < 0) {
        pushLog('Невалидное число.', 'error')
        return
      }
      _devSetResource(key, amount)
      pushLog(`${key} = ${formatNumber(amount)}`, 'success')
      return
    }

    pushLog('Неизвестная команда. Введите help.', 'error')
    setShowWrongOverlay(true)
    clearTimeout(overlayTimerRef.current)
    overlayTimerRef.current = setTimeout(() => setShowWrongOverlay(false), 1600)
  }

  function giveResource(key, amount) {
    _devGiveResource(key, amount)
    pushLog(`+${formatNumber(amount)} к ${key}`, 'success')
  }

  function setResource(key, value) {
    _devSetResource(key, value)
    pushLog(`${key} = ${formatNumber(value)}`, 'success')
  }

  return (
    <div className="dev-console">
      <div className="dev-console__header">
        <span>🖥 Консоль</span>
      </div>

      <div className="dev-console__log">
        {log.length === 0 && (
          <>
            <div className="dev-console__hint">
              {cheatsEnabled
                ? 'Введите help для списка команд'
                : 'Введите секретную команду для активации читов…'}
            </div>
            {!cheatsEnabled && <div className="dev-console__hint">
              или help для списка команд
            </div>}
          </>
        )}
        {log.map((entry) => (
          <div key={entry.ts + entry.text} className={`dev-console__line dev-console__line--${entry.type}`}>
            {entry.text}
          </div>
        ))}
        <div ref={footerRef} />
      </div>

      {showWrongOverlay && (
        <div className="dev-console__wrong-overlay">
          <img src={wrongImg} alt="wrong" />
        </div>
      )}

      <form className="dev-console__input-row" onSubmit={handleSubmit}>
        <span className="dev-console__prompt">&gt;</span>
        <input
          ref={inputRef}
          className="dev-console__input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={cheatsEnabled ? 'help / give / set / status' : 'Введите команду…'}
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      {cheatsEnabled && (
        <div className="dev-admin">
          <div className="dev-admin__title">⚡ Админ-панель</div>
          <div className="dev-admin__grid">
            {RESOURCES.map((resource) => (
              <div key={resource.key} className="dev-admin__card">
                <div className="dev-admin__card-head">
                  <span>{resource.icon}</span>
                  <span className="dev-admin__card-label">{resource.label}</span>
                  <span className="dev-admin__card-value">{devConsoleResources[`${resource.key}Text`]}</span>
                </div>
                <div className="dev-admin__presets">
                  {PRESETS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="dev-admin__btn dev-admin__btn--add"
                      onClick={() => giveResource(resource.key, amount)}
                    >
                      +{formatNumber(amount)}
                    </button>
                  ))}
                </div>
                <div className="dev-admin__presets">
                  <button type="button" className="dev-admin__btn dev-admin__btn--set" onClick={() => setResource(resource.key, 0)}>
                    Обнулить
                  </button>
                  <button type="button" className="dev-admin__btn dev-admin__btn--set" onClick={() => setResource(resource.key, 1e12)}>
                    Max (1T)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export function DevConsole() {
  const [consoleOpen, setConsoleOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === '`' || event.key === '~' || event.code === 'Backquote') {
        event.preventDefault()
        setConsoleOpen((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!consoleOpen) return null

  return (
    <div className="dev-console-overlay">
      <div className="dev-console-shell">
        <button type="button" className="dev-console__close" onClick={() => setConsoleOpen(false)}>✕</button>
        <DevConsolePanel />
      </div>
    </div>
  )
}
