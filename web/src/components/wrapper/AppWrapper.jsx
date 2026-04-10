import {BottomNav} from "../bottom/BottomNav.jsx"
import {AchievementToast} from "../ui/AchievementToast.jsx"
import {StatsBar} from "../stats/StatsBar.jsx"
import {lazy, Suspense, useEffect} from "react"
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

export const AppWrapper = () => {
	const { activeTab } = useNav()
	const statsBarClassName = activeTab === 'subscriptions' || activeTab === 'upgrades'
		? 'stats-bar--shop'
		: ''

	useBackgroundMusic(backgroundMusic)

	useEffect(() => {
		void setupDiscord()
	}, [])

	return (
		<div className="app-shell">
			<div className="ambient ambient--a" />
			<div className="ambient ambient--b" />
			<div className="ambient ambient--c" />
			<div className="noise-overlay" />

			<div className="app-content">
				<Header />
				<main className="app-main">
					{activeTab !== 'clicker' && <StatsBar className={statsBarClassName} />}
					<Suspense fallback={<ScreenFallback />}>
						{activeTab === 'clicker' && <ClickerScreen />}
						{activeTab === 'subscriptions' && <ShopScreen type="subscriptions" />}
						{activeTab === 'upgrades' && <ShopScreen type="upgrades" />}
						{activeTab === 'meta' && <MetaScreen />}
						{activeTab === 'settings' && <SettingsScreen />}
					</Suspense>
				</main>
			</div>

			<AchievementToast />
			<BottomNav />
		</div>
	)
}