import { cva } from 'class-variance-authority'

const card = cva('bg-[#F26D92]')

export function Swatch() {
  return <div className={card()} style={{ '--x': '1px', color: 'rgb(0, 0, 0)' }} />
}
