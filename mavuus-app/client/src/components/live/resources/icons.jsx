// Brand marks for the share row (lucide-react has no brand icons).
export function FacebookIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16V15H13V21.95C18.05 21.45 22 17.19 22 12Z" />
    </svg>
  )
}

export function XIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.49233 12.576L2 3H7.93445L12.5594 8.91866L17.5004 3.02665H20.7688L14.1397 10.941L22 21H16.0833L11.0754 14.5993L5.72896 20.9823H2.44287L9.49233 12.576ZM16.9457 19.2257L5.63881 4.77427H7.07138L18.364 19.2257H16.9457Z"
      />
    </svg>
  )
}

export function LinkedInIcon({ className = 'size-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3H21V21H3V3ZM7.93 9.5H5V19H7.93V9.5ZM6.47 5.1C5.53 5.1 4.77 5.86 4.77 6.8C4.77 7.74 5.53 8.5 6.47 8.5C7.41 8.5 8.17 7.74 8.17 6.8C8.17 5.86 7.41 5.1 6.47 5.1ZM16.08 9.27C14.66 9.27 13.7 10.05 13.31 10.79H13.27V9.5H10.47V19H13.39V14.3C13.39 13.06 13.62 11.86 15.16 11.86C16.68 11.86 16.7 13.28 16.7 14.38V19H19.62V13.79C19.62 11.23 19.07 9.27 16.08 9.27Z"
      />
    </svg>
  )
}
