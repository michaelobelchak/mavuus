import LiveButton from './LiveButton'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import { H_SECTION, LEAD } from './ui/Typography'

const CTA_BG = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d/6699cbb6206dc486ff34f56f_bg.svg'

/**
 * The closing call to action on every public page. `wide` is the larger services version.
 */
export default function CTABand({
  title = 'Ready to experience the real power of your Marketing Network?',
  text = 'Connect with like-minded marketers across North America and learn about the solutions they use and the vendors who help them solve marketing projects.',
  buttonLabel = 'Get Started',
  buttonTo = '/register',
  wide = false,
}) {
  return (
    <Section>
      <Reveal
        className="flex flex-col items-center rounded-3xl bg-live-blue-light bg-cover bg-left-top px-16 py-[72px] text-center max-[767px]:px-6 max-[767px]:py-12"
        style={{ backgroundImage: `url("${CTA_BG}")` }}
      >
        <div className={`flex w-full flex-col items-center gap-4 ${wide ? 'max-w-[880px]' : 'max-w-[600px]'}`}>
          <h2 className={H_SECTION}>{title}</h2>
          <p className={`${LEAD} m-0`}>{text}</p>
          <LiveButton to={buttonTo} className="mt-4">{buttonLabel}</LiveButton>
        </div>
      </Reveal>
    </Section>
  )
}
