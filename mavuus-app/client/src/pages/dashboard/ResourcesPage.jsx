import { ResourceCard, ResourceCardSkeleton } from '@/design-system/organisms'
import { CatalogList } from './shared/CatalogList'
import { resourceCardProps } from './academy/cardProps'

const types = ['All', 'Guide', 'Template', 'Report', 'Playbook']

export default function ResourcesPage() {
  return (
    <CatalogList
      endpoint="/api/resources"
      categories={types}
      intro="Templates, guides, and reports curated for marketing leaders."
      searchLabel="Search resources"
      searchPlaceholder="Search resources..."
      listLabel="Community resources"
      emptyTitle="No resources found"
      errorTitle="We couldn't load the resources"
      skeleton={ResourceCardSkeleton}
      renderItem={(resource) => <ResourceCard {...resourceCardProps(resource)} />}
    />
  )
}
