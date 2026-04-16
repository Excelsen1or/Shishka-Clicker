import { useCallback, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useGameStore } from '../../stores/StoresProvider.jsx'
import {
  useSettingsActions,
  useSettingsState,
  useSettingsVisuals,
} from '../../context/SettingsContext'
import {
  buildSaveFileName,
  createSaveBundle,
  normalizeImportedBundle,
} from '../../lib/saveTransfer'
import { APP_VERSION } from '../../config/appMeta'
import { SettingsSaveCard } from './SettingsSaveCard.jsx'
import { SettingsAudio } from './SettingsAudio.jsx'
import { SettingsEffects } from './SettingsEffects.jsx'
import { SettingsAbout } from './SettingsAbout.jsx'
import { SettingsDiscordCard } from './SettingsDiscordCard.jsx'

export const SettingsScreen = observer(function SettingsScreen() {
  const { resetGame, exportGameSave, importGameSave } = useGameStore()
  const { settings, exportSettings } = useSettingsState()
  const { setVolume, toggle, resetSettings, importSettings } =
    useSettingsActions()
  const { visualEffectCaps } = useSettingsVisuals()
  const importInputRef = useRef(null)
  const exportTextRef = useRef(null)
  const [transferStatus, setTransferStatus] = useState(null)
  const [exportedSaveText, setExportedSaveText] = useState('')

  const effectSettings = useMemo(
    () => ({
      visualEffectsDensity: settings.visualEffectsDensity,
      showAmbientEffects: settings.showAmbientEffects,
      showNoiseOverlay: settings.showNoiseOverlay,
      showRevealAnimations: settings.showRevealAnimations,
      showClickAnimations: settings.showClickAnimations,
      showParticles: settings.showParticles,
      showFloatingNumbers: settings.showFloatingNumbers,
      showConeSprites: settings.showConeSprites,
      showShockwaves: settings.showShockwaves,
      showAchievementToasts: settings.showAchievementToasts,
    }),
    [
      settings.showAchievementToasts,
      settings.showAmbientEffects,
      settings.showClickAnimations,
      settings.showConeSprites,
      settings.showFloatingNumbers,
      settings.showNoiseOverlay,
      settings.showParticles,
      settings.showRevealAnimations,
      settings.showShockwaves,
      settings.visualEffectsDensity,
    ],
  )

  const buildCurrentSaveText = useCallback(() => {
    const bundle = createSaveBundle({
      gameState: exportGameSave(),
      settings: exportSettings(),
      appVersion: APP_VERSION,
    })

    return JSON.stringify(bundle, null, 2)
  }, [exportGameSave, exportSettings])

  const revealSaveText = useCallback((text) => {
    setExportedSaveText(text)
    window.setTimeout(() => {
      exportTextRef.current?.focus()
      exportTextRef.current?.select()
    }, 0)
  }, [])
  const handleExportSave = useCallback(() => {
    try {
      const text = buildCurrentSaveText()
      const blob = new Blob([text], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = buildSaveFileName()
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      revealSaveText(text)
      setTransferStatus({
        type: 'success',
        text: 'Сохранение экспортировано в JSON-файл. Ниже также показан его текст, чтобы можно было вручную скопировать его даже внутри Discord.',
      })
    } catch (error) {
      console.error(error)
      setTransferStatus({
        type: 'error',
        text: 'Не удалось экспортировать сохранение.',
      })
    }
  }, [buildCurrentSaveText, revealSaveText])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleRevealSaveText = useCallback(() => {
    try {
      revealSaveText(buildCurrentSaveText())
      setTransferStatus({
        type: 'success',
        text: 'Текст текущего сейва подготовлен ниже. Его можно полностью скопировать вручную.',
      })
    } catch (error) {
      console.error(error)
      setTransferStatus({
        type: 'error',
        text: 'Не удалось подготовить текст сейва.',
      })
    }
  }, [buildCurrentSaveText, revealSaveText])

  const handleCopySaveText = useCallback(async () => {
    try {
      const textToCopy = exportedSaveText || buildCurrentSaveText()
      await navigator.clipboard.writeText(textToCopy)
      revealSaveText(textToCopy)
      setTransferStatus({
        type: 'success',
        text: 'Текст сейва скопирован в буфер обмена.',
      })
    } catch (error) {
      console.error(error)
      revealSaveText(exportedSaveText || buildCurrentSaveText())
      setTransferStatus({
        type: 'error',
        text: 'Не удалось автоматически скопировать текст. Ниже он уже открыт — можно выделить и скопировать вручную.',
      })
    }
  }, [buildCurrentSaveText, exportedSaveText, revealSaveText])

  const handleImportSave = useCallback(
    async (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      try {
        const rawText = await file.text()
        const imported = normalizeImportedBundle(JSON.parse(rawText))
        importGameSave(imported.game)
        if (imported.settings) {
          importSettings(imported.settings)
        }

        setTransferStatus({
          type: 'success',
          text: imported.isLegacy
            ? 'Старое сохранение импортировано. Игровой прогресс восстановлен.'
            : 'Сохранение импортировано. Восстановлены игровой прогресс и локальные настройки.',
        })
      } catch (error) {
        console.error(error)
        setTransferStatus({
          type: 'error',
          text:
            error instanceof Error
              ? error.message
              : 'Не удалось импортировать сохранение.',
        })
      } finally {
        event.target.value = ''
      }
    },
    [importGameSave, importSettings],
  )

  return (
    <section className="screen settings-screen">
      <div className="screen__header">
        <span className="screen__kicker">Настройки</span>
        <h2 className="screen__title">
          Звук, эффекты и информация о приложении
        </h2>
      </div>

      <div className="settings-layout">
        <div className="settings-layout__main">
          <SettingsAudio
            soundEnabled={settings.soundEnabled}
            masterVolume={settings.masterVolume}
            effectsVolume={settings.effectsVolume}
            toggle={toggle}
            setVolume={setVolume}
            resetSettings={resetSettings}
          />

          <SettingsEffects
            settings={effectSettings}
            setVolume={setVolume}
            visualEffectCaps={visualEffectCaps}
            toggle={toggle}
          />

          <SettingsSaveCard
            handleExportSave={handleExportSave}
            handleImportSave={handleImportSave}
            handleImportClick={handleImportClick}
            handleRevealSaveText={handleRevealSaveText}
            handleCopySaveText={handleCopySaveText}
            importInputRef={importInputRef}
            transferStatus={transferStatus}
            exportedSaveText={exportedSaveText}
            exportTextRef={exportTextRef}
          />

          <SettingsDiscordCard />
        </div>

        <SettingsAbout resetGame={resetGame} />
      </div>
    </section>
  )
})
