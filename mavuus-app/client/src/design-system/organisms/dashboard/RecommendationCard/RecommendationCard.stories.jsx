import { RecommendationCard, RecommendationCardSkeleton } from './RecommendationCard'
import { formatDate, toDateTime } from '../../../lib/formatDate'

const recommendations = [
  {
    id: 1,
    fromName: 'Marcus Lee',
    fromTitle: 'CMO, Fabrikam',
    message: 'Priya rebuilt our lifecycle program in a quarter. I would hire her again tomorrow.',
    subject: 'Lumen Creative',
    dateLabel: formatDate('2026-09-14 12:00:00'),
    dateTime: toDateTime('2026-09-14 12:00:00'),
  },
  {
    id: 2,
    fromName: 'Hana Kim',
    fromTitle: 'Director of Demand Gen, Adatum',
    message: 'The best HubSpot partner we have worked with. Fast, honest about tradeoffs and great at training our team.',
    subject: 'Northwind Growth',
    dateLabel: formatDate('2026-08-02 12:00:00'),
    dateTime: toDateTime('2026-08-02 12:00:00'),
  },
]

export default {
  title: 'Organisms/Dashboard/RecommendationCard',
  component: RecommendationCard,
  tags: ['autodocs'],
  decorators: [(Story, { parameters }) => <div className={parameters.wide ? 'w-5xl max-w-full' : 'w-xl max-w-full'}><Story /></div>],
  args: recommendations[0],
}

export const Default = {}

export const MissingFields = { args: { fromTitle: undefined, subject: undefined, dateLabel: undefined, dateTime: undefined } }

export const LongContent = {
  args: {
    fromName: 'Alexandra Montgomery-Fitzgerald',
    subject: 'The Integrated Marketing and Communications Collective',
    message:
      'We brought them in during a rebrand, a CMO transition and a product launch in the same quarter. They kept three agencies aligned, wrote the messaging house our sales team still uses and ran a launch event for 600 customers without a single missed deadline. If you need a partner who can hold a lot of moving parts, start here.',
  },
}

export const Loading = { render: () => <RecommendationCardSkeleton /> }

export const Grid = {
  parameters: { wide: true },
  render: () => (
    <ul className="grid grid-cols-1 gap-ds-md md:grid-cols-2">
      {recommendations.map((recommendation) => (
        <li key={recommendation.id}>
          <RecommendationCard {...recommendation} />
        </li>
      ))}
      <li>
        <RecommendationCardSkeleton announce={false} />
      </li>
    </ul>
  ),
}
