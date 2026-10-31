const STROKE = { stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function ClockIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 18 17" fill="none" className={className} aria-hidden="true">
      <circle cx="8.9974" cy="8.50008" r="7.33333" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5.16675V9.16675L10.6667 10.8334" {...STROKE} />
    </svg>
  )
}

export function TagIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 16 17" fill="none" className={className} aria-hidden="true">
      <path
        d="M7.0437 1.36689C7.88032 1.33343 8.69286 1.65112 9.28492 2.24317L14.0674 7.02564C15.239 8.19721 15.239 10.0967 14.0674 11.2683L10.7676 14.5681C9.59599 15.7397 7.69649 15.7397 6.52492 14.5681L1.74245 9.78564C1.15039 9.19359 0.832702 8.38105 0.866167 7.54442L1.06687 2.52683C1.08771 2.00593 1.50521 1.58843 2.0261 1.56759L7.0437 1.36689Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse cx="5.42448" cy="5.53752" rx="0.666667" ry="0.666667" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function CalendarIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 16 17" fill="none" className={className} aria-hidden="true">
      <rect x="1.33594" y="2.5" width="13.3333" height="12.6667" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.66406 1.16675V2.50008M11.3359 1.16675V2.50008M1.33594 5.83325H14.6693M4.33594 9.16675H5.0026M7.66406 9.16675H8.33073M11 9.16675H11.6667M4.33594 11.8333H5.0026M7.66406 11.8333H8.33073M11 11.8333H11.6667"
        {...STROKE}
      />
    </svg>
  )
}

export function PinIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 16 17" fill="none" className={className} aria-hidden="true">
      <path
        d="M14.6693 7.83341C14.6693 10.5374 11.0735 13.9442 9.16357 15.563C8.48713 16.1364 7.51807 16.1364 6.84164 15.563C4.93167 13.9442 1.33594 10.5374 1.33594 7.83341C1.33594 4.15152 4.32071 1.16675 8.0026 1.16675C11.6845 1.16675 14.6693 4.15152 14.6693 7.83341Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse cx="8" cy="7.83325" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function ArrowBoxIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="23" rx="3.5" stroke="currentColor" />
      <path d="M13.5234 7.33325L18.0015 11.9999L13.5234 16.6666" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.8203 12.3545H6.99827" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function PlayIcon({ className = 'size-[21px]' }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.33594 3.77025C3.33594 2.99208 4.18563 2.51209 4.85212 2.91377L11.8704 7.14352C12.5155 7.5323 12.5155 8.4677 11.8704 8.85648L4.85212 13.0862C4.18563 13.4879 3.33594 13.0079 3.33594 12.2298V3.77025Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ChevronIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function ArrowIcon({ direction = 'right', className = 'size-5' }) {
  return (
    <svg viewBox="0 0 20 21" fill="none" className={`${className} ${direction === 'left' ? 'rotate-180' : ''}`} aria-hidden="true">
      <path d="M11.8984 4.66663L17.496 10.5L11.8984 16.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.2812 10.6931H3.5037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CircleArrowIcon({ direction = 'right', className = 'size-12' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={`${className} ${direction === 'left' ? 'rotate-180' : ''}`} aria-hidden="true">
      <circle cx="24" cy="24" r="23" stroke="#1C2232" strokeWidth="2" />
      <path d="M26.2812 17L32.9983 24L26.2812 31" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31.7344 24.0317L16.0013 24.0317" stroke="#050505" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function FacebookIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16V15H13V21.95C18.05 21.45 22 17.19 22 12Z"
        fill="#1C2232"
      />
    </svg>
  )
}

export function XIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.49233 12.576L2 3H7.93445L12.5594 8.91866L17.5004 3.02665H20.7688L14.1397 10.941L22 21H16.0833L11.0754 14.5993L5.72896 20.9823H2.44287L9.49233 12.576ZM16.9457 19.2257L5.63881 4.77427H7.07138L18.364 19.2257H16.9457Z"
        fill="#310B56"
      />
    </svg>
  )
}

export function LinkedInIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3H21V21H3V3ZM7.93 9.5H5V19H7.93V9.5ZM6.47 5.1C5.53 5.1 4.77 5.86 4.77 6.8C4.77 7.74 5.53 8.5 6.47 8.5C7.41 8.5 8.17 7.74 8.17 6.8C8.17 5.86 7.41 5.1 6.47 5.1ZM16.08 9.27C14.66 9.27 13.7 10.05 13.31 10.79H13.27V9.5H10.47V19H13.39V14.3C13.39 13.06 13.62 11.86 15.16 11.86C16.68 11.86 16.7 13.28 16.7 14.38V19H19.62V13.79C19.62 11.23 19.07 9.27 16.08 9.27Z"
        fill="#310B56"
      />
    </svg>
  )
}

export function LinkIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10.1898 12.906C10.5785 13.4262 11.0744 13.8566 11.6439 14.1681C12.2134 14.4795 12.8431 14.6647 13.4904 14.7111C14.1377 14.7575 14.7874 14.664 15.3954 14.437C16.0034 14.21 16.5555 13.8547 17.0143 13.3953L19.7296 10.6772C20.554 9.82282 21.0101 8.67851 20.9998 7.49073C20.9895 6.30296 20.5136 5.16675 19.6745 4.32684C18.8354 3.48692 17.7004 3.01049 16.5138 3.00017C15.3272 2.98985 14.184 3.44646 13.3305 4.27165L11.7737 5.82095M13.8102 11.094C13.4215 10.5738 12.9256 10.1434 12.3561 9.83195C11.7866 9.5205 11.1569 9.33529 10.5096 9.28889C9.86232 9.24248 9.21264 9.33597 8.60462 9.563C7.99661 9.79004 7.44449 10.1453 6.9857 10.6047L4.27037 13.3228C3.44601 14.1772 2.98986 15.3215 3.00017 16.5093C3.01048 17.697 3.48643 18.8332 4.3255 19.6732C5.16457 20.5131 6.29964 20.9895 7.48622 20.9998C8.6728 21.0101 9.81596 20.5535 10.6695 19.7283L12.2172 18.1791"
        stroke="#310B56"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20 6L9 17L4 12" stroke="#310B56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
