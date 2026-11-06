import { Caption, Eyebrow, Heading, Text } from './Typography'

export default {
  title: 'Primitives/Typography',
  component: Heading,
  subcomponents: { Text, Eyebrow, Caption },
  tags: ['autodocs'],
}

export const Headings = {
  render: () => (
    <div className="flex flex-col gap-ds-md">
      <Heading level={1} size="display">
        Display: lead with community
      </Heading>
      <Heading level={1}>Heading 1</Heading>
      <Heading level={2}>Heading 2</Heading>
      <Heading level={3}>Heading 3</Heading>
      <Heading level={4}>Heading 4</Heading>
    </div>
  ),
}

export const SizeDecoupledFromLevel = {
  render: () => (
    <Heading level={1} size="h3">
      An h1 that looks like an h3
    </Heading>
  ),
}

export const BodyText = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-ds-sm">
      <Text size="lead">Lead: a community for marketing leaders who want honest answers.</Text>
      <Text>Body: members share what worked, what didn't, and who they'd hire again.</Text>
      <Text size="body-sm" tone="secondary">
        Body small, secondary tone.
      </Text>
      <Caption>Caption: posted 2 days ago</Caption>
    </div>
  ),
}

export const Tones = {
  render: () => (
    <div className="flex flex-col gap-ds-xxs">
      {['primary', 'secondary', 'muted', 'brand', 'link', 'success', 'warning', 'error', 'info'].map((tone) => (
        <Text key={tone} tone={tone}>
          {tone}
        </Text>
      ))}
    </div>
  ),
}

export const EyebrowAboveHeading = {
  render: () => (
    <div className="flex flex-col gap-ds-xs">
      <Eyebrow>For marketing leaders</Eyebrow>
      <Heading level={2}>Grow with people who have done it</Heading>
      <Eyebrow tone="brand">Brand tone (AA contrast)</Eyebrow>
    </div>
  ),
}
