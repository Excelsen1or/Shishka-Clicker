import { useEffect, useState } from 'react'
import { setupDiscord } from './discord'
import { useGame } from './game/useGame'
import { StatCard } from './components/StatCard'
import { ShopCard } from './components/ShopCard'
import hero from './assets/hero.png'
import { formatNumber } from './lib/format'

function App() {
  const [user, setUser] = useState(null)
  const { state, economy, mineShishki, buySubscription, buyUpgrade, resetGame } = useGame()

  useEffect(() => {
    setupDiscord().then(setUser)
  }, [])

  return (
    <div className="min-h-screen bg-[#120f1a] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-left shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-fuchsia-200/80">Шишка кликер</div>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">Шишки онлайн!</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                Зарабатывай деньги, оплачивай AI-подписки и автоматизируй добычу высшего образования.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {user ? (
                <>
                  <div className="text-white/50">Игрок Discord</div>
                  <div className="mt-1 text-lg font-semibold">{user.username}</div>
                </>
              ) : (
                <>
                  <div className="text-white/50">Режим</div>
                  <div className="mt-1 text-lg font-semibold">Локальная сессия</div>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="🌰 Шишки / вышки" value={state.shishki} hint={`+${formatNumber(state.shishkiPerSecond)} / сек`} />
          <StatCard label="💵 Деньги" value={state.money} hint={`+${formatNumber(state.moneyPerSecond)} / сек`} />
          <StatCard label="💪 Сила клика" value={state.clickPower} hint={`${formatNumber(state.manualClicks)} ручных кликов`} />
          <StatCard label="🤖 AI-мощность" value={state.aiPower} hint={`Знания: ${formatNumber(state.knowledge)}`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 to-cyan-400/10 p-5 shadow-2xl">
            <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:items-center">
              <button
                className="group rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:scale-[1.01] hover:bg-white/10 active:scale-[0.98]"
                onClick={mineShishki}
              >
                <img
                  src={hero}
                  alt="Шишка"
                  className="mx-auto w-full max-w-[280px] drop-shadow-[0_20px_60px_rgba(168,85,247,0.35)] transition group-hover:rotate-3"
                />
                <div className="mt-4 text-xl font-bold">Кликни и добудь вышку</div>
                <div className="mt-1 text-sm text-white/60">За клик: +{formatNumber(state.clickPower)} шишки</div>
              </button>

              <div className="text-left">
                <div className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Экономика</div>
                <h2 className="mt-2 text-2xl font-bold">Цикл прогресса</h2>
                <div className="mt-4 grid gap-3 text-sm text-white/75">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    1. Кликаешь и добываешь <b className="text-white">шишки</b>.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    2. На <b className="text-white">деньги</b> покупаешь AI-подписки.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    3. AI начинает сам фармить образования за тебя.
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
                    Всего шишек: {formatNumber(state.totalShishkiEarned)}
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
                    Всего денег: {formatNumber(state.totalMoneyEarned)}
                  </div>
                </div>
                <button
                  className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                  onClick={resetGame}
                >
                  Сбросить прогресс
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
            <div className="text-left">
              <div className="text-sm uppercase tracking-[0.2em] text-fuchsia-200/80">Подписки</div>
              <h2 className="mt-2 text-2xl font-bold">AI-сервисы</h2>
            </div>

            <div className="mt-4 grid gap-4">
              {economy.subscriptions.map((item) => (
                <ShopCard
                  key={item.id}
                  item={item}
                  level={item.level}
                  cost={item.cost}
                  canBuy={state.money >= item.cost}
                  onBuy={() => buySubscription(item.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
          <div className="text-left">
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Апгрейды</div>
            <h2 className="mt-2 text-2xl font-bold">Инвестиции в прокачку</h2>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {economy.upgrades.map((item) => {
              const balance = item.currency === 'money' ? state.money : state.shishki
              return (
                <ShopCard
                  key={item.id}
                  item={item}
                  level={item.level}
                  cost={item.cost}
                  canBuy={balance >= item.cost}
                  onBuy={() => buyUpgrade(item.id)}
                />
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
