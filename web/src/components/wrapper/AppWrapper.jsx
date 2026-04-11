import {BottomNav} from "../bottom/BottomNav.jsx"
import {AchievementToast} from "../ui/AchievementToast.jsx"
import {DevConsole} from "../ui/DevConsole.jsx"
import {TooltipManager} from "../ui/TooltipManager.jsx"
import {StatsBar} from "../stats/StatsBar.jsx"
import {lazy, memo, Suspense, useEffect} from "react"
import {Header} from "../header/Header.jsx"
import {setupDiscord} from "../../discord.js"
import {useBackgroundMusic} from "../../hooks/useBackgroundMusic.js"
import {useNav} from "../../context/NavContext.jsx"
import {useSettingsContext} from "../../context/SettingsContext.jsx"
import backgroundMusic from '../../assets/audio/music/background.mp3'
import {ScreenFallback} from "./ScreenFallback.jsx"


const ClickerScreen = lazy(() => import('../clicker/ClickerScreen').then((module) => ({ default: module.ClickerScreen })))
const ShopScreen = lazy(() => import('../shop/ShopScreen').then((module) => ({ default: module.ShopScreen })))
const SettingsScreen = lazy(() => import('../settings/SettingsScreen').then((module) => ({ default: module.SettingsScreen })))
const MetaScreen = lazy(() => import('../meta/MetaScreen').then((module) => ({ default: module.MetaScreen })))

const AppBackground = memo(function AppBackground({ visualEffectToggles }) {
	const showAmbientOrbs = visualEffectToggles.ambientEffects
	const showNoiseOverlay = visualEffectToggles.noiseOverlay

	return (
		<>
			{showAmbientOrbs && <div className="ambient ambient--a" />}
			{showAmbientOrbs && <div className="ambient ambient--b" />}
			{showAmbientOrbs && <div className="ambient ambient--c" />}
			{showNoiseOverlay && <div className="noise-overlay" />}
		</>
	)
})

export const AppWrapper = memo(function AppWrapper() {
	const { activeTab } = useNav()
	const { visualEffectToggles } = useSettingsContext()

	const statsBarClassName = activeTab === 'subscriptions' || activeTab === 'upgrades' || activeTab === 'meta' || activeTab === 'settings'
		? 'stats-bar--shop'
		: ''

	useBackgroundMusic(backgroundMusic)

	useEffect(() => {
		void setupDiscord()
	}, [])

	return (
		<div className="app-shell">
			<AppBackground visualEffectToggles={visualEffectToggles} />

			<div className="app-content">
				<Header />
				<main className="app-main">
					{activeTab !== 'clicker' && <StatsBar className={statsBarClassName} />}
					<div className="screen-bg">
						<div className="screen__glow" />
						<Suspense fallback={<ScreenFallback />}>
							{activeTab === 'clicker' && <ClickerScreen />}
							{activeTab === 'subscriptions' && <ShopScreen type="subscriptions" />}
							{activeTab === 'upgrades' && <ShopScreen type="upgrades" />}
							{activeTab === 'meta' && <MetaScreen />}
							{activeTab === 'settings' && <SettingsScreen />}
						</Suspense>
					</div>
				</main>
			</div>

			<AchievementToast />
			<DevConsole />
			<TooltipManager />
			<BottomNav />
		</div>
	)
})
