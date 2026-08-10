import { useEffect, useState } from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'
import { api } from '../services/api'

const FALLBACK_CONTACT = {
  displayEmail: 'namoprintsofficial@gmail.com',
  displayPhone: '+91 90985 70277',
  whatsappNumber: '919098570277',
  address: 'Indore, Madhya Pradesh, India',
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [contactInfo, setContactInfo] = useState(FALLBACK_CONTACT)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .contactSettings()
      .then((payload) => {
        if (payload.contact) setContactInfo({ ...FALLBACK_CONTACT, ...payload.contact })
      })
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSent(false)
    try {
      const payload = await api.submitContact(form)
      setSent(true)
      setForm({ name: '', email: '', phone: '', message: '' })
      if (payload.message) {
        // optional: could show payload.message in success banner
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappNumber = String(contactInfo.whatsappNumber || FALLBACK_CONTACT.whatsappNumber).replace(/\D/g, '')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hi Namo Print, I would like to know more about your services.',
  )}`

  return (
    <div className="bg-white">
      <section className="border-b border-yellow-600/20">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <span className="inline-block text-sm tracking-[0.3em] uppercase text-yellow-700 font-semibold mb-4">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-black">
            Contact <span className="text-yellow-600">Namo Print</span>
          </h1>
          <p className="max-w-xl mx-auto text-gray-600 mt-4">
            Questions, custom orders, or bulk pricing — we're here to help.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">Contact Information</h2>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
                <Mail size={15} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-black font-semibold">Email</p>
                <p className="text-gray-600">{contactInfo.displayEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
                <Phone size={15} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-black font-semibold">Phone</p>
                <p className="text-gray-600">{contactInfo.displayPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-black font-semibold">Address</p>
                <p className="text-gray-600">{contactInfo.address}</p>
              </div>
            </div>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full hover:bg-yellow-600 transition"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-yellow-600/20 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-black mb-6">
            Send us a <span className="text-yellow-600">Message</span>
          </h2>

          {sent ? (
            <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 text-sm">
              Thank you! Your message has been sent.
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="you@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="+91 1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Message</label>
              <textarea
                name="message"
                required
                rows={4}
                minLength={10}
                value={form.message}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Tell us about your printing needs..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-yellow-500 font-semibold py-3 rounded-lg hover:bg-yellow-600 hover:text-black transition disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500 shadow-lg hover:bg-yellow-600 transition"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="black" className="w-7 h-7">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.87 9.87 0 0 0 4.62 1.17h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.64-1.03-5.13-2.9-7-1.87-1.87-4.36-2.84-7.01-2.84Zm0 18.07h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.3c0-4.52 3.68-8.2 8.24-8.2 2.2 0 4.27.86 5.83 2.42a8.14 8.14 0 0 1 2.42 5.79c0 4.52-3.69 8.15-8.25 8.15Zm4.52-6.14c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
        </svg>
      </a>
    </div>
  )
}
