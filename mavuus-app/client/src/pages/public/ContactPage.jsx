import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { contactFaqItems } from '../../data/mockData'
import LogoBar from '../../components/sections/LogoBar'
import TestimonialRow from '../../components/sections/TestimonialRow'
import CTABannerQuote from '../../components/sections/CTABannerQuote'
import FAQSection from '../../components/sections/FAQSection'
import AnimatedSection from '../../components/ui/AnimatedSection'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [faqItems, setFaqItems] = useState(null)

  useEffect(() => {
    fetch('/api/faq?page=contact')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setFaqItems(data.map(f => ({ title: f.question, content: f.answer }))))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div>
      <Helmet>
        <title>Contact Mavuus</title>
        <meta name="description" content="Get in touch with the Mavuus team. Whether you have a question, need support, or want to explore partnerships, we'd love to connect." />
        <link rel="canonical" href="https://mavuus.com/contact" />
      </Helmet>

      {/* Hero + Form Section */}
      <section className="px-6 md:px-12 lg:px-24 pt-6 pb-10">
        {/* Header Row */}
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-36 items-start mb-9">
            {/* Left: Title */}
            <div className="shrink-0">
              <h1 className="text-[28px] md:text-[36px] lg:text-[42px] font-medium leading-[1.1]">
                <span className="text-brand-pink">Get in Touch</span>
                <br />
                <span className="text-neutral-600">Support@Mavuus.com</span>
              </h1>
            </div>

            {/* Right: Description */}
            <div className="flex-1 font-light text-base leading-[1.6] text-neutral-500">
              <p className="mb-4">
                Whether you have a question, need support, or want to explore partnership opportunities, we&apos;d love to connect.
              </p>
              <p>
                Learn how Mavuus helps marketing leaders to advance their careers and achieve their goals by learning from experts, networking with peers, and building meaningful connections.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Form Card */}
        <AnimatedSection animation="fade-up" delay={150}>
          {submitted ? (
            <div className="bg-white/90 border border-neutral-200 rounded-[28px] p-8 text-center py-20">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark-blue mb-2">Message Sent!</h3>
              <p className="text-neutral-500 mb-6">We&apos;ll get back to you shortly.</p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', message: '' }) }}
                className="text-brand-pink font-semibold hover:underline cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/90 border border-neutral-200 rounded-[28px] p-2">
              {/* Textarea */}
              <div className="bg-bg-light rounded-t-[20px] h-[240px] flex flex-col relative">
                <div className="flex-1 px-9 py-6">
                  <textarea
                    value={formData.message}
                    onChange={handleChange('message')}
                    placeholder={'Ask your question and provide brief information about yourself\nand we\'ll get back to you shortly...'}
                    className="w-full h-full bg-transparent font-light text-[18px] md:text-[24px] leading-[1.6] text-dark-blue placeholder:text-neutral-300 resize-none outline-none"
                  />
                </div>
                <div className="h-px bg-neutral-200 mx-0" />
              </div>

              {/* Bottom Row: Inputs + Button */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-stretch md:items-end p-4">
                {/* Name */}
                <div className="flex-1 flex flex-col gap-2.5">
                  <label className="px-1 text-sm font-semibold text-neutral-300">
                    Your Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="Enter Your Full Name"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-4 text-sm font-medium text-dark-blue placeholder:text-neutral-300 outline-none focus:border-brand-pink transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="flex-1 flex flex-col gap-2.5">
                  <label className="px-1 text-sm font-semibold text-neutral-300">
                    Email Address<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="your@Email.com"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-4 text-sm font-medium text-dark-blue placeholder:text-neutral-300 outline-none focus:border-brand-pink transition-colors"
                  />
                </div>

                {/* Phone */}
                <div className="flex-1 flex flex-col gap-2.5">
                  <label className="px-1 text-sm font-semibold text-neutral-300">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    placeholder="+1 ( _ _ _ ) _ _ _ - _ _ - _ _"
                    className="w-full bg-white border border-neutral-300 rounded-xl p-4 text-sm font-medium text-dark-blue placeholder:text-neutral-300 outline-none focus:border-brand-pink transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-pink text-white font-bold text-base px-8 py-4 rounded-[16px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:bg-brand-pink-hover transition-all duration-300 btn-press whitespace-nowrap flex-shrink-0 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm px-4 pb-4">{error}</p>
              )}
            </form>
          )}
        </AnimatedSection>
      </section>

      {/* Logo Bar */}
      <LogoBar />

      {/* Testimonial Row */}
      <TestimonialRow />

      {/* FAQ Section */}
      <FAQSection items={faqItems || contactFaqItems} />

      {/* CTA Banner */}
      <CTABannerQuote />
    </div>
  )
}
