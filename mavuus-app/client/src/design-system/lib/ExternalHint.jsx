// Screen reader note for links that open a new tab. Render it inside the link, after the label.
export function ExternalHint() {
  return (
    <>
      {' '}
      <span className="sr-only">(opens in a new tab)</span>
    </>
  )
}
