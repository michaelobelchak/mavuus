import { useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import LiveButton from '../../components/live/LiveButton'
import CTABand from '../../components/live/CTABand'
import PageHero from '../../components/live/info/PageHero'
import Section from '../../components/live/ui/Section'
import Reveal from '../../components/live/ui/Reveal'
import { cardClass } from '../../components/live/ui/cardStyles'
import { Eyebrow, H_CARD } from '../../components/live/ui/Typography'

const PHOTOS = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d/669f0e0e2a657f4c5e1c90d0_img-contacts.png'

// The live image is one PNG holding two photos side by side. Each frame crops one of them.
const FRAMES = [
  { alt: 'A smiling marketer working on a laptop outdoors', crop: 'left-[-1.25%] top-[-0.73%]', offset: '' },
  { alt: 'Two marketers working together on a laptop', crop: 'left-[-114.94%] top-[-11.62%]', offset: 'mt-12 max-[767px]:mt-8' },
]

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', message: '' }
const FIELDS = [
  { name: 'firstName', id: 'First-Name', label: 'First Name', type: 'text', required: true, autoComplete: 'given-name' },
  { name: 'lastName', id: 'Last-Name', label: 'Last Name', type: 'text', autoComplete: 'family-name' },
  { name: 'email', id: 'Email-Address', label: 'Email Address', type: 'email', required: true, autoComplete: 'email' },
  { name: 'phone', id: 'Phone-Number', label: 'Phone Number', type: 'tel', autoComplete: 'tel' },
]
const MESSAGE = { name: 'message', id: 'Message', label: 'Write a message', required: true }
const ORDER = ['firstName', 'email', 'message']

const FIELD = 'w-full rounded-xl border bg-white px-4 text-base leading-6 text-dark-blue transition-colors placeholder:text-live-muted focus:border-brand-blue'
const LABEL = 'mb-2 block text-sm leading-5 font-semibold text-dark-blue'

function validate(values) {
  const errors = {}
  if (!values.firstName.trim()) errors.firstName = 'Enter your first name.'
  const email = values.email.trim()
  if (!email) errors.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address, like name@company.com.'
  if (!values.message.trim()) errors.message = 'Write a short message so we know how to help.'
  return errors
}

function Label({ field }) {
  return (
    <label htmlFor={field.id} className={LABEL}>
      {field.label}
      {field.required && (
        <>
          <span aria-hidden="true" className="ml-0.5 text-brand-pink">*</span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </label>
  )
}

function fieldProps(field, errors) {
  const error = errors[field.name]
  return {
    id: field.id,
    name: field.name,
    'aria-required': field.required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${field.id}-error` : undefined,
  }
}

const borderFor = (field, errors) => (errors[field.name] ? 'border-red-700' : 'border-live-line')

function FieldError({ field, errors }) {
  if (!errors[field.name]) return null
  return (
    <p id={`${field.id}-error`} className="m-0 mt-2 text-sm leading-5 font-medium text-red-700">
      {errors[field.name]}
    </p>
  )
}

function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const formRef = useRef(null)

  const update = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const found = validate(values)
    setErrors(found)
    const first = ORDER.find((name) => found[name])
    if (first) {
      formRef.current?.elements.namedItem(first)?.focus()
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${values.firstName} ${values.lastName}`.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: values.message.trim(),
        }),
      })
      setStatus(res.ok ? 'done' : 'error')
      if (res.ok) setValues(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl bg-live-blue-light p-6 text-center text-base leading-6 font-medium text-dark-blue" role="status">
        Thank you! Your submission has been received!
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid grid-cols-2 gap-x-4 gap-y-5 max-[479px]:grid-cols-1">
      {FIELDS.map((field) => (
        <div key={field.name}>
          <Label field={field} />
          <input
            {...fieldProps(field, errors)}
            type={field.type}
            maxLength={256}
            autoComplete={field.autoComplete}
            value={values[field.name]}
            onChange={update}
            className={`${FIELD} ${borderFor(field, errors)} h-12`}
          />
          <FieldError field={field} errors={errors} />
        </div>
      ))}
      <div className="col-span-full">
        <Label field={MESSAGE} />
        <textarea
          {...fieldProps(MESSAGE, errors)}
          maxLength={5000}
          placeholder="How can we help?"
          value={values.message}
          onChange={update}
          className={`${FIELD} ${borderFor(MESSAGE, errors)} block min-h-40 py-3`}
        />
        <FieldError field={MESSAGE} errors={errors} />
      </div>
      <div className="col-span-full flex flex-col items-start gap-4">
        <LiveButton type="submit" variant="blue" disabled={status === 'sending'} className="mt-1 min-w-56">
          {status === 'sending' ? 'Please wait...' : 'Send Request'}
        </LiveButton>
        {status === 'error' && (
          <p className="m-0 w-full rounded-xl bg-red-50 p-4 text-base leading-6 text-red-800" role="alert">
            Oops! Something went wrong while submitting the form.
          </p>
        )}
      </div>
    </form>
  )
}

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact Us - Mavuus</title>
        <meta
          name="description"
          content="Contact us if you want to learn how Mavuus helps CMOs elevate their executive influence by sharing, learning and leading together."
        />
      </Helmet>
      <PageHero
        display
        title="Get in Touch"
        lead="Whether you have a question, need support, or want to explore partnership opportunities, we’d love to connect. Learn how Mavuus helps marketing leaders to advance their careers and achieve their goals by learning from experts, networking with peers, and building meaningful connections."
      />
      <Section>
        <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] items-center gap-16 max-[1199px]:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] max-[1199px]:gap-12 max-[991px]:grid-cols-1 max-[991px]:gap-12">
          <div className="grid grid-cols-2 items-start gap-6 max-[991px]:mx-auto max-[991px]:w-full max-[991px]:max-w-[560px] max-[767px]:gap-4">
            {FRAMES.map((frame, i) => (
              <Reveal key={frame.alt} variant="clip" index={i} className={`relative aspect-[241/413] overflow-hidden rounded-2xl ${frame.offset}`}>
                <img
                  src={PHOTOS}
                  alt={frame.alt}
                  loading="lazy"
                  decoding="async"
                  className={`absolute w-[216.2%] max-w-none ${frame.crop}`}
                />
              </Reveal>
            ))}
          </div>
          <Reveal className={cardClass({ variant: 'surface', className: 'flex flex-col gap-8 p-10 max-[767px]:p-6' })}>
            <div className="flex flex-col gap-3">
              <Eyebrow>Send us a message</Eyebrow>
              <h2 className={`m-0 ${H_CARD}`}>
                Please provide brief information about yourself and we’ll get back to you shortly.
              </h2>
            </div>
            <ContactForm />
          </Reveal>
        </div>
      </Section>
      <CTABand text="Connect with like-minded leaders across North America, share insights, and discover resources to elevate your career." />
    </>
  )
}
