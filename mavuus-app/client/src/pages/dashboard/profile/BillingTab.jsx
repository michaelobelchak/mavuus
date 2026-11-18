import { CheckList } from '@/design-system/patterns'
import { Badge, Button, Heading, Text } from '@/design-system/primitives'
import { DetailSection } from '../shared/DetailSection'

const PRO_BENEFITS = [
  'Unlimited live sessions and the full on-demand library',
  'Full community access, messaging and connections',
  'Marketplace listings and the job board',
]

/** The Billing tab: the current plan, what Pro includes, and Upgrade for free members. */
export function BillingTab({ tier }) {
  const pro = tier === 'pro'
  return (
    <DetailSection title="Current plan">
      <div className="flex flex-col gap-ds-sm rounded-control bg-surface-sunken p-ds-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-ds-xxs">
          <Heading level={3} size="h3">
            {pro ? 'Pro Access plan' : 'Free plan'}
          </Heading>
          <Text size="body-sm" tone="secondary">
            {pro ? '$15 a month, billed annually' : 'Basic access with limited features'}
          </Text>
        </div>
        <Badge tone={pro ? 'success' : 'neutral'} className="self-start sm:self-center">
          {pro ? 'Active' : 'Free'}
        </Badge>
      </div>
      {pro ? (
        <CheckList items={PRO_BENEFITS} size="sm" reveal={false} />
      ) : (
        <Button to="/membership" className="self-start">
          Upgrade to Pro
        </Button>
      )}
    </DetailSection>
  )
}
