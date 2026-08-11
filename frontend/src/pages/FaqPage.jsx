import { useState } from 'react'
import { Link } from 'react-router-dom'

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'What products does Namo Print offer?',
      answer: `We offer a wide range of custom-printed products including
      business cards, apparel, mugs, packaging, banners, and more. Every
      product can be personalized with your own design, text, or logo.`,
    },
    {
      question: 'How do I place a custom order?',
      answer: `Simply choose a product from our catalog, use our design
      tool to upload your artwork or create a design, add it to your cart,
      and complete checkout. For bulk or highly custom requests, you can
      also contact us directly via WhatsApp.`,
    },
    {
      question: 'Do you offer bulk order discounts?',
      answer: `Yes! We offer a flat 20% discount on bulk orders above the
      minimum quantity. Visit our Bulk Orders page or contact us on
      WhatsApp to get a custom quote.`,
    },
    {
      question: 'How long does production and delivery take?',
      answer: `Orders are typically processed within 1-2 business days
      after design approval, and standard delivery takes 3-7 business
      days depending on your location. Bulk orders may take slightly
      longer.`,
    },
    {
      question: 'Can I track my order?',
      answer: `Yes, once your order ships you'll receive a tracking number
      via email, SMS, or WhatsApp so you can monitor your delivery status
      in real time.`,
    },
    {
      question: 'What if my product arrives damaged or cracked?',
      answer: `If your product arrives damaged, you must record an
      unboxing video in front of the delivery person while opening the
      box, and send it to us on WhatsApp within 24 hours. This video is
      mandatory to be eligible for a refund or replacement — please see
      our Refund Policy for full details.`,
    },
    {
      question: 'Can I cancel or modify my order after placing it?',
      answer: `Orders can be cancelled or modified only before production
      begins. Once production has started, changes or cancellations may
      not be possible since most of our products are custom-made.`,
    },
    {
      question: 'What payment methods do you accept?',
      answer: `We accept all major payment methods including credit and
      debit cards, UPI, net banking, and popular digital wallets, all
      processed securely at checkout.`,
    },
    {
      question: 'Do you ship across India?',
      answer: `Yes, we currently ship to most locations across India.
      Delivery times may vary slightly for remote or rural areas. Please
      check our Shipping Policy for more details.`,
    },
    {
      question: 'How can I contact customer support?',
      answer: `You can reach us anytime via WhatsApp, phone, or by filling
      out the form on our Contact page. We're happy to help with orders,
      designs, or any other questions.`,
    },
  ]

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-yellow-600/20 bg-black">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block text-sm tracking-[0.3em] uppercase text-yellow-500 font-semibold mb-4">
            Support
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Frequently Asked <span className="text-yellow-500">Questions</span>
          </h1>
          <p className="max-w-xl mx-auto text-white/60">
            Find quick answers to the most common questions about our
            products, orders, and delivery.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className={`rounded-xl border transition ${
                  isOpen
                    ? 'border-yellow-500 shadow-md'
                    : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                >
                  <span className="text-black font-semibold">
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                      isOpen
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-yellow-50 border border-yellow-600/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-black mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our team is just a
            message away.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-black text-yellow-500 font-semibold px-8 py-3 rounded-full hover:bg-yellow-600 hover:text-black transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}