import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

/**
 * FAQSection - Figma-matched FAQ accordion section
 * Used on Contact page. Clean design with pink bottom borders.
 *
 * @param {Object} props
 * @param {Array} props.items - Array of { title, content } objects
 * @param {string} props.heading - Section heading. Default: 'Frequently Asked Questions'
 */
export default function FAQSection({ items, heading = 'Frequently Asked Questions' }) {
  const [openIndex, setOpenIndex] = useState(0) // First item open by default

  return (
    <section className="px-6 md:px-12 lg:px-[104px] pt-24 pb-12">
      <AnimatedSection animation="fade-up">
        <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-semibold leading-[1.3] text-neutral-600 py-6">
          {heading}
        </h2>
      </AnimatedSection>

      <div className="flex flex-col">
        {items.map((item, index) => (
          <AnimatedSection
            key={index}
            animation="fade-up"
            delay={index * 80}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full border-b border-[#FCE2E9] py-6 flex gap-4 lg:gap-[72px] items-start text-left cursor-pointer group"
            >
              <div className="flex-1 flex flex-col gap-6">
                <p className="text-[16px] md:text-[18px] lg:text-[20px] font-medium leading-[28px] text-neutral-600 group-hover:text-brand-pink transition-colors">
                  {item.title}
                </p>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pl-6 py-4">
                    <p className="font-light text-base leading-[1.6] text-neutral-500">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 transition-transform duration-300">
                {openIndex === index ? (
                  <Minus size={20} className="text-neutral-600" />
                ) : (
                  <Plus size={20} className="text-neutral-600" />
                )}
              </div>
            </button>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
