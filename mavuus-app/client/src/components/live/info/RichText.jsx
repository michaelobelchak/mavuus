// Renders trusted static HTML copied from the live site's Webflow rich text blocks.
export default function RichText({ html, className = '' }) {
  return (
    <div
      className={`max-w-[70ch] text-live-grey [&_a]:font-medium [&_a]:text-brand-blue [&_a]:underline [&_a]:underline-offset-[3px] [&_a:hover]:text-brand-pink [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-dark-blue [&>:last-child]:mb-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
