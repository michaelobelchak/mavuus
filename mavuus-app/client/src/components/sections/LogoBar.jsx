import { useState, useEffect } from 'react'
import { brandLogos as fallbackLogos } from '../../data/mockData'
import AnimatedSection from '../ui/AnimatedSection'

export default function LogoBar({ title = 'Trusted by leading brands' }) {
  const [logos, setLogos] = useState(null)

  useEffect(() => {
    fetch('/api/brand-logos')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setLogos(data.map(l => ({ name: l.name, src: l.logo_url }))))
      .catch(() => setLogos(fallbackLogos))
  }, [])

  const displayLogos = logos || fallbackLogos

  return (
    <AnimatedSection as="section" animation="fade-up" className="py-14 px-6">
      <div className="max-w-[1232px] mx-auto">
        <h3 className="font-semibold text-[22px] md:text-[24px] lg:text-[28px] leading-[1.3] text-dark-blue mb-14">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-8">
          {displayLogos.map(logo => (
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
