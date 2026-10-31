import LiveContainer from '../LiveContainer'

// Webflow .section_hero + .hero_secondary, used on About and Contact.
export default function SecondaryHero({ title, children }) {
  return (
    <section className="flex flex-col justify-center text-black max-[991px]:pt-12 max-[767px]:pt-4 max-[479px]:pt-8">
      <LiveContainer innerClassName="py-24 max-[479px]:pt-40">
        <div className="flex flex-col items-center gap-12 text-center">
          <div className="flex max-w-[1120px] flex-col items-center gap-8 pt-8">
            <h1 className="text-[40px] leading-[48px] font-medium text-black">{title}</h1>
            <div className="w-full max-w-[768px] text-base leading-6">{children}</div>
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
