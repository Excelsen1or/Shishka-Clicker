import { useCallback, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Gem, Lightning, PxlKitIcon, Scroll } from '../../lib/pxlkit'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import { formatNumber } from '../../lib/format'
import wrongImg from '../../assets/wrong.png'
import xackerImg from '../../assets/xacker.png'
import { useSound } from '../../hooks/useSound.js'
import denySound from '../../assets/audio/ui/wpn_denyselect.mp3'
import { ConeIcon } from './ConeIcon.jsx'
import {
  DEV_CONSOLE_EMPTY_LOG_HINT,
  DEV_CONSOLE_RESOURCES,
  USER_CONSOLE_COMMANDS_DESC,
  buildDevConsoleStatusLine,
  getDevConsoleCheatsHelpLines,
  parseDevCommand,
} from './devConsoleCommands.js'

const PRESETS = [1e3, 1e4, 100e3, 1e6, 1e9]
const DEV_CONSOLE_STATE_KEY = 'shishka-clicker-dev-console-v1'
const QA_ACTIONS = [
  { id: 'tick60', label: 'Тик +60с', command: 'tick 60' },
  { id: 'market', label: 'Открыть рынок', command: 'market unlock' },
  { id: 'event', label: 'Районный хайп', command: 'event districtHype' },
  { id: 'campaign', label: 'Ледяной флексер', command: 'campaign iceFlexer' },
  { id: 'quota', label: 'Квота готова', command: 'quota ready' },
  { id: 'rebirth', label: 'Ребёрс', command: 'rebirth' },
  { id: 'clear', label: 'Сбросить шум', command: 'event clear' },
]

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

function loadDevConsoleState() {
  if (typeof window === 'undefined') {
    return { consoleOpen: false, cheatsEnabled: false }
  }

  try {
    const raw = window.localStorage.getItem(DEV_CONSOLE_STATE_KEY)
    if (!raw) {
      return { consoleOpen: false, cheatsEnabled: false }
    }

    const parsed = JSON.parse(raw)

    return {
      consoleOpen: parsed?.consoleOpen === true,
      cheatsEnabled: parsed?.cheatsEnabled === true,
    }
  } catch {
    return { consoleOpen: false, cheatsEnabled: false }
  }
}

function saveDevConsoleState(nextState) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(
      DEV_CONSOLE_STATE_KEY,
      JSON.stringify({
        consoleOpen: nextState.consoleOpen === true,
        cheatsEnabled: nextState.cheatsEnabled === true,
      }),
    )
  } catch {
    // ignore dev-console storage failures
  }
}

function getResourceAlias(storeKey) {
  return (
    DEV_CONSOLE_RESOURCES.find((resource) => resource.storeKey === storeKey)
      ?.id ?? storeKey
  )
}

