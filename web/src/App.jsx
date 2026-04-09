import { useEffect, useMemo, useRef, useState } from 'react'
import { setupDiscord } from './discord'
import { useGame } from './game/useGame'
import { StatCard } from './components/StatCard'
import { ShopCard } from './components/ShopCard'
import { ShopSection } from './components/ShopSection'
import hero from './assets/hero.png'
import { formatNumber } from './lib/format'
import {
  DEFAULT_THEME_ID,
  THEME_EDITOR_FIELDS,
  THEME_OPTIONS,
  applyThemeOverrides,
  buildDesignVars,
  getThemeById,
  getValueByPath,
  setValueByPath,
} from './ui/designSystem'

const THEME_OVERRIDES_STORAGE_KEY = 'shishka-theme-overrides-v1'
const THEME_PRESET_STORAGE_KEY = 'shishka-theme-custom-presets-v1'
const SECTION_TABS = [
  {
    id: 'clicker',
    icon: '🌰',
    label: 'Кликер',
    kicker: 'Главный экран',
    title: 'Добыча и прогресс',
    description: 'Кликай, держи темп экономики и смотри, какие ветки развития откроются следующими.',
  },
  {
    id: 'subscriptions',
    icon: '🧠',
    label: 'Подписки',
    kicker: 'Магазин',
    title: 'AI-сервисы',
    description: 'Подписки ускоряют добычу денег и знаний. Новые сервисы открываются только после реального прогресса.',
  },
  {
    id: 'upgrades',
    icon: '⚙️',
    label: 'Апгрейды',
    kicker: 'Магазин',
    title: 'Инвестиции и исследования',
    description: 'Улучшения влияют на клик, автоматизацию и позднюю игру. Часть веток открывается по шишкам и знаниям.',
  },
]

