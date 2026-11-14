import { cn } from '../../../lib/cn'
import { Reveal } from '../../../patterns'
import { Button } from '../../../primitives'

const CTA_BG = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d/6699cbb6206dc486ff34f56f_bg.svg'

/**
 * The closing call to action on public pages: a tinted, patterned band with a title, a line of
 * text and one button, revealed on scroll. `wide` is the larger services version (880px column
 * instead of 600px). `title`, `text`, `buttonLabel` and `buttonTo` replace the defaults.
 * `className` and other props go to the `<section>`.
 */
export function CTABand({
  title = 'Ready to experience the real power of your Marketing Network?',
  text = 'Connect with like-minded marketers across North America and learn about the solutions they use and the vendors who help them solve marketing projects.',
  buttonLabel = 'Get Started',
  buttonTo = '/register',
  wide = false,
  className,
  ref,
  ...props
}) {
  return (
    <section ref={ref} className={cn('px-ds-gutter max-md:px-ds-gutter-sm', className)} {...props}>
      <div className="mx-auto w-full max-w-7xl py-ds-section max-site-md:py-ds-section-md max-md:py-ds-section-sm">
        <Reveal
          className="flex flex-col items-center rounded-sheet bg-surface-sunken bg-cover bg-left-top px-ds-xxxl py-ds-band text-center max-md:px-ds-lg max-md:py-ds-xxl"
          style={{ backgroundImage: `url("${CTA_BG}")` }}
        >
          <div className={cn('flex w-full flex-col items-center gap-ds-md', wide ? 'max-w-220' : 'max-w-150')}>
            <h2 className="m-ds-none text-h2 font-normal text-balance text-text-primary max-site-md:text-h2-md max-md:text-h2-sm">
              {title}
            </h2>
            <p className="m-ds-none text-lead text-text-secondary max-md:text-lead-sm">{text}</p>
            <Button to={buttonTo} size="lg" className="mt-ds-md rounded-card leading-6 max-md:w-full">
              {buttonLabel}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
