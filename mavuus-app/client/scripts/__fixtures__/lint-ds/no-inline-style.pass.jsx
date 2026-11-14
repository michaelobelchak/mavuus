export function Hero({ image, width }) {
  return (
    <section style={{ backgroundImage: `url("${image}")` }}>
      <div style={{ '--hero-width': `${width}px`, color: 'var(--text-primary)' }} />
    </section>
  )
}
