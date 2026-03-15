import { Link } from 'react-router-dom'
import { ctaQuote } from '../../data/mockData'
import AnimatedSection from '../ui/AnimatedSection'

/**
 * CTABannerQuote - Light blue CTA banner with testimonial quote and person image
 * Shared section used across About, Pricing, Contact, Homepage.
 */
export default function CTABannerQuote() {
  return (
    <AnimatedSection as="section" animation="scale-up" className="px-6 md:px-12 lg:px-24 py-12">
      <div className="bg-[#EAF6FF] rounded-[24px] md:rounded-[40px] lg:rounded-[56px] overflow-hidden relative flex flex-col lg:flex-row lg:items-end lg:justify-end gap-8 lg:gap-[72px] px-6 md:px-8 lg:px-12 py-8 min-h-0 lg:min-h-[450px] group">
        {/* Decorative circles (top-right) */}
        <div className="absolute right-[-50px] top-[-180px] w-[500px] h-[500px] opacity-70 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[#1F648D]/10 transition-all duration-1000"
              style={{
                width: `${200 + i * 60}px`,
                height: `${200 + i * 60}px`,
                top: `${50 - i * 12}%`,
                left: `${50 - i * 12}%`,
              }}
            />
          ))}
        </div>

        {/* Person image (center-right) */}
        <div className="hidden lg:block absolute left-[540px] top-[49px] w-[412px] h-[408px]">
          <img
            src={ctaQuote.image}
            alt={ctaQuote.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Left quote content */}
        <div className="flex-1 flex flex-col justify-between h-full relative z-10 min-h-0 lg:min-h-[386px]">
          <div className="flex flex-col gap-8">
            <img
              src="/assets/shared/quote-mark.png"
              alt=""
              className="w-9 h-[33px]"
            />
            <p className="font-light text-[18px] md:text-[20px] lg:text-[24px] leading-[1.6] text-[#470B1B] max-w-full lg:max-w-[492px]">
              &mdash; {ctaQuote.quote}
            </p>
          </div>
          <div className="text-[18px] md:text-[20px] lg:text-[22px] text-[#470B1B]">
            <p>
              <span className="font-bold">{ctaQuote.name}</span>,
            </p>
            <p>{ctaQuote.title}</p>
          </div>
        </div>

        {/* Get Started button */}
        <div className="relative z-10 flex-shrink-0">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-pink text-white font-bold text-base rounded-[16px] shadow-lg shadow-brand-pink/30 hover:bg-brand-pink-hover transition-all duration-300 btn-press hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}
