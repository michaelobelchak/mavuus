// Required marker for field and group labels: a visual asterisk hidden from screen readers and
// sr-only "(required)" text, so the accessible name ends in "(required)". Render it after the label text.
export function RequiredMark() {
  return (
    <>
      {' '}
      <span aria-hidden="true" className="text-status-error">
        *
      </span>
      <span className="sr-only">(required)</span>
    </>
  )
}
