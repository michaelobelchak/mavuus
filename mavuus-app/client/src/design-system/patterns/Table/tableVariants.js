import { cva } from 'class-variance-authority'

export const TABLE_DENSITIES = ['comfortable', 'compact']
export const TABLE_ALIGNS = ['left', 'right', 'center']
export const DEFAULT_TABLE_DENSITY = 'comfortable'
export const DEFAULT_TABLE_ALIGN = 'left'

const density = {
  comfortable: 'px-ds-md py-ds-sm',
  compact: 'px-ds-sm py-ds-xs',
}

const align = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

// Shared by TableHead and TableCell so a column lines up in both.
export const tableCellVariants = cva('align-middle', {
  variants: {
    part: {
      head: 'text-caption font-semibold tracking-wide whitespace-nowrap text-text-muted uppercase',
      cell: 'text-body-sm text-text-primary',
    },
    density,
    align,
  },
  defaultVariants: { part: 'cell', density: DEFAULT_TABLE_DENSITY, align: DEFAULT_TABLE_ALIGN },
})
