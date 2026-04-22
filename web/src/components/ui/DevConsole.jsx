import { useCallback, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Gem, Lightning, PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format'
import wrongImg from '../../assets/wrong.png'
import { useSound } from '../../hooks/useSound.js'
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'
import { ConeIcon } from './ConeIcon.jsx'
import {
  DEV_CONSOLE_COMMANDS_DESC,
  DEV_CONSOLE_EMPTY_LOG_HINT,
  DEV_CONSOLE_RESOURCES,
  buildDevConsoleStatusLine,
  getDevConsoleCheatsHelpLines,
  parseDevCommand,
} from './devConsoleCommands.js'

const PRESETS = [1e3, 1e4, 100e3, 1e6, 1e9]

const RESOURCE_ICONS = {
  shishki: <ConeIcon />,
  heavenly: (
    <PxlKitIcon icon={Gem} size={16} colorful className="pixel-inline-icon" />
  ),
  lumps: (
    <PxlKitIcon
      icon={Scroll}
      size={16}
      colorful
      className="pixel-inline-icon"
    />
  ),
}

function getResourceAlias(storeKey) {
  return (
    DEV_CONSOLE_RESOURCES.find((resource) => resource.storeKey === storeKey)
      ?.id ?? storeKey
  )
}

const DevConsolePanel = observer(function DevConsolePanel() {
  const { devConsoleResources, _devGiveResource, _devSetResource } =
    useGameStore()
  const [cheatsEnabled, setCheatsEnabled] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [log, setLog] = useState([])
  const footerRef = useRef(null)
  const inputRef = useRef(null)
  const overlayTimerRef = useRef(null)
  const [showWrongOverlay, setShowWrongOverlay] = useState(false)
  const { play } = useSound(denySound, { volume: 0.1 })

  const pushLog = useCallback((text, type = 'info') => {
    setLog((prev) => [
      ...prev.slice(-63),
      { text, type, ts: Date.now() + Math.random() },
    ])
  }, [])

  const commands = {
    date: () => pushLog(new Date().toLocaleString(), 'info'),
    clear: () => setLog([]),
    help: () => {
      pushLog('AVAILABLE COMMANDS', 'meta')
      Object.entries(DEV_CONSOLE_COMMANDS_DESC).forEach(
        ([command, description]) => {
          pushLog(`${command} :: ${description}`, 'info')
        },
      )
    },
    'sv.www true': () => {
      setCheatsEnabled(true)
      pushLog('success')
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
    overlayTimerRef.current = window.setTimeout(
      () => setShowWrongOverlay(false),
      1600,
    )
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

      pushLog('error')
      await flashWrongOverlay()
      return
    }

    if (cmd === 'sv.cheats false') {
      setCheatsEnabled(false)
      pushLog('Читы деактивированы.', 'warn')
      return
    }

    if (cmd === 'help') {
      getDevConsoleCheatsHelpLines().forEach((line) => pushLog(line, 'info'))
      return
    }

    const parsed = parseDevCommand(cmd)
    if (parsed.type === 'status') {
      pushLog(buildDevConsoleStatusLine(devConsoleResources), 'info')
      return
    }

    if (parsed.type === 'give') {
      _devGiveResource(parsed.key, parsed.value)
      pushLog(
        `+${formatNumber(parsed.value)} к ${getResourceAlias(parsed.key)}`,
        'success',
      )
      return
    }

    if (parsed.type === 'set') {
      _devSetResource(parsed.key, parsed.value)
      pushLog(
        `${getResourceAlias(parsed.key)} = ${formatNumber(parsed.value)}`,
        'success',
      )
      return
    }

    pushLog('error')
    await flashWrongOverlay()
  }

  function giveResource(key, amount) {
    _devGiveResource(key, amount)
    pushLog(`+${formatNumber(amount)} к ${getResourceAlias(key)}`, 'success')
  }

  function setResource(key, value) {
    _devSetResource(key, value)
    pushLog(`${getResourceAlias(key)} = ${formatNumber(value)}`, 'success')
  }

  const hints = cheatsEnabled
    ? DEV_CONSOLE_EMPTY_LOG_HINT.enabled
    : DEV_CONSOLE_EMPTY_LOG_HINT.disabled

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
        </div>
        <div className="dev-console__meta">
          <span>LINES {log.length}</span>
          <span>MODE {cheatsEnabled ? 'ROOT' : 'USER'}</span>
        </div>
      </div>

      <div className="dev-console__subheader">
        <span>{cheatsEnabled ? 'Developer console' : 'APPYДОР'}</span>
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
        <span className="dev-console__prompt">root@pixel:</span>
        <input
          ref={inputRef}
          className="dev-console__input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={
            cheatsEnabled ? 'help / give / set / status' : 'Введите команду...'
          }
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      {cheatsEnabled ? (
        <div className="dev-admin">
          <div className="dev-admin__title">Resource Patches</div>
          <div className="dev-admin__grid">
            {DEV_CONSOLE_RESOURCES.map((resource) => (
              <div key={resource.id} className="dev-admin__card">
                <div className="dev-admin__card-head">
                  <span>{RESOURCE_ICONS[resource.id]}</span>
                  <span className="dev-admin__card-label">
                    {resource.label}
                  </span>
                  <span className="dev-admin__card-value">
                    {devConsoleResources[resource.textKey]}
                  </span>
                </div>
                <div className="dev-admin__presets">
                  {PRESETS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="dev-admin__btn dev-admin__btn--add"
                      onClick={() => giveResource(resource.storeKey, amount)}
                    >
                      +{formatNumber(amount)}
                    </button>
                  ))}
                </div>
                <div className="dev-admin__presets">
                  <button
                    type="button"
                    className="dev-admin__btn dev-admin__btn--set"
                    onClick={() => setResource(resource.storeKey, 0)}
                  >
                    Обнулить
                  </button>
                  <button
                    type="button"
                    className="dev-admin__btn dev-admin__btn--set"
                    onClick={() => setResource(resource.storeKey, 1e12)}
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
      if (
        event.key === '`' ||
        event.key === '~' ||
        event.code === 'Backquote'
      ) {
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
