import { useCallback, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Coin, Gem, Lightning, PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format'
import wrongImg from '../../assets/wrong.png'
import { useSound } from '../../hooks/useSound.js'
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'
import { ConeIcon } from './ConeIcon.jsx'

const RESOURCES = [
  { key: 'shishki', label: 'Шишки', icon: <ConeIcon /> },
  {
    key: 'money',
    label: 'Деньги',
    icon: (
      <PxlKitIcon
        icon={Coin}
        size={16}
        colorful
        className="pixel-inline-icon"
      />
    ),
  },
  {
    key: 'knowledge',
    label: 'Знания',
    icon: (
      <PxlKitIcon
        icon={Scroll}
        size={16}
        colorful
        className="pixel-inline-icon"
      />
    ),
  },
  {
    key: 'prestigeShards',
    label: 'Осколки',
    icon: (
      <PxlKitIcon icon={Gem} size={16} colorful className="pixel-inline-icon" />
    ),
  },
]

const PRESETS = [1e3, 1e4, 100e3, 1e6, 1e9]

const COMMANDS_DESC = {
  date: 'показывает текущую дату',
  clear: 'очищает консоль',
  help: 'выводит список команд',
  'sv.cheats true': 'включает dev-панель',
}

const EMPTY_LOG_HINT = {
  disabled: ['Введите секретную команду для активации читов.', 'Или help для списка базовых команд.'],
  enabled: ['Введите help для списка команд.', 'Доступны give, set, status и sv.cheats false.'],
}

const DevConsolePanel = observer(function DevConsolePanel() {
  const { devConsoleResources, _devGiveResource, _devSetResource } = useGameStore()
  const [cheatsEnabled, setCheatsEnabled] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [log, setLog] = useState([])
  const footerRef = useRef(null)
  const inputRef = useRef(null)
  const overlayTimerRef = useRef(null)
  const [showWrongOverlay, setShowWrongOverlay] = useState(false)
  const { play } = useSound(denySound, { volume: 0.1 })

  const pushLog = useCallback((text, type = 'info') => {
    setLog((prev) => [...prev.slice(-63), { text, type, ts: Date.now() + Math.random() }])
  }, [])

  const commands = {
    date: () => pushLog(new Date().toLocaleString(), 'info'),
    clear: () => setLog([]),
    help: () => {
      pushLog('AVAILABLE COMMANDS', 'meta')
      Object.entries(COMMANDS_DESC).forEach(([command, description]) => {
        pushLog(`${command} :: ${description}`, 'info')
      })
    },
    'sv.cheats true': () => {
      setCheatsEnabled(true)
      pushLog('Читы активированы. Админ-панель открыта.', 'success')
    },
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => {
      window.clearTimeout(timerId)
      window.clearTimeout(overlayTimerRef.current)
    }
  }, [])

  useEffect(() => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const flashWrongOverlay = useCallback(async () => {
    setShowWrongOverlay(true)
    window.clearTimeout(overlayTimerRef.current)
    overlayTimerRef.current = window.setTimeout(() => setShowWrongOverlay(false), 1600)
    await play()
  }, [play])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const cmd = inputValue.trim()
    if (!cmd) return

    setInputValue('')
    pushLog(`> ${cmd}`, 'cmd')

    if (!cheatsEnabled) {
      if (cmd in commands) {
        commands[cmd]()
        return
      }

      pushLog('Не угадал, такого нет.', 'error')
      await flashWrongOverlay()
      return
    }

    if (cmd === 'sv.cheats false') {
      setCheatsEnabled(false)
      pushLog('Читы деактивированы.', 'warn')
      return
    }

    if (cmd === 'help') {
      pushLog('give <ресурс> <число> | set <ресурс> <число> | status | sv.cheats false', 'info')
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
    await flashWrongOverlay()
  }

  function giveResource(key, amount) {
    _devGiveResource(key, amount)
    pushLog(`+${formatNumber(amount)} к ${key}`, 'success')
  }

  function setResource(key, value) {
    _devSetResource(key, value)
    pushLog(`${key} = ${formatNumber(value)}`, 'success')
  }

  const hints = cheatsEnabled ? EMPTY_LOG_HINT.enabled : EMPTY_LOG_HINT.disabled

  return (
    <div className="dev-console">
      <div className="dev-console__header">
        <div className="dev-console__title">
          <span className="pixel-badge">
            <PxlKitIcon
              icon={Lightning}
              size={12}
              colorful
              className="pixel-inline-icon"
            />
            <span>PXL.CONSOLE</span>
          </span>
          <span className={`dev-console__status dev-console__status--${cheatsEnabled ? 'armed' : 'idle'}`}>
            {cheatsEnabled ? 'ARMED' : 'IDLE'}
          </span>
        </div>
        <div className="dev-console__meta">
          <span>LINES {log.length}</span>
          <span>MODE {cheatsEnabled ? 'ROOT' : 'USER'}</span>
        </div>
      </div>

      <div className="dev-console__subheader">
        <span>Backquote toggles terminal</span>
        <span>{cheatsEnabled ? 'Developer controls online' : 'Secret command required'}</span>
      </div>

      <div className="dev-console__log">
        {log.length === 0 ? (
          <div className="dev-console__empty">
            {hints.map((hint) => (
              <div key={hint} className="dev-console__hint">
                {hint}
              </div>
            ))}
          </div>
        ) : null}

        {log.map((entry) => (
          <div
            key={entry.ts}
            className={`dev-console__line dev-console__line--${entry.type}`}
          >
            {entry.text}
          </div>
        ))}
        <div ref={footerRef} />
      </div>

      {showWrongOverlay ? (
        <div className="dev-console__wrong-overlay">
          <img src={wrongImg} alt="wrong" />
        </div>
      ) : null}

      <form className="dev-console__input-row" onSubmit={handleSubmit}>
        <span className="dev-console__prompt">root@pixel:~$</span>
        <input
          ref={inputRef}
          className="dev-console__input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={cheatsEnabled ? 'help / give / set / status' : 'Введите команду...'}
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      {cheatsEnabled ? (
        <div className="dev-admin">
          <div className="dev-admin__title">Resource Patches</div>
          <div className="dev-admin__grid">
            {RESOURCES.map((resource) => (
              <div key={resource.key} className="dev-admin__card">
                <div className="dev-admin__card-head">
                  <span>{resource.icon}</span>
                  <span className="dev-admin__card-label">{resource.label}</span>
                  <span className="dev-admin__card-value">
                    {devConsoleResources[`${resource.key}Text`]}
                  </span>
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
                  <button
                    type="button"
                    className="dev-admin__btn dev-admin__btn--set"
                    onClick={() => setResource(resource.key, 0)}
                  >
                    Обнулить
                  </button>
                  <button
                    type="button"
                    className="dev-admin__btn dev-admin__btn--set"
                    onClick={() => setResource(resource.key, 1e12)}
                  >
                    Max (1T)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
        <button
          type="button"
          className="dev-console__close"
          onClick={() => setConsoleOpen(false)}
          aria-label="Закрыть консоль"
        >
          ×
        </button>
        <DevConsolePanel />
      </div>
    </div>
  )
}
