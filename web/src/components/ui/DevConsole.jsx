import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { formatNumber } from '../../lib/format'

const SECRET = 'sv.cheats true'

const RESOURCES = [
  { key: 'shishki', label: 'Шишки', icon: '🌰' },
  { key: 'money', label: 'Деньги', icon: '💵' },
  { key: 'knowledge', label: 'Знания', icon: '📚' },
  { key: 'prestigeShards', label: 'Осколки', icon: '💎' },
]

const PRESETS = [1000, 10_000, 100_000, 1_000_000, 1e9]

export function DevConsole() {
  const { state, _devGiveResource, _devSetResource } = useGameContext()
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [cheatsEnabled, setCheatsEnabled] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [log, setLog] = useState([])
  const inputRef = useRef(null)

  const pushLog = useCallback((text, type = 'info') => {
    setLog((prev) => [...prev.slice(-49), { text, type, ts: Date.now() }])
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === '`' || e.key === '~' || e.code === 'Backquote') {
        e.preventDefault()
        setConsoleOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (consoleOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [consoleOpen])

  function handleSubmit(e) {
    e.preventDefault()
    const cmd = inputValue.trim()
    if (!cmd) return
    setInputValue('')

    if (!cheatsEnabled) {
      if (cmd === SECRET) {
        setCheatsEnabled(true)
        pushLog('> sv.cheats true', 'cmd')
        pushLog('Читы активированы. Админ-панель открыта.', 'success')
      } else {
        pushLog(`> ${cmd}`, 'cmd')
        pushLog('Неизвестная команда. Доступ запрещён.', 'error')
      }
      return
    }

    pushLog(`> ${cmd}`, 'cmd')

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
      pushLog(`Шишки: ${formatNumber(state.shishki)} | Деньги: ${formatNumber(state.money)} | Знания: ${formatNumber(state.knowledge)} | Осколки: ${formatNumber(state.prestigeShards)}`, 'info')
      return
    }

    const giveMatch = cmd.match(/^give\s+(shishki|money|knowledge|shards)\s+([0-9eE+.]+)$/i)
    if (giveMatch) {
      const key = giveMatch[1].toLowerCase() === 'shards' ? 'prestigeShards' : giveMatch[1].toLowerCase()
      const amount = Number(giveMatch[2])
      if (!Number.isFinite(amount) || amount <= 0) { pushLog('Невалидное число.', 'error'); return }
      _devGiveResource(key, amount)
      pushLog(`+${formatNumber(amount)} к ${key}`, 'success')
      return
    }

    const setMatch = cmd.match(/^set\s+(shishki|money|knowledge|shards)\s+([0-9eE+.]+)$/i)
    if (setMatch) {
      const key = setMatch[1].toLowerCase() === 'shards' ? 'prestigeShards' : setMatch[1].toLowerCase()
      const amount = Number(setMatch[2])
      if (!Number.isFinite(amount) || amount < 0) { pushLog('Невалидное число.', 'error'); return }
      _devSetResource(key, amount)
      pushLog(`${key} = ${formatNumber(amount)}`, 'success')
      return
    }

    pushLog('Неизвестная команда. Введите help.', 'error')
  }

  function giveResource(key, amount) {
    _devGiveResource(key, amount)
    pushLog(`+${formatNumber(amount)} к ${key}`, 'success')
  }

  function setResource(key, value) {
    _devSetResource(key, value)
    pushLog(`${key} = ${formatNumber(value)}`, 'success')
  }

  if (!consoleOpen) return null

  return (
    <div className="dev-console-overlay">
      <div className="dev-console">
        <div className="dev-console__header">
          <span>🖥 Консоль</span>
          <button className="dev-console__close" onClick={() => setConsoleOpen(false)}>✕</button>
        </div>

        <div className="dev-console__log">
          {log.length === 0 && (
            <div className="dev-console__hint">
              {cheatsEnabled
                ? 'Введите help для списка команд'
                : 'Введите секретную команду для активации читов…'}
            </div>
          )}
          {log.map((entry) => (
            <div key={entry.ts + entry.text} className={`dev-console__line dev-console__line--${entry.type}`}>
              {entry.text}
            </div>
          ))}
        </div>

        <form className="dev-console__input-row" onSubmit={handleSubmit}>
          <span className="dev-console__prompt">&gt;</span>
          <input
            ref={inputRef}
            className="dev-console__input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={cheatsEnabled ? 'help / give / set / status' : 'Введите команду…'}
            spellCheck={false}
            autoComplete="off"
          />
        </form>

        {cheatsEnabled && (
          <div className="dev-admin">
            <div className="dev-admin__title">⚡ Админ-панель</div>
            <div className="dev-admin__grid">
              {RESOURCES.map((res) => (
                <div key={res.key} className="dev-admin__card">
                  <div className="dev-admin__card-head">
                    <span>{res.icon}</span>
                    <span className="dev-admin__card-label">{res.label}</span>
                    <span className="dev-admin__card-value">{formatNumber(state[res.key] ?? 0)}</span>
                  </div>
                  <div className="dev-admin__presets">
                    {PRESETS.map((amount) => (
                      <button
                        key={amount}
                        className="dev-admin__btn dev-admin__btn--add"
                        onClick={() => giveResource(res.key, amount)}
                      >
                        +{formatNumber(amount)}
                      </button>
                    ))}
                  </div>
                  <div className="dev-admin__presets">
                    <button className="dev-admin__btn dev-admin__btn--set" onClick={() => setResource(res.key, 0)}>
                      Обнулить
                    </button>
                    <button className="dev-admin__btn dev-admin__btn--set" onClick={() => setResource(res.key, 1e12)}>
                      Max (1T)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
