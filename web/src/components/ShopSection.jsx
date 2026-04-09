export function ShopSection({ kicker, title, description, children, accent = 'fuchsia', columns = 'single' }) {
  const gridClass = columns === 'double' ? 'mt-4 grid gap-4 lg:grid-cols-2' : 'mt-4 grid gap-4'
  const kickerClass = accent === 'cyan' ? 'text-cyan-200/80' : 'text-fuchsia-200/80'

  return (
    <section className="shop-section section-screen glass-panel rounded-[2rem] p-5 shadow-2xl">
      <div className="text-left shop-section__header">
        <div className={`section-kicker text-sm uppercase ${kickerClass}`}>{kicker}</div>
        <h2 className="mt-2 text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-white/60">{description}</p>
      </div>

      <div className={gridClass}>{children}</div>
    </section>
  )
}
