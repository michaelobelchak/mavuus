import { SessionCard, SessionCardSkeleton } from '@/design-system/organisms'
import { CatalogList } from './academy/CatalogList'
import { sessionCardProps } from './academy/cardProps'

const categories = ['All', 'Growth', 'Brand', 'Content', 'Analytics', 'SEO', 'Paid Media', 'Branding', 'MarTech', 'Product Marketing']
const PARAMS = { type: 'on-demand' }

export default function OnDemandPage() {
  return (
    <CatalogList
      endpoint="/api/sessions"
      params={PARAMS}
      categories={categories}
      intro="Watch expert sessions anytime, anywhere."
      searchLabel="Search videos"
      searchPlaceholder="Search videos..."
      listLabel="On-demand videos"
      emptyTitle="No videos found"
      errorTitle="We couldn't load the videos"
      skeleton={SessionCardSkeleton}
      renderItem={(video) => <SessionCard {...sessionCardProps({ ...video, type: 'on-demand' })} />}
    />
  )
}
