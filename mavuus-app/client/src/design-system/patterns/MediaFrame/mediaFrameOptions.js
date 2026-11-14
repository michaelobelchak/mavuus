// Aspect ratios a MediaFrame supports, as Tailwind aspect classes.
export const mediaRatios = {
  '3/2': 'aspect-3/2',
  '16/9': 'aspect-video',
  '4/3': 'aspect-4/3',
  '1/1': 'aspect-square',
  '4/5': 'aspect-4/5',
}
export const MEDIA_RATIOS = Object.keys(mediaRatios)
export const DEFAULT_MEDIA_RATIO = '3/2'
