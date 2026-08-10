export function BulkOrdersPage() {
  const whatsappNumber = '+919098570277' // apna number yaha daalein (country code ke saath, no +/spaces)
  const phoneNumber = '+918349313800' // apna call number yaha daalein

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hi Namo Print, I am interested in a bulk order. Can you share details on pricing and discounts?'
  )}`

  const perks = [
    {
      title: 'Flat 20% OFF',
      desc: 'On all bulk orders above minimum quantity — no hidden conditions.',
    },
    {
      title: 'Dedicated Account Manager',
      desc: 'One point of contact to handle your order from start to finish.',
    },
    {
      title: 'Priority Production',
      desc: 'Your bulk order gets fast-tracked in our production queue.',
    },
    {
      title: 'Custom Branding',
      desc: 'Logos, packaging, and design customization included at scale.',
    },
  ]

  const steps = [
    ['1', 'Share Your Requirement', 'Tell us the product, quantity, and design details.'],
    ['2', 'Get a Custom Quote', 'We calculate your bulk pricing with the 20% discount applied.'],
    ['3', 'Approve & Confirm', 'Approve the design proof and confirm your order.'],
    ['4', 'Fast Production & Delivery', 'We print, pack, and deliver right to your doorstep.'],
  ]

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-yellow-600/20 bg-black">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center relative z-10">
          <span className="inline-block text-sm tracking-[0.3em] uppercase text-yellow-500 font-semibold mb-4">
            Bulk Orders
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Get <span className="text-yellow-500">20% OFF</span> on Bulk
            Orders
          </h1>
          <p className="max-w-2xl mx-auto text-white/70 text-lg leading-relaxed mb-8">
            Printing in bulk for your business, event, or brand? Namo Print
            offers premium quality, fast turnaround, and unbeatable pricing
            for large volume orders.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
    <a
    href={whatsappLink}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 bg-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:bg-yellow-400 transition"
  >
    WhatsApp Us
  </a>


   <a
    href={`tel:${phoneNumber}`}
    className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-yellow-500 transition"
  >
    Call Now
  </a>
</div>
        </div>
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />
      </section>

      {/* Discount Banner */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-yellow-500 rounded-2xl shadow-xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-black font-extrabold text-2xl">
              Order in Bulk. Save 20% Instantly.
            </p>
            <p className="text-black/70 text-sm">
              Applicable on minimum order quantities across all product
              categories.
            </p>
          </div>
          
           <a
  href={whatsappLink}
  target="_blank"
  rel="noopener noreferrer"
  className="bg-black text-yellow-500 font-semibold px-6 py-3 rounded-full hover:bg-gray-900 transition whitespace-nowrap"
>
  Claim Your Discount
</a>
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-black text-center mb-10">
          Why Order <span className="text-yellow-600">In Bulk</span> With Us
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {perks.map((perk) => (
            <div
              key={perk.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-yellow-600/10 hover:shadow-lg hover:border-yellow-600/40 transition"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <span className="w-3 h-3 rounded-full bg-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">
                {perk.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {perk.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-white to-yellow-50 border-y border-yellow-600/20">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-black text-center mb-10">
            How It <span className="text-yellow-600">Works</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map(([num, title, desc]) => (
              <div key={num} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-black flex items-center justify-center mb-4">
                  <span className="text-yellow-500 font-extrabold text-lg">
                    {num}
                  </span>
                </div>
                <h3 className="text-black font-bold mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-3">
          Planning a large order? Let's talk.
        </h2>
        <p className="text-gray-600 mb-6">
          Reach out now and lock in your 20% bulk discount.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-yellow-500 font-semibold px-8 py-3 rounded-full hover:bg-yellow-600 hover:text-black transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.87 9.87 0 0 0 4.62 1.17h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.64-1.03-5.13-2.9-7-1.87-1.87-4.36-2.84-7.01-2.84Zm0 18.07h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.3c0-4.52 3.68-8.2 8.24-8.2 2.2 0 4.27.86 5.83 2.42a8.14 8.14 0 0 1 2.42 5.79c0 4.52-3.69 8.15-8.25 8.15Zm4.52-6.14c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
            </svg>
            WhatsApp Us
          </a>
          <a
            href={`tel:${phoneNumber}`}
            className="inline-flex items-center gap-2 border-2 border-black text-black font-semibold px-8 py-3 rounded-full hover:bg-black hover:text-yellow-500 transition" >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4.5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.01l-2.2 2.21Z" />
            </svg>
            Call Now
          </a>
        </div>
      </section>
    </div>
  )
}