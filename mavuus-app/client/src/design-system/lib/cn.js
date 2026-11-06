import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { themeScales } from './twMergeConfig'

const twMerge = extendTailwindMerge({ extend: { theme: themeScales } })

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
