import { VendorCard, VendorCardSkeleton } from '@/design-system/organisms'
import { CatalogList } from './shared/CatalogList'
import { VENDORS_PATH } from './shared/paths'

const vendorCategories = ['All', 'Content Marketing', 'Demand Gen', 'Branding', 'Analytics', 'PR', 'Video Production']

export default function VendorsPage() {
  return (
    <CatalogList
      endpoint="/api/vendors"
      categories={vendorCategories}
      intro="Find vetted vendors recommended by the community."
      searchLabel="Search vendors"
      searchPlaceholder="Search vendors..."
      listLabel="Vendors"
      emptyTitle="No vendors found"
      errorTitle="We couldn't load the vendors"
      skeleton={VendorCardSkeleton}
      renderItem={(vendor) => (
        <VendorCard
          name={vendor.company_name}
          description={vendor.description}
          rating={vendor.rating}
          reviewCount={vendor.reviews_count}
          categories={vendor.categories || []}
          location={vendor.location}
          to={`${VENDORS_PATH}/${vendor.id}`}
        />
      )}
    />
  )
}
