import { useState } from 'react'
import { partnershipTestimonial } from '../../data/mockData'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const testimonials = [partnershipTestimonial]

/**
 * TestimonialRow - "Forming Lasting Partnerships" testimonial section
 * Shared section used across About, Pricing, Contact, Homepage.
 */
export default function TestimonialRow() {
  const [current] = useState(0)
  const t = testimonials[current]

  return (
    <AnimatedSection as="section" animation="fade-up" className="px-6">
      <div className="max-w-[1232px] mx-auto border-t border-neutral-200 pt-24 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[72px] items-start">
          {/* Left title */}
          <h2 className="font-semibold text-[24px] md:text-[28px] lg:text-[32px] leading-[1.3] text-dark-blue w-full lg:w-[320px] lg:flex-shrink-0">
            Forming Lasting partnerships
          </h2>

          {/* Right testimonial */}
          <div className="flex-1 relative min-h-0 lg:min-h-[382px]">
            <div className="flex flex-col gap-8 lg:gap-[72px]">
              <p className="font-light text-[18px] md:text-[20px] lg:text-[24px] leading-[1.6] text-dark-blue">
                {t.quote}
              </p>
              <div className="flex gap-4 items-center">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[18px] leading-[1.3] text-dark-blue">
                    {t.name}
                  </p>
                  <p className="text-[14px] text-[#8692A1]">
                    {t.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="relative lg:absolute lg:bottom-6 lg:right-9 flex gap-[50px] mt-6 lg:mt-0">
              <button className="text-dark-blue hover:text-brand-pink transition-colors duration-300 cursor-pointer hover:scale-110 active:scale-95">
                <ArrowLeft size={20} />
              </button>
              <button className="text-dark-blue hover:text-brand-pink transition-colors duration-300 cursor-pointer hover:scale-110 active:scale-95">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
