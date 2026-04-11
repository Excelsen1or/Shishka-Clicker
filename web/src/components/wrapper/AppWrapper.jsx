import {BottomNav} from "../bottom/BottomNav.jsx"
import {AchievementToast} from "../ui/AchievementToast.jsx"
import {DevConsole} from "../ui/DevConsole.jsx"
import {TooltipManager} from "../ui/TooltipManager.jsx"
import {StatsBar} from "../stats/StatsBar.jsx"
import {lazy, memo, Suspense, useEffect, useRef} from "react"
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

const AppBackground = memo(function AppBackground({ performanceProfile }) {
	const showAmbientOrbs = !performanceProfile.prefersReducedMotion
	const showNoiseOverlay = !performanceProfile.isLowPerformanceDevice

	return (
		<>
			{showAmbientOrbs && <div className="ambient ambient--a" />}
			{showAmbientOrbs && !performanceProfile.isLowPerformanceDevice && <div className="ambient ambient--b" />}
			{showAmbientOrbs && !performanceProfile.isMobileDevice && <div className="ambient ambient--c" />}
			{showNoiseOverlay && <div className="noise-overlay" />}
		</>
	)
})

export const AppWrapper = memo(function AppWrapper() {
	const { activeTab } = useNav()
	const { performanceProfile } = useSettingsContext()
	const visitedRef = useRef(new Set(['clicker']))

	// Track visited tabs so we keep them mounted after first visit
	if (performanceProfile.keepInactiveScreensMounted && !visitedRef.current.has(activeTab)) {
		visitedRef.current.add(activeTab)
	}
	const visited = performanceProfile.keepInactiveScreensMounted
		? visitedRef.current
		: new Set([activeTab])

	const statsBarClassName = activeTab === 'subscriptions' || activeTab === 'upgrades' || activeTab === 'meta' || activeTab === 'settings'
		? 'stats-bar--shop'
		: ''

	useBackgroundMusic(backgroundMusic)

	useEffect(() => {
		void setupDiscord()
	}, [])

	return (
		<div className="app-shell">
			<AppBackground performanceProfile={performanceProfile} />

			<div className="app-content">
				<Header />
				<main className="app-main">
					{activeTab !== 'clicker' && <StatsBar className={statsBarClassName} />}
					<div className="screen-bg">
						<div className="screen__glow" />
						<Suspense fallback={<ScreenFallback />}>
							{visited.has('clicker') && <div className={activeTab === 'clicker' ? undefined : 'screen-bg__hidden'}><ClickerScreen /></div>}
						{visited.has('subscriptions') && <div className={activeTab === 'subscriptions' ? undefined : 'screen-bg__hidden'}><ShopScreen type="subscriptions" /></div>}
						{visited.has('upgrades') && <div className={activeTab === 'upgrades' ? undefined : 'screen-bg__hidden'}><ShopScreen type="upgrades" /></div>}
						{visited.has('meta') && <div className={activeTab === 'meta' ? undefined : 'screen-bg__hidden'}><MetaScreen /></div>}
						{visited.has('settings') && <div className={activeTab === 'settings' ? undefined : 'screen-bg__hidden'}><SettingsScreen /></div>}
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
