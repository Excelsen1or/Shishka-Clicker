import {BottomNav} from "../bottom/BottomNav.jsx"
import {AchievementToast} from "../ui/AchievementToast.jsx"
import {DevConsole} from "../ui/DevConsole.jsx"
import {StatsBar} from "../stats/StatsBar.jsx"
import {lazy, memo, Suspense, useEffect} from "react"
import {Header} from "../header/Header.jsx"
import {setupDiscord} from "../../discord.js"
import {useBackgroundMusic} from "../../hooks/useBackgroundMusic.js"
import {useNav} from "../../context/NavContext.jsx"
import backgroundMusic from '../../assets/audio/music/background.mp3'
import {ScreenFallback} from "./ScreenFallback.jsx"


const ClickerScreen = lazy(() => import('../clicker/ClickerScreen').then((module) => ({ default: module.ClickerScreen })))
const ShopScreen = lazy(() => import('../shop/ShopScreen').then((module) => ({ default: module.ShopScreen })))
const SettingsScreen = lazy(() => import('../settings/SettingsScreen').then((module) => ({ default: module.SettingsScreen })))
const MetaScreen = lazy(() => import('../meta/MetaScreen').then((module) => ({ default: module.MetaScreen })))

const AppBackground = memo(function AppBackground() {
	return (
		<>
			<div className="ambient ambient--a" />
			<div className="ambient ambient--b" />
			<div className="ambient ambient--c" />
			<div className="noise-overlay" />
		</>
	)
})

export const AppWrapper = () => {
	const { activeTab } = useNav()
	const statsBarClassName = activeTab === 'subscriptions' || activeTab === 'upgrades' || activeTab === 'meta' || activeTab === 'settings'
		? 'stats-bar--shop'
		: ''

	useBackgroundMusic(backgroundMusic)

	useEffect(() => {
		void setupDiscord()
	}, [])

	return (
		<div className="app-shell">
			<AppBackground />

			<div className="app-content">
				<Header />
				<main className="app-main">
					{activeTab !== 'clicker' && <StatsBar className={statsBarClassName} />}
					<div className="screen-bg">
						<div className="screen__glow" />
						<Suspense fallback={<ScreenFallback />}>
							<div className={activeTab === 'clicker' ? undefined : 'screen-bg__hidden'}><ClickerScreen /></div>
							<div className={activeTab === 'subscriptions' ? undefined : 'screen-bg__hidden'}><ShopScreen type="subscriptions" /></div>
							<div className={activeTab === 'upgrades' ? undefined : 'screen-bg__hidden'}><ShopScreen type="upgrades" /></div>
							<div className={activeTab === 'meta' ? undefined : 'screen-bg__hidden'}><MetaScreen /></div>
							<div className={activeTab === 'settings' ? undefined : 'screen-bg__hidden'}><SettingsScreen /></div>
						</Suspense>
					</div>
				</main>
			</div>

			<AchievementToast />
			<DevConsole />
			<BottomNav />
		</div>
	)
}