function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [user, setUser] = useState(null)
  const [bursts, setBursts] = useState([])
  const [themeId, setThemeId] = useState(() => window.localStorage.getItem('shishka-theme') || DEFAULT_THEME_ID)
  const [themeOverrides, setThemeOverrides] = useState(() => readJsonStorage(THEME_OVERRIDES_STORAGE_KEY, {}))
  const [customPresets, setCustomPresets] = useState(() => readJsonStorage(THEME_PRESET_STORAGE_KEY, []))
  const [presetName, setPresetName] = useState('')
  const [isThemeSectionOpen, setIsThemeSectionOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('clicker')
  const clickerRef = useRef(null)
  const { state, economy, contributions, mineShishki, buySubscription, buyUpgrade, resetGame } = useGame()

  useEffect(() => {
    setupDiscord().then(setUser)
  }, [])

  useEffect(() => {
    if (!bursts.length) return undefined

    const timeout = window.setTimeout(() => {
      setBursts((current) => current.slice(1))
    }, 650)

    return () => window.clearTimeout(timeout)
  }, [bursts])

  useEffect(() => {
    window.localStorage.setItem(THEME_OVERRIDES_STORAGE_KEY, JSON.stringify(themeOverrides))
  }, [themeOverrides])

  useEffect(() => {
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, JSON.stringify(customPresets))
  }, [customPresets])

  const baseTheme = useMemo(() => getThemeById(themeId), [themeId])
  const currentOverride = themeOverrides[themeId] || {}
  const activeTheme = useMemo(() => applyThemeOverrides(baseTheme, currentOverride), [baseTheme, currentOverride])
  const currentSectionMeta = useMemo(
    () => SECTION_TABS.find((tab) => tab.id === activeSection) ?? SECTION_TABS[0],
    [activeSection],
  )

  const dashboardAccent = useMemo(
    () => `AI x${formatNumber(state.aiMultiplier)} · знаний всего: ${formatNumber(state.totalKnowledgeEarned)}`,
    [state.aiMultiplier, state.totalKnowledgeEarned],
  )

  const customPresetOptions = useMemo(
    () => customPresets.filter((preset) => preset.baseThemeId === themeId),
    [customPresets, themeId],
  )

  const nextSubscriptionUnlock = useMemo(
    () => economy.subscriptions.find((item) => item.unlocked === false),
    [economy.subscriptions],
  )

  const nextUpgradeUnlock = useMemo(
    () => economy.upgrades.find((item) => item.unlocked === false),
    [economy.upgrades],
  )

  useEffect(() => {
    if (!isThemeSectionOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsThemeSectionOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isThemeSectionOpen])

  useEffect(() => {
    window.localStorage.setItem('shishka-theme', themeId)

    const root = document.documentElement
    const vars = buildDesignVars(activeTheme)

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    root.setAttribute('data-theme', activeTheme.meta.id)

    return () => {
      Object.keys(vars).forEach((key) => {
        root.style.removeProperty(key)
      })
      root.removeAttribute('data-theme')
    }
  }, [themeId, activeTheme])

  function handleMine(event) {
    if (event.detail === 0) {
      event.preventDefault()
      return
    }

    mineShishki()

    const container = clickerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const relativeX = Number.isFinite(event.clientX) ? event.clientX - rect.left : rect.width / 2
    const relativeY = Number.isFinite(event.clientY) ? event.clientY - rect.top : rect.height / 2

    setBursts((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        x: relativeX,
        y: relativeY,
        value: `+${formatNumber(state.clickPower)}`,
      },
    ])
  }

  function preventMineKeyboardExploit(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
    }
  }

  function updateThemeField(path, rawValue) {
    const value = typeof rawValue === 'string' && /^\d+(\.\d+)?$/.test(rawValue) ? Number(rawValue) : rawValue
    setThemeOverrides((current) => {
      const nextOverride = setValueByPath(current[themeId] || {}, path, value)
      return {
        ...current,
        [themeId]: nextOverride,
      }
    })
  }

  function resetThemeTweaks() {
    setThemeOverrides((current) => {
      const next = { ...current }
      delete next[themeId]
      return next
    })
  }

  function saveCurrentPreset() {
    const normalizedName = presetName.trim()
    if (!normalizedName) return

    const preset = {
      id: `custom-${Date.now()}`,
      name: normalizedName,
      baseThemeId: themeId,
      overrides: currentOverride,
    }

    setCustomPresets((current) => [preset, ...current])
    setPresetName('')
  }

  function applySavedPreset(preset) {
    setThemeId(preset.baseThemeId)
    setThemeOverrides((current) => ({
      ...current,
      [preset.baseThemeId]: preset.overrides || {},
    }))
  }

  function deleteSavedPreset(presetId) {
    setCustomPresets((current) => current.filter((preset) => preset.id !== presetId))
  }

  function renderUnlockCard(title, item, accentClass) {
    if (!item) {
      return (
        <div className="overview-card">
          <div className="overview-card__label">{title}</div>
          <div className="overview-card__value">Все тири уже открыты</div>
          <div className="overview-card__text">Можно спокойно фокусироваться на прокачке уровней.</div>
        </div>
      )
    }

    return (
      <div className="overview-card">
        <div className="overview-card__label">{title}</div>
        <div className={`overview-card__value ${accentClass}`}>{item.title}</div>
        <div className="overview-card__text">{item.unlockText}</div>
        <div className="overview-progress mt-3">
          <div className="overview-progress__row">
            <span>Шишки</span>
            <span>
              {formatNumber(item.unlockProgress.shishki)} / {formatNumber(item.unlockRule.shishki)}
            </span>
          </div>
          <div className="overview-progress__track">
            <div
              className="overview-progress__fill"
              style={{ width: `${Math.min(100, (item.unlockProgress.shishki / Math.max(1, item.unlockRule.shishki)) * 100)}%` }}
            />
          </div>
          <div className="overview-progress__row mt-2">
            <span>Знания</span>
            <span>
              {formatNumber(item.unlockProgress.knowledge)} / {formatNumber(item.unlockRule.knowledge)}
            </span>
          </div>
          <div className="overview-progress__track">
            <div
              className="overview-progress__fill overview-progress__fill--secondary"
              style={{ width: `${Math.min(100, (item.unlockProgress.knowledge / Math.max(1, item.unlockRule.knowledge)) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  function renderClickerScreen() {
    return (
      <section className="section-screen glass-panel relative overflow-hidden rounded-[2rem] p-5 shadow-2xl">
        <div className="section-spotlight absolute inset-0" />
        <div className="section-screen__header relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-kicker text-sm uppercase text-cyan-200/72">{currentSectionMeta.kicker}</div>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">{currentSectionMeta.title}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/62">{currentSectionMeta.description}</p>
          </div>
          <div className="section-chip">{currentSectionMeta.icon} {currentSectionMeta.label}</div>
        </div>

        <div className="section-screen__body relative mt-6 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <div className="clicker-stage">
            <div ref={clickerRef} className="relative">
              <button type="button" className="clicker-button group" onClick={handleMine} onKeyDown={preventMineKeyboardExploit}>
                <div className="clicker-button__halo" />
                <div className="clicker-button__ring clicker-button__ring--outer" />
                <div className="clicker-button__ring clicker-button__ring--inner" />
                <img src={hero} alt="Шишка" className="clicker-hero" />
                <div className="mt-4 text-xl font-bold text-white md:text-2xl">Кликни и добудь вышку</div>
                <div className="mt-2 text-sm text-white/60">За клик: +{formatNumber(state.clickPower)} шишки</div>
              </button>

              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
                {bursts.map((burst) => (
                  <span
                    key={burst.id}
                    className="click-burst"
                    style={{ left: burst.x, top: burst.y }}
                  >
                    {burst.value}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {activeTheme.content.floatingNotes.map((note, index) => (
                <span
                  key={note}
                  className="floating-chip"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card overview-card--accent">
              <div className="overview-card__label">Петля прогресса</div>
              <div className="mt-4 grid gap-3 text-sm text-white/78">
                <div className="info-panel">
                  <b className="text-white">1.</b> Кликаешь и добываешь <b className="text-white">шишки</b>.
                </div>
                <div className="info-panel">
                  <b className="text-white">2.</b> Превращаешь их в <b className="text-white">деньги</b> через экономику и подписки.
                </div>
                <div className="info-panel">
                  <b className="text-white">3.</b> AI генерирует <b className="text-white">знания</b>, которые открывают поздние тиры.
                </div>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-card__label">Общий прогресс</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="metric-pill">Всего шишек: {formatNumber(state.totalShishkiEarned)}</div>
                <div className="metric-pill">Всего денег: {formatNumber(state.totalMoneyEarned)}</div>
                <div className="metric-pill metric-pill--accent">Всего знаний: {formatNumber(state.totalKnowledgeEarned)}</div>
                <div className="metric-pill">Ручных кликов: {formatNumber(state.manualClicks)}</div>
              </div>
            </div>

            <div className="overview-grid overview-grid--split">
              {renderUnlockCard('Следующая подписка', nextSubscriptionUnlock, 'text-fuchsia-100')}
              {renderUnlockCard('Следующий апгрейд', nextUpgradeUnlock, 'text-cyan-100')}
            </div>

            <button type="button" className="danger-button w-full" onClick={resetGame}>
              Сбросить прогресс
            </button>
          </div>
        </div>
      </section>
    )
  }

  function renderShopScreen(type) {
    const isSubscriptions = type === 'subscriptions'
    const items = isSubscriptions ? economy.subscriptions : economy.upgrades

    return (
      <ShopSection
        kicker={currentSectionMeta.kicker}
        title={currentSectionMeta.title}
        description={currentSectionMeta.description}
        accent={isSubscriptions ? 'fuchsia' : 'cyan'}
        columns="double"
      >
        {items.map((item, index) => {
          const balance = state[item.currency]
          return (
            <ShopCard
              key={item.id}
              item={item}
              level={item.level}
              cost={item.cost}
              canBuy={balance >= item.cost}
              onBuy={() => (isSubscriptions ? buySubscription(item.id) : buyUpgrade(item.id))}
              delay={index}
            />
          )
        })}
      </ShopSection>
    )
  }

  return (
    <div className="app-shell min-h-screen text-white" style={buildDesignVars(activeTheme)}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="grid-overlay" />

      <div className="mx-auto flex min-h-screen max-w-[var(--max-width)] flex-col gap-6 px-4 py-6 pb-32 md:px-6 xl:px-8">
        <header className="glass-panel dashboard-header relative overflow-hidden rounded-[2rem] p-5 text-left shadow-2xl">
          <div className="hero-panel__glow" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="hero-kicker text-sm uppercase text-fuchsia-200/80">Шишка кликер</div>
              <h1 className="hero-title mt-2 text-3xl font-black md:text-5xl xl:text-6xl">Шишки онлайн!</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/72 md:text-base">
                Главный экран теперь держит один фокус за раз: снизу переключаешься между кликером, подписками и апгрейдами без визуального шума.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {activeTheme.content.heroTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/65 backdrop-blur"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="dashboard-header__side">
              <div className="glass-panel rounded-3xl px-4 py-4 text-sm text-white/80 shadow-xl">
                {user ? (
                  <>
                    <div className="text-white/50">Игрок Discord</div>
                    <div className="mt-1 text-lg font-semibold">{user.username}</div>
                    <div className="mt-2 text-xs text-white/45">Запущено внутри Discord Activity</div>
                  </>
                ) : (
                  <>
                    <div className="text-white/50">Режим</div>
                    <div className="mt-1 text-lg font-semibold">Локальная сессия</div>
                    <div className="mt-2 text-xs text-white/45">Можно полировать баланс и UI прямо в браузере</div>
                  </>
                )}
              </div>

              <button
                type="button"
                className={`theme-section-toggle ${isThemeSectionOpen ? 'theme-section-toggle--active' : ''}`}
                onClick={() => setIsThemeSectionOpen((current) => !current)}
              >
                <span>🎨 Темы и редактор</span>
                <span className="theme-section-toggle__meta">{isThemeSectionOpen ? 'Закрыть панель' : 'Открыть панель'}</span>
              </button>
            </div>
          </div>
        </header>

        <section className="stats-grid grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="🌰 Шишки / вышки"
            value={state.shishki}
            hint={`+${formatNumber(state.shishkiPerSecond)} / сек`}
            contributions={contributions.shishkiPerSecond}
            delay={0}
          />
          <StatCard
            label="💵 Деньги"
            value={state.money}
            hint={`+${formatNumber(state.moneyPerSecond)} / сек`}
            contributions={contributions.moneyPerSecond}
            delay={1}
          />
          <StatCard
            label="📚 Знания"
            value={state.knowledge}
            hint={`+${formatNumber(state.knowledgePerSecond)} / сек`}
            contributions={contributions.knowledgePerSecond}
            delay={2}
          />
          <StatCard
            label="💪 Сила клика"
            value={state.clickPower}
            hint={`${formatNumber(state.manualClicks)} ручных кликов`}
            contributions={contributions.clickPower}
            delay={3}
          />
          <StatCard
            label="🤖 AI-мощность"
            value={state.aiPower}
            hint={dashboardAccent}
            contributions={contributions.aiPower}
            delay={4}
          />
        </section>

        {activeSection === 'clicker' ? renderClickerScreen() : null}
        {activeSection === 'subscriptions' ? renderShopScreen('subscriptions') : null}
        {activeSection === 'upgrades' ? renderShopScreen('upgrades') : null}

        {isThemeSectionOpen ? (
          <div className="theme-modal" role="dialog" aria-modal="true" aria-label="Темы и редактор">
            <button
              type="button"
              className="theme-modal__backdrop"
              aria-label="Закрыть панель тем"
              onClick={() => setIsThemeSectionOpen(false)}
            />
            <div className="theme-modal__viewport">
              <div className="theme-modal__panel glass-panel overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="theme-modal__topbar">
                  <div>
                    <div className="section-kicker text-xs uppercase text-cyan-200/72">Настройка интерфейса</div>
                    <h2 className="mt-1 text-2xl font-bold text-white">Темы и редактор визуала</h2>
                    <p className="mt-2 max-w-2xl text-sm text-white/58">
                      Отдельная панель поверх игры: меняй тему, сохраняй пресеты и крути токены не теряя основной экран.
                    </p>
                  </div>
                  <div className="theme-modal__actions">
                    <span className="theme-badge">{activeTheme.meta.badge}</span>
                    <button
                      type="button"
                      className="theme-modal__close"
                      onClick={() => setIsThemeSectionOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="theme-modal__body grid gap-6 p-4 md:p-5 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-6">
                    <div className="theme-picker glass-panel rounded-[2rem] px-4 py-4 text-sm text-white/80 shadow-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-white/50">Тема интерфейса</div>
                          <div className="mt-1 text-lg font-semibold">{activeTheme.meta.name}</div>
                          <div className="mt-2 text-xs text-white/55">{activeTheme.meta.tagline}</div>
                        </div>
                        <div className="theme-badge">{activeTheme.meta.badge}</div>
                      </div>

                      <div className="mt-4 grid gap-2">
                        {THEME_OPTIONS.map((themeOption) => {
                          const isActive = themeOption.id === themeId
                          return (
                            <button
                              key={themeOption.id}
                              type="button"
                              className={`theme-option ${isActive ? 'theme-option--active' : ''}`}
                              onClick={() => setThemeId(themeOption.id)}
                            >
                              <span>
                                <span className="block font-semibold text-white">{themeOption.name}</span>
                                <span className="mt-1 block text-xs text-white/55">{themeOption.tagline}</span>
                              </span>
                              <span className="theme-option__badge">{themeOption.badge}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="glass-panel rounded-[2rem] p-4 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="section-kicker text-xs uppercase text-cyan-200/72">Preset manager</div>
                          <h3 className="mt-1 text-xl font-bold text-white">Кастомные пресеты</h3>
                          <p className="mt-2 text-xs text-white/55">
                            Сохраняй удачные вариации поверх базовой темы и переключай их в один клик.
                          </p>
                        </div>
                        <button type="button" className="danger-button" onClick={resetThemeTweaks}>
                          Сбросить твики
                        </button>
                      </div>

                      <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto] xl:items-end">
                        <label className="theme-editor-control">
                          <span className="theme-editor-control__label">Название кастомного пресета</span>
                          <input
                            type="text"
                            value={presetName}
                            onChange={(event) => setPresetName(event.target.value)}
                            placeholder="Например, Squad Night Shift"
                            className="theme-editor-text"
                          />
                        </label>
                        <button type="button" className="shop-card__button" onClick={saveCurrentPreset} disabled={!presetName.trim()}>
                          Сохранить пресет
                        </button>
                      </div>

                      <div className="mt-4 grid gap-2">
                        {customPresetOptions.length ? (
                          customPresetOptions.map((preset) => (
                            <div key={preset.id} className="theme-preset-row">
                              <div>
                                <div className="font-semibold text-white">{preset.name}</div>
                                <div className="mt-1 text-xs text-white/55">База: {getThemeById(preset.baseThemeId).meta.name}</div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button type="button" className="theme-preset-row__button" onClick={() => applySavedPreset(preset)}>
                                  Применить
                                </button>
                                <button type="button" className="theme-preset-row__button theme-preset-row__button--danger" onClick={() => deleteSavedPreset(preset.id)}>
                                  Удалить
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="theme-editor-empty">Для этой базовой темы еще нет сохраненных кастомных пресетов.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-[2rem] p-4 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="section-kicker text-xs uppercase text-cyan-200/72">Theme editor</div>
                        <h3 className="mt-1 text-xl font-bold text-white">Редактор темы</h3>
                        <p className="mt-2 text-xs text-white/55">
                          Меняй токены прямо в UI и смотри, как интерфейс реагирует в реальном времени.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      {THEME_EDITOR_FIELDS.map((group) => (
                        <div key={group.section} className="theme-editor-group">
                          <div className="theme-editor-group__title">{group.section}</div>
                          <div className="mt-3 grid gap-3">
                            {group.fields.map((field) => {
                              const currentValue = getValueByPath(activeTheme, field.key)
                              const inputValue = typeof currentValue === 'number' ? currentValue : String(currentValue || '')
                              return (
                                <label key={field.key} className="theme-editor-control">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="theme-editor-control__label">{field.label}</span>
                                    <span className="theme-editor-control__value">
                                      {field.type === 'range'
                                        ? `${Number(currentValue).toFixed(field.step < 1 ? 2 : 0)}${field.unit || ''}`
                                        : inputValue}
                                    </span>
                                  </div>
                                  {field.type === 'color' ? (
                                    <div className="theme-editor-color-row">
                                      <input
                                        type="color"
                                        value={inputValue}
                                        onChange={(event) => updateThemeField(field.key, event.target.value)}
                                        className="theme-editor-color"
                                      />
                                      <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(event) => updateThemeField(field.key, event.target.value)}
                                        className="theme-editor-text"
                                      />
                                    </div>
                                  ) : (
                                    <input
                                      type="range"
                                      min={field.min}
                                      max={field.max}
                                      step={field.step}
                                      value={Number(currentValue)}
                                      onChange={(event) => updateThemeField(field.key, event.target.value)}
                                      className="theme-editor-range"
                                    />
                                  )}
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <nav className="bottom-nav" aria-label="Разделы игры">
        <div className="bottom-nav__shell glass-panel">
          {SECTION_TABS.map((tab) => {
            const isActive = tab.id === activeSection
            return (
              <button
                key={tab.id}
                type="button"
                className={`bottom-nav__button ${isActive ? 'bottom-nav__button--active' : ''}`}
                onClick={() => setActiveSection(tab.id)}
                aria-pressed={isActive}
              >
                <span className="bottom-nav__icon">{tab.icon}</span>
                <span className="bottom-nav__text">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App