const DevConsolePanel = observer(function DevConsolePanel({
  cheatsEnabled,
  setCheatsEnabled,
}) {
  const {
    devConsoleResources,
    _devGiveResource,
    _devSetResource,
    _devTick,
    _devSetEvent,
    _devSetCampaign,
    _devSetMarketUnlocked,
    _devSetQuotaReady,
    _devDoRebirth,
  } = useGameStore()
  const [inputValue, setInputValue] = useState('')
  const [log, setLog] = useState([])
  const footerRef = useRef(null)
  const inputRef = useRef(null)
  const overlayTimerRef = useRef(null)
  const [overlayState, setOverlayState] = useState(null)
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
      Object.entries(USER_CONSOLE_COMMANDS_DESC).forEach(
        ([command, description]) => {
          pushLog(`${command} :: ${description}`, 'help')
        },
      )
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

  const flashOverlay = useCallback(
    async (image, alt) => {
      setOverlayState({ image, alt })
      window.clearTimeout(overlayTimerRef.current)
      overlayTimerRef.current = window.setTimeout(
        () => setOverlayState(null),
        1600,
      )
      await play()
    },
    [play],
  )

  const flashWrongOverlay = useCallback(async () => {
    await flashOverlay(wrongImg, 'wrong')
  }, [flashOverlay])

  const flashXackerOverlay = useCallback(async () => {
    await flashOverlay(xackerImg, 'xacker')
  }, [flashOverlay])

  const setCheatsMode = useCallback(
    (enabled) => {
      setCheatsEnabled(enabled)
      pushLog(
        enabled
          ? 'Режим разработчика активирован.'
          : 'Режим разработчика выключен.',
        enabled ? 'success' : 'warn',
      )
    },
    [pushLog, setCheatsEnabled],
  )

  const handleBaseCommand = useCallback(
    async (cmd) => {
      if (cmd === 'help' && cheatsEnabled) {
        return false
      }

      if (cmd in commands) {
        commands[cmd]()
        return true
      }

      const parsed = parseDevCommand(cmd)

      if (parsed.type === 'toggleCheats') {
        setCheatsMode(parsed.enabled)
        return true
      }

      if (parsed.type === 'troll') {
        pushLog('ди нафик дебил', 'error')
        await flashXackerOverlay()
        return true
      }

      return false
    },
    [cheatsEnabled, commands, flashXackerOverlay, pushLog, setCheatsMode],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    const cmd = inputValue.trim()
    if (!cmd) return
    setInputValue('')
    await runCommand(cmd)
  }

  const runCommand = useCallback(
    async (cmd) => {
      pushLog(`> ${cmd}`, 'cmd')

      if (await handleBaseCommand(cmd)) {
        return
      }

      if (!cheatsEnabled) {
        pushLog('error')
        await flashWrongOverlay()
        return
      }

      if (cmd === 'help') {
        getDevConsoleCheatsHelpLines().forEach((line) => pushLog(line, 'help'))
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

      if (parsed.type === 'tick') {
        _devTick(parsed.seconds)
        pushLog(`Промотано ${formatNumber(parsed.seconds)} сек.`, 'success')
        return
      }

      if (parsed.type === 'event') {
        _devSetEvent(parsed.eventId)
        pushLog(
          parsed.eventId
            ? `Ивент запущен: ${parsed.eventId}`
            : 'Ивент очищен.',
          'success',
        )
        return
      }

      if (parsed.type === 'campaign') {
        _devSetCampaign(parsed.campaignId)
        pushLog(
          parsed.campaignId
            ? `Прогрев запущен: ${parsed.campaignId}`
            : 'Прогрев очищен.',
          'success',
        )
        return
      }

      if (parsed.type === 'marketToggle') {
        _devSetMarketUnlocked(parsed.enabled)
        pushLog(
          parsed.enabled ? 'Рынок принудительно открыт.' : 'Рынок принудительно закрыт.',
          'success',
        )
        return
      }

      if (parsed.type === 'quotaReady') {
        const quotaValue = _devSetQuotaReady()
        pushLog(`Квота доведена до ${formatNumber(quotaValue)}.`, 'success')
        return
      }

      if (parsed.type === 'rebirth') {
        const ok = _devDoRebirth()
        pushLog(ok ? 'Перерождение выполнено.' : 'Квота ещё не готова.', ok ? 'success' : 'warn')
        return
      }

      pushLog('error')
      await flashWrongOverlay()
    },
    [
      _devDoRebirth,
      _devGiveResource,
      _devSetCampaign,
      _devSetEvent,
      _devSetMarketUnlocked,
      _devSetQuotaReady,
      _devSetResource,
      _devTick,
      cheatsEnabled,
      devConsoleResources,
      flashWrongOverlay,
      handleBaseCommand,
      pushLog,
    ],
  )

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

      {overlayState ? (
        <div className="dev-console__wrong-overlay">
          <img src={overlayState.image} alt={overlayState.alt} />
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
            cheatsEnabled
              ? 'help / tick / event / campaign / quota / rebirth'
              : 'Введите команду...'
          }
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      {cheatsEnabled ? (
        <div className="dev-admin">
          <div className="dev-admin__title">QA Shortcuts</div>
          <div className="dev-admin__presets">
            {QA_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="dev-admin__btn"
                onClick={() => void runCommand(action.command)}
              >
                {action.label}
              </button>
            ))}
          </div>

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
  const [consoleState, setConsoleState] = useState(() => loadDevConsoleState())
  const { consoleOpen, cheatsEnabled } = consoleState

  const setConsoleOpen = useCallback((nextValue) => {
    setConsoleState((current) => ({
      ...current,
      consoleOpen:
        typeof nextValue === 'function'
          ? nextValue(current.consoleOpen)
          : nextValue,
    }))
  }, [])

  const setCheatsEnabled = useCallback((nextValue) => {
    setConsoleState((current) => ({
      ...current,
      cheatsEnabled:
        typeof nextValue === 'function'
          ? nextValue(current.cheatsEnabled)
          : nextValue,
    }))
  }, [])

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
  }, [setConsoleOpen])

  useEffect(() => {
    saveDevConsoleState(consoleState)
  }, [consoleState])

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
        <DevConsolePanel
          cheatsEnabled={cheatsEnabled}
          setCheatsEnabled={setCheatsEnabled}
        />
      </div>
    </div>
  )
}
