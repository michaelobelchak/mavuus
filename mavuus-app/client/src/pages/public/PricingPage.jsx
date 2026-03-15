import { useState } from 'react'
import { Link } from 'react-router-dom'
import { pricingFeatures } from '../../data/mockData'
import LogoBar from '../../components/sections/LogoBar'
import TestimonialRow from '../../components/sections/TestimonialRow'
import CTABannerQuote from '../../components/sections/CTABannerQuote'
import { CircleCheck } from 'lucide-react'
import AnimatedSection from '../../components/ui/AnimatedSection'

export default function PricingPage() {
  const [yearly, setYearly] = useState(true)

  return (
    <div>
      {/* Hero Title */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-9 pb-14">
        <AnimatedSection animation="fade-up">
          <h1 className="text-[24px] md:text-[32px] lg:text-[40px] leading-[1.2] text-dark-blue text-center w-full">
            <span className="font-semibold text-brand-blue">Collaborate</span> with peers.{' '}
            <span className="font-semibold text-brand-blue">Learn</span> from the experts.
            <br />
            <span className="font-semibold text-brand-blue">Exchange</span> contractors.{' '}
            <span className="font-semibold text-brand-blue">Land</span> clients.
          </h1>
        </AnimatedSection>

        {/* Pricing Card */}
        <AnimatedSection animation="scale-up" delay={200}>
          <div className="mt-9 border border-dashed border-neutral-300 rounded-[35px] px-3 py-2">
            <div className="bg-bg-light rounded-[32px] p-6 md:p-10 lg:p-14 flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-0">
              {/* Left section */}
              <div className="w-full lg:w-[385px] flex flex-col gap-14">
                {/* Heading */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-semibold leading-[1.3] text-neutral-600">
                    Pro Access
                  </h2>
                  <p className="font-light text-[20px] leading-[1.6] text-neutral-500">
                    We are on a mission to help CMOs increase their C-suite impact.
                  </p>
                </div>

                {/* Price + toggle */}
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-start text-[24px] md:text-[32px] lg:text-[40px] leading-[1.3] text-neutral-600">
                    <span className="line-through opacity-50">$15</span>
                    <span className="font-semibold">$9.25</span>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <span className={`text-[18px] leading-[1.6] transition-colors ${!yearly ? 'text-neutral-600' : 'text-neutral-500'}`}>
                      monthly
                    </span>
                    <button
                      onClick={() => setYearly(!yearly)}
                      className="relative w-11 h-[22px] rounded-full bg-neutral-600 transition-colors cursor-pointer"
                    >
                      <div
                        className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 shadow-md ${
                          yearly ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className={`text-[18px] leading-[1.6] transition-colors ${yearly ? 'text-neutral-600' : 'text-neutral-500'}`}>
                      yearly
                    </span>
                  </div>
                  <p className="text-[18px] leading-[1.6] text-neutral-500">
                    per user / month for the first 12 month if sign up for 12 month
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  to="/register"
                  className="w-full lg:w-[385px] flex items-center justify-center px-8 py-4 bg-brand-pink text-bg-light font-semibold text-[20px] leading-[28px] rounded-[16px] hover:bg-brand-pink-hover transition-all duration-300 btn-press shadow-lg shadow-brand-pink/25"
                >
                  Start 30-Day Free Trial
                </Link>
              </div>

              {/* Right section - features */}
              <div className="flex flex-col gap-10">
                <h3 className="font-semibold text-[24px] leading-[1.3] text-dark-blue">
                  Join hundreds of other marketing leaders to:
                </h3>
                <div className="flex flex-col gap-4 w-full lg:w-[579px]">
                  {pricingFeatures.map((feature, i) => (
                    <div
                      key={feature}
                      className="flex gap-4 items-start opacity-0 animate-fade-in"
                      style={{ animationDelay: `${300 + i * 80}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                        <CircleCheck size={21} className="text-brand-blue" />
                      </div>
                      <p className="text-[18px] leading-[1.6] text-neutral-500">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Logo Bar */}
      <LogoBar />

      {/* Testimonial Row */}
      <TestimonialRow />

      {/* CTA Banner */}
      <CTABannerQuote />
    </div>
  )
}
