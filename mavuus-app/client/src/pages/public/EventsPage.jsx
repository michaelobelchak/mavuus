import { liveEvents } from '../../data/mockData'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import AnimatedSection from '../../components/ui/AnimatedSection'

function formatDate(dateStr) {
  // Parse YYYY-MM-DD directly to avoid timezone offset issues
  const [, m, d] = dateStr.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return {
    day: String(d).padStart(2, '0'),
    month: months[m - 1],
  }
}

export default function EventsPage() {
  // Sort events by date descending
  const sortedEvents = [...liveEvents].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  return (
    <div>
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-[74px] pb-6">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col gap-2.5">
            <Breadcrumbs
              items={[
                { label: 'Home', path: '/' },
                { label: 'Resources', path: '/resources' },
                { label: 'Live Events' },
              ]}
            />
            <h1 className="text-[28px] md:text-[36px] lg:text-[42px] leading-[1.1] text-dark-blue">
              Live Events
            </h1>
          </div>
        </AnimatedSection>
      </section>

      {/* Divider */}
      <div className="w-full h-[2px] bg-neutral-200 opacity-50" />

      {/* Content */}
      <section className="px-6 md:px-12 lg:px-[104px] pt-20 pb-40">
        <div className="flex flex-col gap-24">
          {sortedEvents.map((event, idx) => {
            const { day, month } = formatDate(event.date)
            return (
              <AnimatedSection
                key={event.id}
                animation="fade-up"
                delay={idx * 100}
              >
                {/* Event row */}
                <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-0 lg:justify-between w-full max-w-[1232px]">
                  {/* Date column */}
                  <div className="flex gap-2.5 items-start justify-center shrink-0">
                    <span className="text-[36px] md:text-[48px] lg:text-[56px] leading-[1.1] text-dark-blue">
                      {day}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[22px] leading-[1.3] font-medium text-dark-blue capitalize">
                        {month}
                        {event.status === 'completed' ? ' - ' : ''}
                      </span>
                      {event.status === 'completed' && (
                        <span className="text-[16px] leading-[1.6] text-dark-blue">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event card */}
                  <div className="flex flex-col-reverse lg:flex-row items-start lg:justify-between gap-6 lg:gap-0 w-full lg:w-[950px] group cursor-pointer">
                    {/* Text */}
                    <div className="flex flex-col gap-6 w-full lg:w-[496px]">
                      <h3 className="text-[24px] leading-[1.3] font-semibold text-dark-blue group-hover:text-brand-blue transition-colors duration-300">
                        {event.title}
                      </h3>
                      <p className="text-[16px] leading-[1.6] text-[#5E697C]">
                        {event.description}
                      </p>
                    </div>

                    {/* Image */}
                    <div className="w-full lg:w-[315px] h-[200px] rounded-[16px] overflow-hidden shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                {idx < sortedEvents.length - 1 && (
                  <div className="w-full max-w-[1232px] h-[2px] bg-neutral-200 opacity-50 mt-24" />
                )}
              </AnimatedSection>
            )
          })}
        </div>
      </section>
    </div>
  )
}
