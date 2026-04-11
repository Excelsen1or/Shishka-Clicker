import { useMemo, useRef, useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useSettingsContext } from '../../context/SettingsContext'
import {
  buildSaveFileName,
  createSaveBundle,
  normalizeImportedBundle,
} from '../../lib/saveTransfer'
import {
  APP_VERSION
} from '../../config/appMeta'
import {SettingsSaveCard} from "./SettingsSaveCard.jsx"
import {SettingsAudio} from "./SettingsAudio.jsx"
import {SettingsEffects} from "./SettingsEffects.jsx"
import {SettingsAbout} from "./SettingsAbout.jsx"
import { ConeIcon } from '../ui/ConeIcon'


export function SettingsScreen() {
  const { resetGame, markSilenceLover, exportGameSave, importGameSave } = useGameContext()
  const {
    settings,
    setVolume,
    toggle,
    resetSettings,
    visualEffectCaps,
    exportSettings,
    importSettings,
  } = useSettingsContext()
  const importInputRef = useRef(null)
  const exportTextRef = useRef(null)
  const [transferStatus, setTransferStatus] = useState(null)
  const [exportedSaveText, setExportedSaveText] = useState('')

  const effectSummary = [
    { icon: '✨', label: 'Эмодзи и шишки', value: `до ${visualEffectCaps.particleCap}`, hint: 'частицы на экране' },
    { icon: '🔢', label: 'Числа', value: `до ${visualEffectCaps.burstCap}`, hint: 'всплывающих значений' },
    { icon: <ConeIcon />, label: 'Спрайты', value: `до ${visualEffectCaps.coneCap}`, hint: 'дополнительных шишек' },
    { icon: '📦', label: 'Бюджет', value: visualEffectCaps.totalHint, hint: 'общий лимит эффектов' },
  ]

  const aboutSummary = [
    { icon: '🧩', label: 'Версия', value: APP_VERSION, hint: 'текущая сборка' },
    { icon: '🧑‍💻', label: 'Репозиторий', value: 'GitHub', hint: 'ссылка в блоке ниже' },
  ]

  const currentSaveText = useMemo(() => {
    const bundle = createSaveBundle({
      gameState: exportGameSave(),
      settings: exportSettings(),
      appVersion: APP_VERSION,
    })

    return JSON.stringify(bundle, null, 2)
  }, [exportGameSave, exportSettings])

  const handleMusicToggle = () => {
    if (settings.musicEnabled) markSilenceLover()
    toggle('musicEnabled')
  }

  const handleMusicVolume = (value) => {
    if (value <= 5) markSilenceLover()
    setVolume('musicVolume', value)
  }

  const revealSaveText = (text) => {
    setExportedSaveText(text)
    window.setTimeout(() => {
      exportTextRef.current?.focus()
      exportTextRef.current?.select()
    }, 0)
  }

  const handleExportSave = () => {
    try {
      const text = currentSaveText
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
      setTransferStatus({ type: 'success', text: 'Сохранение экспортировано в JSON-файл. Ниже также показан его текст, чтобы можно было вручную скопировать его даже внутри Discord.' })
    } catch (error) {
      console.error(error)
      setTransferStatus({ type: 'error', text: 'Не удалось экспортировать сохранение.' })
    }
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleRevealSaveText = () => {
    try {
      revealSaveText(currentSaveText)
      setTransferStatus({ type: 'success', text: 'Текст текущего сейва подготовлен ниже. Его можно полностью скопировать вручную.' })
    } catch (error) {
      console.error(error)
      setTransferStatus({ type: 'error', text: 'Не удалось подготовить текст сейва.' })
    }
  }

  const handleCopySaveText = async () => {
    try {
      const textToCopy = exportedSaveText || currentSaveText
      await navigator.clipboard.writeText(textToCopy)
      revealSaveText(textToCopy)
      setTransferStatus({ type: 'success', text: 'Текст сейва скопирован в буфер обмена.' })
    } catch (error) {
      console.error(error)
      revealSaveText(exportedSaveText || currentSaveText)
      setTransferStatus({ type: 'error', text: 'Не удалось автоматически скопировать текст. Ниже он уже открыт — можно выделить и скопировать вручную.' })
    }
  }

  const handleImportSave = async (event) => {
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
        text: error instanceof Error ? error.message : 'Не удалось импортировать сохранение.',
      })
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="screen settings-screen">
      <div className="screen__header">
        <span className="screen__kicker">Настройки</span>
        <h2 className="screen__title">Звук, эффекты и информация о приложении</h2>
        <p className="screen__desc">
          Раздел собран как аккуратный центр управления: частые действия слева, служебная информация и опасные действия справа.
        </p>
      </div>

      <div className="settings-layout">
        <div className="settings-layout__main">
          <SettingsAudio
            handleMusicVolume={handleMusicVolume}
            handleMusicToggle={handleMusicToggle}
            toggle={toggle}
            setVolume={setVolume}
            settings={settings}
            resetSettings={resetSettings}
          />

          <SettingsEffects
            settings={settings}
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
        </div>

        <SettingsAbout
          resetGame={resetGame}
        />
      </div>
    </section>
  )
}
