import LiveContainer from '../LiveContainer'

const SPACING = {
  default: 'py-24 max-[991px]:py-[72px] max-[767px]:py-14',
  compact: 'py-16 max-[991px]:py-12 max-[767px]:py-10',
  none: '',
}

// Every public section uses this, so vertical rhythm is the same on every page: 96 / 72 / 56px.
export default function Section({ as = 'section', spacing = 'default', className = '', innerClassName = '', children, ...props }) {
  return (
    <LiveContainer as={as} className={className} innerClassName={`${SPACING[spacing]} ${innerClassName}`} {...props}>
      {children}
    </LiveContainer>
  )
}
