import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import LiveContainer from '../../components/live/LiveContainer'
import CTABand from '../../components/live/CTABand'
import SecondaryHero from '../../components/live/info/SecondaryHero'

const CDN = 'https://cdn.prod.website-files.com/6689664d9906e5efe6bbc54d'
const EMPTY = { firstName: '', lastName: '', email: '', phone: '', message: '' }
const FIELDS = [
  { name: 'firstName', id: 'First-Name', label: 'First Name', type: 'text', required: true, autoComplete: 'given-name' },
  { name: 'lastName', id: 'Last-Name', label: 'Last Name', type: 'text', autoComplete: 'family-name' },
  { name: 'email', id: 'Email-Address', label: 'Email Address', type: 'email', required: true, autoComplete: 'email' },
  { name: 'phone', id: 'Phone-Number', label: 'Phone Number', type: 'tel', autoComplete: 'tel' },
]
const FIELD = 'w-full rounded-[10px] border border-[#c7cfd9] bg-white px-3 py-2 text-sm leading-5 text-[#333] outline-none focus:border-brand-pink'
const LABEL = 'mb-1 block text-xs leading-[18px] font-bold text-dark-blue'

function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [status, setStatus] = useState('idle')

  const update = (e) => setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
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
      <div className="mb-[15px] rounded-2xl bg-[#cef5ca] p-5 text-center" role="status">
        <div>Thank you! Your submission has been received!</div>
      </div>
    )
  }

  return (
    <div className="mb-[15px]">
      <form onSubmit={submit} className="grid grid-cols-2 gap-x-[14px] gap-y-4 max-[479px]:flex max-[479px]:flex-col">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.id} className={LABEL}>
              <strong>{field.label}</strong>
            </label>
            <input
              id={field.id}
              name={field.name}
              type={field.type}
              maxLength={256}
              required={field.required}
              autoComplete={field.autoComplete}
              value={values[field.name]}
              onChange={update}
              className={`${FIELD} mb-2.5 h-14`}
            />
          </div>
        ))}
        <div className="col-span-2">
          <label htmlFor="Message" className={LABEL}>
            <strong>Write a message</strong>
          </label>
          <textarea
            id="Message"
            name="message"
            maxLength={5000}
            required
            placeholder="Example Text"
            value={values.message}
            onChange={update}
            className={`${FIELD} mb-2.5 block min-h-40 placeholder:text-[#999]`}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="flex items-center justify-center gap-2.5 rounded-2xl bg-brand-blue px-8 py-4 text-center text-base leading-6 font-semibold text-white shadow-[0_25px_20px_-20px_#1f648d] transition-all duration-300 hover:bg-brand-blue-hover disabled:cursor-wait"
        >
          {status === 'sending' ? 'Please wait...' : 'Send Request'}
        </button>
      </form>
      {status === 'error' && (
        <div className="mt-2.5 bg-[#ffdede] p-2.5" role="alert">
          <div>Oops! Something went wrong while submitting the form.</div>
        </div>
      )}
    </div>
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
      <SecondaryHero title="Get in Touch">
        Whether you have a question, need support, or want to explore partnership opportunities, we’d love to connect.
        Learn how Mavuus helps marketing leaders to advance their careers and achieve their goals by learning from
        experts, networking with peers, and building meaningful connections.
        <br />
      </SecondaryHero>
      <section className="text-dark-blue">
        <LiveContainer innerClassName="py-24">
          <div className="py-20 max-[991px]:py-16 max-md:py-12">
            <div className="grid grid-cols-[0.75fr_1fr] gap-16 max-[991px]:flex max-[991px]:flex-col">
              <img
                src={`${CDN}/669f0e0e2a657f4c5e1c90d0_img-contacts.png`}
                srcSet={`${CDN}/669f0e0e2a657f4c5e1c90d0_img-contacts-p-500.png 500w, ${CDN}/669f0e0e2a657f4c5e1c90d0_img-contacts.png 555w`}
                sizes="(max-width: 479px) 92vw, (max-width: 767px) 95vw, (max-width: 991px) 92vw, 37vw"
                alt="Marketers working together on laptops"
                className="w-full"
              />
              <div className="flex flex-col gap-8">
                <div>
                  <p className="inline text-[clamp(16px,2vw,20px)] leading-[26px] font-medium tracking-[1px] text-brand-pink uppercase">
                    SEND US A MESSAGE
                  </p>
                  <div className="p-2" />
                  <h2 className="text-2xl leading-[33px] font-medium text-dark-blue">
                    Please provide brief information about yourself and we’ll get back to you shortly.
                  </h2>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </LiveContainer>
      </section>
      <CTABand text="Connect with like-minded leaders across North America, share insights, and discover resources to elevate your career." />
    </>
  )
}
