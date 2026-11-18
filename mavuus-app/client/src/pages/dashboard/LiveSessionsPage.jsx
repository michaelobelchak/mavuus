import { SessionCard, SessionCardSkeleton } from '@/design-system/organisms'
import { CatalogList } from './shared/CatalogList'
import { sessionCardProps } from './academy/cardProps'

const categories = ['All', 'Content Strategy', 'ABM', 'AI & Tech', 'Growth']
const PARAMS = { type: 'live' }
const DATE_FORMAT = { weekday: 'short', month: 'short', day: 'numeric' }

export default function LiveSessionsPage() {
  return (
    <CatalogList
      endpoint="/api/sessions"
      params={PARAMS}
      categories={categories}
      intro="Join upcoming live sessions with industry leaders."
      searchLabel="Search sessions"
      searchPlaceholder="Search sessions..."
      listLabel="Live sessions"
      emptyTitle="No sessions found"
      errorTitle="We couldn't load the live sessions"
      skeleton={SessionCardSkeleton}
      renderItem={(session) => <SessionCard {...sessionCardProps({ ...session, type: 'live' }, { dateFormat: DATE_FORMAT })} />}
    />
  )
}
