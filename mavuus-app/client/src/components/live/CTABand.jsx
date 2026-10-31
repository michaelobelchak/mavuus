import LiveContainer from './LiveContainer'
import LiveButton from './LiveButton'

const CTA_BG = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d/6699cbb6206dc486ff34f56f_bg.svg'

// The "Ready to experience..." band repeated at the bottom of most live pages.
export default function CTABand({
  title = 'Ready to experience the real power of your Marketing Network?',
  text = 'Connect with like-minded marketers across North America and learn about the solutions they use and the vendors who help them solve marketing projects.',
  buttonLabel = 'Get Started',
  buttonTo = '/register',
}) {
  return (
    <section>
      <LiveContainer innerClassName="py-24">
        <div className="py-20 max-md:py-12">
          <div
            className="flex flex-col items-center rounded-[30px] bg-cover bg-center p-[60px] text-center shadow-[0_0_25px_-5px_rgba(0,0,0,0.153)] max-md:px-6 max-md:py-12"
            style={{ backgroundImage: `url("${CTA_BG}")` }}
          >
            <div className="max-w-[480px]">
              <h2 className="mb-4 text-[21.6px] leading-[30.24px]">{title}</h2>
              <p className="mb-8">{text}</p>
              <LiveButton to={buttonTo}>{buttonLabel}</LiveButton>
            </div>
          </div>
        </div>
      </LiveContainer>
    </section>
  )
}
