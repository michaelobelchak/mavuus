// Renders trusted static HTML copied from the live site's Webflow rich text blocks.
export default function RichText({ html, className = '' }) {
  return (
    <div
      className={`[&_a]:text-brand-blue [&_a]:underline [&_p]:mb-4 [&_strong]:font-bold [&>:last-child]:mb-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
