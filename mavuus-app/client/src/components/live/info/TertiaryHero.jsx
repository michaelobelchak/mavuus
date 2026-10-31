import LiveContainer from '../LiveContainer'

// Webflow .section_hero.is-tertiary, used on FAQ and the legal pages.
export default function TertiaryHero({ title, subtitle }) {
  return (
    <section className="bg-[#fafbfc] py-12 text-black">
      <LiveContainer innerClassName="py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-[40px] leading-[48px] font-medium text-black">{title}</h1>
          <div className="text-2xl leading-9">{subtitle}</div>
        </div>
      </LiveContainer>
    </section>
  )
}
