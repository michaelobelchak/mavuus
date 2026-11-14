import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

/**
 * Remounts its children when the route's :id changes (react-router reuses the element for
 * /members/1 to /members/2), so a detail page's state always belongs to one item.
 */
export function KeyedById({ children }) {
  const { id } = useParams()
  return <Fragment key={id}>{children}</Fragment>
}
