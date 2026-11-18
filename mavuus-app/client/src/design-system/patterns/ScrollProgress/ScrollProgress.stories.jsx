import { ScrollProgress } from './ScrollProgress'

export default {
  title: 'Patterns/ScrollProgress',
  component: ScrollProgress,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

/** Scroll the canvas: the bar at the top fills as you go. */
export const Default = {
  render: () => (
    <div className="p-ds-lg">
      <ScrollProgress />
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i} className="mb-ds-md text-body text-text-secondary">
          Paragraph {i + 1}. Long articles show how far along the reader is.
        </p>
      ))}
    </div>
  ),
}
