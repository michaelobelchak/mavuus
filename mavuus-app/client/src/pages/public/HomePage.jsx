import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleCheck, ArrowRight, Play, Briefcase, GraduationCap } from 'lucide-react'
import { scrollLeaders, pricingFeatures, brandLogos } from '../../data/mockData'
import InfiniteLeaderScroll from '../../components/sections/InfiniteLeaderScroll'
import TestimonialRow from '../../components/sections/TestimonialRow'
import CTABannerQuote from '../../components/sections/CTABannerQuote'
import AnimatedSection from '../../components/ui/AnimatedSection'
import GradientText from '../../components/ui/GradientText'
import AnimatedCounter from '../../components/ui/AnimatedCounter'

export default function HomePage() {
  const navigate = useNavigate()
  const [heroTab, setHeroTab] = useState('marketers')
  const [heroEmail, setHeroEmail] = useState('')
  const [heroSubmitting, setHeroSubmitting] = useState(false)
  // Community stats — fetched from /api/stats, seeded with marketing defaults
  const [stats, setStats] = useState({ members: 500, liveSessions: 200, vendors: 50 })

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setStats((prev) => ({
            members: Math.max(data.members || 0, prev.members),
            liveSessions: Math.max((data.sessions || 0), prev.liveSessions),
            vendors: Math.max(data.vendors || 0, prev.vendors),
          }))
        }
      })
      .catch(() => {})
  }, [])

  const handleJoinWaitlist = async (e) => {
    e?.preventDefault?.()
    const email = heroEmail.trim()
    if (!email) {
      navigate('/register')
      return
    }
    setHeroSubmitting(true)
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // non-blocking — still proceed to register
    } finally {
      setHeroSubmitting(false)
      navigate(`/register?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-6 pb-16 relative overflow-hidden">
        {/* Decorative mesh gradient background */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-brand-pink/10 rounded-full blur-[140px]" />
          <div className="absolute top-[100px] right-[-150px] w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-200px] left-[40%] w-[400px] h-[400px] bg-brand-pink/5 rounded-full blur-[100px]" />
        </div>

        <AnimatedSection animation="fade-up">
          <div className="max-w-full lg:max-w-[700px]">
            <h1 className="text-[28px] md:text-[36px] lg:text-[48px] font-bold leading-[1.1] mb-6">
              We are on a <span className="italic font-medium">mission</span> to help
              <br />
              CMOs <GradientText className="font-bold">elevate</GradientText> their influence at
              <br />
              the executive table.
            </h1>
            <p className="text-base font-light leading-[1.6] text-neutral-500 max-w-[540px] mb-8">
              Through marketing community, connecting the right people and opening the right conversations.
            </p>
          </div>
        </AnimatedSection>

        {/* Tab Filter + Email Input */}
        <AnimatedSection animation="fade-up" delay={200}>
          <div className="flex items-center gap-6 mb-6">
            <div className="flex gap-0 bg-bg-light rounded-full p-1">
              <button
                onClick={() => setHeroTab('marketers')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  heroTab === 'marketers'
                    ? 'bg-dark-blue text-white shadow-md'
                    : 'text-neutral-500 hover:text-dark-blue'
                }`}
              >
                For Marketers
              </button>
              <button
                onClick={() => setHeroTab('business')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  heroTab === 'business'
                    ? 'bg-dark-blue text-white shadow-md'
                    : 'text-neutral-500 hover:text-dark-blue'
                }`}
              >
                For Business
              </button>
            </div>
          </div>

          <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-[520px]">
            <div className="flex-1 relative">
              <input
                type="email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                placeholder="Enter your Email"
                className="w-full bg-white border border-neutral-300 rounded-full pl-5 pr-4 py-3.5 text-sm outline-none focus:border-brand-pink transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={heroSubmitting}
              className="bg-brand-pink text-white font-bold text-sm px-6 py-3.5 rounded-full hover:bg-brand-pink-hover transition-all duration-300 btn-press shadow-lg shadow-brand-pink/25 whitespace-nowrap text-center disabled:opacity-60 cursor-pointer"
            >
              {heroSubmitting ? 'Joining…' : 'Join the Waitlist'}
            </button>
          </form>

          {/* Avatar stack */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex -space-x-2">
              {scrollLeaders.slice(0, 4).map((l, i) => (
                <img
                  key={l.id}
                  src={l.avatar}
                  alt={l.name}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  style={{ zIndex: 4 - i }}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              Our talent has worked at some of the biggest companies
            </p>
          </div>

          {/* Animated stats row */}
          <div className="flex flex-wrap gap-x-12 gap-y-6 mt-12 max-w-[640px]">
            <div>
              <AnimatedCounter
                end={stats.members}
                suffix="+"
                className="text-[32px] md:text-[40px] font-bold text-dark-blue leading-none"
              />
              <p className="text-sm text-neutral-500 mt-1">Marketing leaders</p>
            </div>
            <div>
              <AnimatedCounter
                end={stats.liveSessions}
                suffix="+"
                className="text-[32px] md:text-[40px] font-bold text-dark-blue leading-none"
              />
              <p className="text-sm text-neutral-500 mt-1">Sessions hosted</p>
            </div>
            <div>
              <AnimatedCounter
                end={stats.vendors}
                suffix="+"
                className="text-[32px] md:text-[40px] font-bold text-dark-blue leading-none"
              />
              <p className="text-sm text-neutral-500 mt-1">Vetted vendors</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Hero images (right side) - floating */}
        <div className="hidden lg:block absolute right-[80px] top-[20px] w-[500px] h-[500px] pointer-events-none">
          <div className="animate-float relative w-full h-full">
            <img
              src="/assets/home/hero-bg.jpg"
              alt=""
              className="absolute w-[380px] h-[460px] object-cover rounded-[32px] right-0 top-0 shadow-2xl"
            />
          </div>
          <div className="animate-float-delayed absolute left-[-40px] bottom-[20px] w-[200px] h-[250px]">
            <img
              src="/assets/home/hero-rect.jpg"
              alt=""
              className="w-full h-full object-cover rounded-[24px] shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ===== INFINITE SCROLL LEADERS ===== */}
      <InfiniteLeaderScroll leaders={scrollLeaders} speed={25} />

      {/* ===== 80% STAT SECTION ===== */}
      <section className="px-6 md:px-12 lg:px-[104px] py-20">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
            {/* Left content */}
            <div className="flex-1">
              <h2 className="text-[24px] md:text-[32px] lg:text-[38px] font-bold leading-[1.15] text-dark-blue mb-6">
                <span className="text-brand-pink">80%</span> of CEOs don&apos;t trust or
                <br />
                are unimpressed with
                <br />
                their CMOs
              </h2>
              <p className="text-base font-light leading-[1.6] text-neutral-500 max-w-[460px] mb-8">
                CMOs who fail to reshape the role, redefine their value, and transform their approach risk losing their seat at the executive table. Marketing leadership demands a new level of strategic impact, measurable outcomes, and cross-functional influence.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-brand-pink font-semibold text-sm hover:gap-3 transition-all duration-300 link-underline"
              >
                Learn More <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right image */}
            <div className="w-full lg:w-[440px] flex-shrink-0">
              <img
                src="/assets/home/stat-image.jpg"
                alt="Marketing leaders collaboration"
                className="w-full h-[300px] md:h-[400px] object-cover rounded-[24px] shadow-lg"
              />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== COLLABORATE SECTION (Pricing-style) ===== */}
      <section className="px-6 md:px-12 lg:px-[104px] py-20 bg-bg-light">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-3">
            <span className="inline-block bg-white text-brand-pink text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              For Marketers
            </span>
          </div>
          <h2 className="text-[24px] md:text-[32px] lg:text-[38px] font-bold leading-[1.15] text-center mb-16">
            <span className="text-brand-blue">Collaborate</span> with peers.{' '}
            <span className="text-brand-blue">Learn</span> from the experts.
            <br />
            <span className="text-brand-blue">Exchange</span> contractors.{' '}
            <span className="text-brand-blue">Land</span> clients / jobs.
          </h2>
        </AnimatedSection>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start max-w-[1100px] mx-auto">
          {/* Feature checklist */}
          <AnimatedSection animation="fade-left" className="flex-1">
            <div className="bg-white rounded-[24px] p-8 shadow-sm">
              <h3 className="text-[22px] font-semibold text-dark-blue mb-2">
                Join hundreds of other marketing leaders to:
              </h3>
              <div className="flex flex-col gap-5 mt-6">
                {pricingFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CircleCheck size={21} className="text-brand-blue flex-shrink-0 mt-0.5" />
                    <p className="text-base text-neutral-500">{feature}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center justify-center w-full bg-brand-pink text-white font-bold text-base px-8 py-4 rounded-[16px] shadow-lg shadow-brand-pink/25 hover:bg-brand-pink-hover transition-all duration-300 btn-press"
              >
                Get Started
              </Link>
            </div>
          </AnimatedSection>

          {/* Right side image */}
          <AnimatedSection animation="fade-right" className="flex-1">
            <img
              src="/assets/home/section-image-1.jpg"
              alt="Marketing collaboration"
              className="w-full h-[350px] md:h-[450px] lg:h-[520px] object-cover rounded-[24px] shadow-lg"
            />
          </AnimatedSection>
        </div>
      </section>

      {/* ===== FRACTIONAL WORK SECTION ===== */}
      <section className="px-6 md:px-12 lg:px-[104px] py-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          {/* Left content */}
          <AnimatedSection animation="fade-left" className="flex-1">
            <span className="inline-block bg-bg-light text-brand-blue text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              For Business
            </span>
            <h2 className="text-[24px] md:text-[32px] lg:text-[38px] font-bold leading-[1.15] text-dark-blue mb-4">
              Looking for{' '}
              <span className="text-brand-blue">Fractional Work</span>?
            </h2>
            <p className="text-base font-light leading-[1.6] text-neutral-500 max-w-[460px] mb-6">
              We Are Well-Connected and Will Introduce You to the Right People.
            </p>
            <p className="text-sm font-light leading-[1.6] text-neutral-500 max-w-[460px] mb-8">
              Whether you need a fractional CMO, a demand gen specialist, or a brand strategist, Mavuus connects you with vetted marketing leaders who can hit the ground running.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-dark-blue text-white font-bold text-sm px-8 py-4 rounded-full hover:bg-dark-blue/90 transition-all duration-300 btn-press"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </AnimatedSection>

          {/* Right image */}
          <AnimatedSection animation="fade-right" className="flex-1">
            <img
              src="/assets/home/fractional-image.jpg"
              alt="Fractional work"
              className="w-full h-[300px] md:h-[400px] lg:h-[450px] object-cover rounded-[24px] shadow-lg"
            />
          </AnimatedSection>
        </div>
      </section>

      {/* ===== MAVUUS ACADEMY SECTION ===== */}
      <section className="px-6 md:px-12 lg:px-[104px] py-20 bg-bg-light">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          {/* Left: Video thumbnails */}
          <AnimatedSection animation="fade-left" className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded-[20px] overflow-hidden shadow-lg group cursor-pointer col-span-2 h-[220px] md:h-[280px]">
                <img
                  src="/assets/home/academy-image.jpg"
                  alt="Mavuus Academy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-dark-blue/30 group-hover:bg-dark-blue/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Play size={24} className="text-brand-pink ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="relative rounded-[16px] overflow-hidden shadow-md group cursor-pointer h-[120px] md:h-[160px]">
                <img
                  src="/assets/home/section-image-2.jpg"
                  alt="Academy session"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-dark-blue/30 group-hover:bg-dark-blue/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <Play size={16} className="text-brand-pink ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="relative rounded-[16px] overflow-hidden shadow-md group cursor-pointer h-[120px] md:h-[160px]">
                <img
                  src="/assets/home/hero-rect.jpg"
                  alt="Academy session"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-dark-blue/30 group-hover:bg-dark-blue/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <Play size={16} className="text-brand-pink ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right content */}
          <AnimatedSection animation="fade-right" className="flex-1">
            <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold leading-[1.2] text-dark-blue mb-4">
              Sharpen Your Marketing
              <br />
              Expertise with Mavuus Academy
            </h2>
            <p className="text-base font-light leading-[1.6] text-neutral-500 max-w-[460px] mb-4">
              Check Out Mavuus&apos;s Exciting Speakers
              <br />
              in Our Library and Recommendations
            </p>
            <p className="text-sm font-light leading-[1.6] text-neutral-500 max-w-[460px] mb-8">
              Access on-demand sessions from top marketing leaders covering everything from ABM strategy to brand positioning. New content added weekly.
            </p>
            <div className="flex gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-brand-pink text-white font-bold text-sm px-6 py-3.5 rounded-[16px] hover:bg-brand-pink-hover transition-all duration-300 btn-press shadow-lg shadow-brand-pink/25"
              >
                Browse Academy
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-neutral-300 text-dark-blue font-semibold text-sm px-6 py-3.5 rounded-[16px] hover:border-dark-blue transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== STOP SEARCHING SECTION (Dark) ===== */}
      <section className="bg-dark-blue py-24 px-6 md:px-12 lg:px-[104px] relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] lg:w-[600px] lg:h-[600px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />

        <AnimatedSection animation="fade-up">
          <div className="relative z-10 max-w-full lg:max-w-[600px]">
            <span className="inline-block bg-white/10 text-brand-pink text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              For Business
            </span>
            <h2 className="text-[24px] md:text-[32px] lg:text-[38px] font-bold leading-[1.15] text-white mb-6">
              Stop <span className="text-brand-pink">SEARCHING</span> and
              <br />
              start <span className="text-brand-pink">MATCHING</span> with
              <br />
              Top Marketing Leaders
            </h2>
            <p className="text-base font-light leading-[1.6] text-white/70 max-w-[480px] mb-8">
              Our matchmaking algorithm connects businesses with the right marketing expertise. Tell us what you need, and we&apos;ll find the perfect match from our vetted community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-brand-pink text-white font-bold text-sm px-8 py-4 rounded-[16px] hover:bg-brand-pink-hover transition-all duration-300 btn-press shadow-lg shadow-brand-pink/25"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold text-sm px-8 py-4 rounded-[16px] hover:border-white/40 transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== DAY-TO-DAY EXECUTION SECTION ===== */}
      <section className="px-6 md:px-12 lg:px-[104px] py-20">
        <AnimatedSection animation="fade-up">
          <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold leading-[1.2] text-dark-blue mb-4">
            Need help with day-to-day
            <br />
            marketing execution? We got you.
          </h2>
          <p className="text-base font-light leading-[1.6] text-neutral-500 max-w-[600px] mb-12">
            Whether you need one-off tasks, ongoing support, or specialized expertise, our community of marketing professionals is ready to help you execute at scale.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Service cards */}
          {[
            { icon: Briefcase, title: 'Your Meetings? Get Yours Done', desc: 'We have a solution for any of your marketing execution needs.' },
            { icon: GraduationCap, title: 'Budget? We Break It Down', desc: 'We have a solution for any of your marketing execution needs.' },
            { icon: Briefcase, title: 'Ads Audit? Count Us In!', desc: 'We have a solution for any of your marketing execution needs.' },
            { icon: GraduationCap, title: 'Reporting? We Got That', desc: 'We have a solution for any of your marketing execution needs.' },
          ].map((service, i) => (
            <AnimatedSection
              key={i}
              animation="fade-up"
              delay={i * 100}
            >
              <div className="bg-bg-light rounded-[20px] p-6 hover-lift cursor-pointer group h-full">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-pink/10 transition-colors duration-300">
                  <service.icon size={22} className="text-brand-blue group-hover:text-brand-pink transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-dark-blue mb-2">{service.title}</h3>
                <p className="text-sm font-light text-neutral-500 leading-relaxed">{service.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIAL ROW ===== */}
      <TestimonialRow />

      {/* ===== LOGO BAR ===== */}
      <section className="py-14 px-6">
        <div className="max-w-[1232px] mx-auto">
          <h3 className="font-semibold text-[28px] leading-[1.3] text-dark-blue mb-14">
            Trusted by leading brands
          </h3>
          <div className="flex flex-wrap items-center gap-8">
            {brandLogos.map(logo => (
              <div
                key={logo.name}
                className="h-8 w-[147px] relative opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500"
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
      </section>

      {/* ===== CTA BANNER ===== */}
      <CTABannerQuote />
    </div>
  )
}
