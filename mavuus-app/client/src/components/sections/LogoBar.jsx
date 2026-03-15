import { brandLogos } from '../../data/mockData'
import AnimatedSection from '../ui/AnimatedSection'

/**
 * LogoBar - Trusted brands logo strip
 * Shared section used across About, Pricing, Contact pages.
 *
 * @param {Object} props
 * @param {string} props.title - Section heading
 */
export default function LogoBar({ title = 'Trusted by leading brands' }) {
  return (
    <AnimatedSection as="section" animation="fade-up" className="py-14 px-6">
      <div className="max-w-[1232px] mx-auto">
        <h3 className="font-semibold text-[22px] md:text-[24px] lg:text-[28px] leading-[1.3] text-dark-blue mb-14">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-8">
          {brandLogos.map(logo => (
            <div
              key={logo.name}
              className="h-8 w-[100px] md:w-[120px] lg:w-[147px] relative opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500"
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
