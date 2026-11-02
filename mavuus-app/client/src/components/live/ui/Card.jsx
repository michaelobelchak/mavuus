import { cardClass } from './cardStyles'

export default function Card({ as: Tag = 'div', variant, rule, interactive, className, children, ...props }) {
  return (
    <Tag className={cardClass({ variant, rule, interactive, className })} {...props}>
      {children}
    </Tag>
  )
}
