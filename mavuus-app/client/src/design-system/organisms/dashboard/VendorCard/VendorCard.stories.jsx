import { VendorCard, VendorCardSkeleton } from './VendorCard'

const vendors = [
  {
    id: 1,
    name: 'Northwind Growth',
    description: 'ABM and paid media agency for B2B SaaS teams between Series A and C. HubSpot and Salesforce certified.',
    rating: 4.8,
    reviewCount: 32,
    categories: ['ABM', 'Paid Media', 'HubSpot', 'Analytics'],
    location: 'Austin, TX',
  },
  {
    id: 2,
    name: 'Lumen Creative',
    description: 'Brand strategy, naming and identity systems for companies that have outgrown their first logo.',
    rating: 4.6,
    reviewCount: 18,
    categories: ['Brand', 'Design'],
    location: 'Brooklyn, NY',
  },
  {
    id: 3,
    name: 'Signal Path SEO',
    description: 'Technical SEO audits and content programs.',
    rating: 3.9,
    reviewCount: 1,
    categories: ['SEO'],
    location: 'Remote',
  },
  {
    id: 4,
    name: 'Brightpath Media',
    description: 'Podcast production and executive thought leadership.',
    categories: ['Content', 'Podcasts', 'PR'],
    location: 'Toronto, Canada',
  },
]

export default {
  title: 'Organisms/Dashboard/VendorCard',
  component: VendorCard,
  tags: ['autodocs'],
  decorators: [(Story, { parameters }) => <div className={parameters.wide ? 'w-6xl max-w-full' : 'w-sm max-w-full'}><Story /></div>],
  args: { ...vendors[0], to: '/dashboard/vendors/1' },
}

export const Default = {}

export const NoReviews = { args: { ...vendors[3], to: '/dashboard/vendors/4' } }

export const MissingFields = { args: { name: 'Contoso Labs', description: undefined, rating: undefined, categories: [], location: undefined } }

export const LongContent = {
  args: {
    name: 'The Integrated Marketing and Communications Collective International',
    description:
      'Full service partner for enterprise marketing teams: brand, content, paid media, analyst relations, events, field marketing, customer advocacy and marketing operations, with offices in eleven countries and a bench of 300 specialists who can start within a week.',
    categories: ['Brand', 'Content', 'Paid Media', 'Events', 'Analyst Relations', 'Marketing Ops'],
  },
}

export const Loading = { render: () => <VendorCardSkeleton /> }

export const Grid = {
  parameters: { wide: true },
  render: () => (
    <ul className="grid grid-cols-1 gap-ds-md md:grid-cols-2 lg:grid-cols-3">
      {vendors.map((vendor) => (
        <li key={vendor.id}>
          <VendorCard {...vendor} to={`/dashboard/vendors/${vendor.id}`} />
        </li>
      ))}
      <li>
        <VendorCardSkeleton announce={false} />
      </li>
    </ul>
  ),
}
