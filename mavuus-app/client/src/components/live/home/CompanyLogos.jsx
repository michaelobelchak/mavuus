import Reveal from '../ui/Reveal'
import { Label } from '../ui/Typography'
import { COMPANY_LOGOS } from '../../../data/live/home'

// The source PNGs are exported at 50% alpha. This filter restores full alpha so grey and hover states read true.
function SolidAlphaFilter() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute size-0">
      <filter id="mv-logo-solid" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncA type="linear" slope="2" />
        </feComponentTransfer>
      </filter>
    </svg>
  )
}

export default function CompanyLogos() {
  return (
    <div className="mt-24 flex flex-col items-center gap-10 max-[991px]:mt-[72px] max-[767px]:mt-14 max-[767px]:gap-8">
      <SolidAlphaFilter />
      <Reveal>
        <Label as="h3" className="m-0 block text-center">Our marketers have worked at</Label>
      </Reveal>
      <ul className="m-0 grid w-full list-none grid-cols-6 justify-items-center gap-x-8 gap-y-8 p-0 max-[1199px]:max-w-[640px] max-[1199px]:grid-cols-3 max-[479px]:grid-cols-2 max-[479px]:gap-x-4">
        {COMPANY_LOGOS.map((logo, i) => (
          <Reveal as="li" key={logo.src} index={i} variant="fade" className="group">
            <div className="flex h-12 w-40 items-center justify-center [filter:url(#mv-logo-solid)] max-[767px]:h-10 max-[767px]:w-[130px]">
              <div className="flex items-center justify-center" style={{ width: `${logo.scale * 100}%`, height: `${logo.scale * 100}%` }}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto max-h-full w-auto max-w-full object-contain opacity-60 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}
