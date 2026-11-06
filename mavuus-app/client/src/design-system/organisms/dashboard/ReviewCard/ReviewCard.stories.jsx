import { Flag } from 'lucide-react'
import { Button } from '../../../primitives'
import { ReviewCard, ReviewCardSkeleton } from './ReviewCard'
import { formatDate, toDateTime } from '../../../lib/formatDate'

const reviews = [
  {
    id: 1,
    reviewerName: 'Priya Nair',
    reviewerTitle: 'VP Marketing, Contoso',
    rating: 5,
    text: 'Ran our ABM program end to end and doubled pipeline in two quarters. Weekly reporting we could take straight to the board.',
    dateLabel: formatDate('2026-10-28 12:00:00'),
    dateTime: toDateTime('2026-10-28 12:00:00'),
    subject: 'Northwind Growth',
  },
  {
    id: 2,
    reviewerName: 'Marcus Lee',
    reviewerTitle: 'CMO, Fabrikam',
    rating: 3,
    text: 'Good creative, average strategy.',
    dateLabel: formatDate('2026-10-12 12:00:00'),
    dateTime: toDateTime('2026-10-12 12:00:00'),
    subject: 'Brightpath Media',
  },
  {
    id: 3,
    reviewerName: 'Ana Souza',
    reviewerTitle: 'Head of Brand, Tailspin',
    rating: 4,
    text: 'Strong brand refresh, a little slow on revisions.',
    dateLabel: formatDate('2026-09-30 12:00:00'),
    dateTime: toDateTime('2026-09-30 12:00:00'),
  },
]

export default {
  title: 'Organisms/Dashboard/ReviewCard',
  component: ReviewCard,
  tags: ['autodocs'],
  decorators: [(Story, { parameters }) => <div className={parameters.wide ? 'w-5xl max-w-full' : 'w-xl max-w-full'}><Story /></div>],
  args: reviews[0],
}

export const Default = {}

export const WithActions = {
  args: {
    actions: (
      <Button size="sm" variant="ghost" leadingIcon={Flag}>
        Report
      </Button>
    ),
  },
}

export const MissingFields = { args: { reviewerTitle: undefined, subject: undefined, text: undefined, dateLabel: 'Last week', dateTime: undefined } }

const longText =
  'We hired them for a six month engagement to rebuild our lifecycle program. The first month was strong: a clear audit, a prioritized roadmap and quick wins in onboarding email. Months two to four slipped because the strategist we met in the pitch moved to another account, and the new lead needed time to ramp. They owned it, added a senior strategist at no cost and we finished on time with a 22 percent lift in activation.'

export const LongContent = { args: { text: longText } }

export const Clamped = { args: { text: longText, clamp: true } }

export const Loading = { render: () => <ReviewCardSkeleton /> }

export const Grid = {
  parameters: { wide: true },
  render: () => (
    <ul className="grid grid-cols-1 gap-ds-md md:grid-cols-2">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard {...review} clamp />
        </li>
      ))}
      <li>
        <ReviewCardSkeleton announce={false} />
      </li>
    </ul>
  ),
}
