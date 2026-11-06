import { createContext } from 'react'

// Density and caption wiring from Table, read by its parts.
export const TableContext = createContext({ density: undefined, captionId: undefined, setHasCaption: () => {} })

// Which section a row is in, so only body rows get the hover tint.
export const TableSectionContext = createContext('body')
