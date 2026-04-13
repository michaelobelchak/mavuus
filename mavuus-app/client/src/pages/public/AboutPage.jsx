import { aboutLeaders } from '../../data/mockData'
import LogoBar from '../../components/sections/LogoBar'
import TestimonialRow from '../../components/sections/TestimonialRow'
import CTABannerQuote from '../../components/sections/CTABannerQuote'
import AnimatedSection from '../../components/ui/AnimatedSection'
import GradientText from '../../components/ui/GradientText'

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative px-6 md:px-12 lg:px-[104px] py-8 overflow-hidden">
        {/* Decorative mesh gradient */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-[120px]" />
          <div className="absolute top-[100px] right-[-100px] w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[100px]" />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0">
          {/* Left headline */}
          <AnimatedSection animation="fade-right" className="w-full lg:w-[600px] flex flex-col gap-6 lg:gap-0 lg:justify-between lg:h-[362px]">
            <div className="bg-[#EEEFF4] inline-flex items-center gap-2.5 px-4 py-1 self-start">
              <div className="w-0 h-6 border-l border-[#194A6D]" />
              <span className="text-[#194A6D] text-base leading-[1.6]">
                For businesses
              </span>
            </div>

            <h1 className="text-[28px] md:text-[36px] lg:text-[42px] font-medium leading-[1.1] max-w-full lg:w-[514px]">
              <GradientText className="font-semibold">Empowering Marketing Leaders</GradientText>{' '}
              <span className="font-light text-neutral-600">
                to Network, Learn and Advance Their
              </span>{' '}
              <GradientText className="font-semibold">Careers Together</GradientText>
            </h1>

            <p className="text-[18px] md:text-[20px] font-medium leading-[28px] text-neutral-500 max-w-full lg:w-[435px]">
              &laquo;Created from a spark of inspiration &mdash; and by two sisters who live and breathe the world of marketing every day&raquo;
            </p>
          </AnimatedSection>

          {/* Right circular image */}
          <AnimatedSection animation="scale-up" delay={200}>
            <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[498px] lg:h-[498px] rounded-full border-8 border-white/50 overflow-hidden flex-shrink-0 magnetic-hover">
              <img
                src="/assets/about/hero-sisters.jpg"
                alt="Mavuus founders"
                className="w-full h-[150%] object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Logo Bar */}
      <LogoBar />

      {/* Testimonial Row */}
      <TestimonialRow />

      {/* Marketing Leaders Grid */}
      <section className="py-24 px-6 md:px-12 lg:px-[104px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
          {/* Title card */}
          <AnimatedSection animation="fade-up" className="md:col-span-2 min-h-[300px] lg:h-[390px] p-6 flex flex-col gap-8 justify-center">
            <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-semibold leading-[1.3] text-neutral-600">
              The{' '}
              <span className="text-brand-pink">Ultimate </span>
              Collective
              <br />
              of Marketing{' '}
              <span className="text-brand-pink">Leaders</span>
            </h2>
            <p className="font-light text-base leading-[1.6] text-[#470B1B] max-w-full lg:w-[506px]">
              Our mission is simple &mdash; To foster an environment where senior marketing professionals can leverage the power of collaboration, share experiences, and grow together.
            </p>
          </AnimatedSection>

          {/* Leader cards */}
          {aboutLeaders.map((leader, i) => (
            <AnimatedSection
              key={leader.id}
              animation="fade-up"
              delay={100 + i * 80}
              className="h-[390px] bg-white border border-[#D2E0E8] flex flex-col items-center pb-6 px-6 hover-lift group"
            >
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={leader.avatar}
                  alt={leader.name}
                  className="w-[196px] h-[196px] rounded-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="w-[214px] text-center flex flex-col gap-2">
                <p className="text-[30px] leading-[30px] text-dark-blue">
                  {leader.name.split(' ')[0]}
                  <br />
                  {leader.name.split(' ').slice(1).join(' ')}
                </p>
                <p className="text-[14px] leading-[18px] text-[#81848C]">
                  {leader.title}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Full-width image with gradient */}
      <AnimatedSection as="section" animation="fade" className="relative h-[300px] md:h-[450px] lg:h-[560px] py-[36px] md:py-[72px]">
        <div className="h-[400px] md:h-[550px] lg:h-[660px] w-full relative">
          <img
            src="/assets/about/wide-photo.jpg"
            alt="Mavuus community"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
        </div>
      </AnimatedSection>

      {/* Founder Story */}
      <section className="px-6 md:px-12 lg:px-[240px] py-12">
        <AnimatedSection animation="fade-up" className="flex flex-col gap-8 lg:gap-14">
          <p className="text-[20px] md:text-[22px] lg:text-[24px] font-semibold leading-[1.3] text-neutral-600">
            <a href="https://www.linkedin.com/company/mavuus/" className="text-brand-pink underline link-underline" target="_blank" rel="noopener noreferrer">
              Mavuus
            </a>{' '}
            was born from a spark of inspiration by two sisters,{' '}
            <a href="https://www.linkedin.com/in/dilyaabushayeva/" className="text-brand-pink underline link-underline" target="_blank" rel="noopener noreferrer">
              Dilya Abushayeva
            </a>{' '}
            and{' '}
            <a href="https://www.linkedin.com/in/elmira-abushayeva-b560671a/" className="text-brand-pink underline link-underline" target="_blank" rel="noopener noreferrer">
              Elmira Abushayeva
            </a>
            , who live and breathe the world of marketing every day. After over 15 years in the industry, we&apos;ve come to understand one thing clearly: success in marketing is driven not only by individual expertise but by the strength of the network you build along the way.
          </p>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 text-base font-medium leading-6 text-neutral-500">
            <p className="flex-1">
              Throughout our careers, we&apos;ve navigated the complexities of leading marketing teams, developing strategies, and driving growth. But perhaps the most valuable lessons came from connecting with fellow marketing leaders who shared our challenges, insights, and solutions.
              <br /><br />
              We realized that true career growth doesn&apos;t happen in isolation. It happens when you can engage in meaningful discussions, share ideas, and tap into the collective wisdom of peers who understand the journey. That&apos;s why we created Mavuus.
            </p>
            <p className="flex-1">
              Mavuus is a community built exclusively for senior marketing leaders who are looking to network, learn, and collaborate with like-minded professionals. We bring together seasoned leaders who are passionate about continuous learning, career advancement, and shaping the future of marketing. Whether you&apos;re seeking career advice, leadership insights, or simply the opportunity to connect with peers, Mavuus is here to empower your journey.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Stats Cards */}
      <section className="px-6 md:px-12 lg:px-24 py-[72px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-end justify-center text-[#FFF5F5]">
          {/* Card 1 - Blue */}
          <AnimatedSection animation="fade-up" delay={0} className="h-[200px] md:h-[223px] bg-brand-blue rounded-[32px] p-6 pb-2 flex flex-col justify-between hover-lift">
            <p className="font-light text-[20px] md:text-[24px] leading-[1.6] max-w-[280px]">
              marketing mentorship{' '}
              <span className="font-bold">programs</span>
            </p>
            <p className="text-[56px] md:text-[76px] font-bold leading-none">08</p>
          </AnimatedSection>

          {/* Card 2 - Pink */}
          <AnimatedSection animation="fade-up" delay={150} className="h-[250px] md:h-[315px] bg-brand-pink rounded-[32px] p-6 pb-2 flex flex-col justify-between hover-lift">
            <p className="font-light text-[20px] md:text-[24px] leading-[1.6]">
              educational on-demand
              <br />
              <span className="font-bold">videos</span>
            </p>
            <p className="text-[56px] md:text-[76px] font-bold leading-none">1,423</p>
          </AnimatedSection>

          {/* Card 3 - Medium Blue */}
          <AnimatedSection animation="fade-up" delay={300} className="h-[300px] md:h-[442px] bg-[#4C83A4] rounded-[32px] p-6 pb-2 flex flex-col justify-between hover-lift">
            <p className="font-light text-[20px] md:text-[24px] leading-[1.6]">
              get your marketing{' '}
              <span className="font-bold">efficiency boost</span>
            </p>
            <p className="text-[56px] md:text-[76px] font-bold leading-none">+100%</p>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Banner */}
      <CTABannerQuote />
    </div>
  )
}
