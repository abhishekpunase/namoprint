export function RefundPolicyPage() {
  const whatsappNumber = '+919098570277' // add your WhatsApp number here (with country code, no +/spaces)
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hi Namo Print, I received a damaged/cracked product and want to raise a refund request. I have the unboxing video ready.'
  )}`

  const videoSteps = [
    {
      title: 'Record in Front of the Delivery Person',
      desc: `As soon as your order is delivered, before accepting it, start
      recording a continuous video of the package in front of the delivery
      person. The video should not have any pauses or cuts.`,
    },
    {
      title: 'Record While Opening the Box',
      desc: `From the sealed package to opening the box, the entire process
      must be recorded on camera — no editing or cutting is allowed at any
      point.`,
    },
    {
      title: 'Clearly Show the Product',
      desc: `If the product is cracked or damaged, it must be clearly shown
      in the video — zoom in on the damaged area and capture it from
      multiple angles.`,
    },
    {
      title: 'Send the Video on WhatsApp',
      desc: `This unboxing video must be sent to us on WhatsApp immediately,
      within 24 hours of delivery, along with your order ID.`,
    },
  ]

  const conditions = [
    'The video must be recorded in front of the delivery person, without any breaks — videos recorded afterward will not be accepted.',
    'The package seal, label, and order ID must be clearly visible in the video.',
    'The entire process, from opening the box to removing the product, must be included in the video.',
    'The damaged area must be shown in close-up in the video.',
    'The video must not be edited, cut, or stitched together from multiple clips — only a single, unedited video will be accepted.',
    'The video must be sent to us on WhatsApp within 24 hours of delivery.',
  ]

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-yellow-600/20 bg-black">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block text-sm tracking-[0.3em] uppercase text-yellow-500 font-semibold mb-4">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Refund <span className="text-yellow-500">Policy</span>
          </h1>
          <p className="text-white/60 text-sm">
            Last updated: July 14, 2026
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-gray-600 leading-relaxed mb-10">
          At Namo Print, we strive to deliver high-quality, damage-free
          products to every customer. However, if your product arrives
          cracked or damaged during transit, you must follow the process
          outlined below to be eligible for a refund or replacement.
        </p>

        {/* Important warning box */}
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-black text-yellow-500 flex items-center justify-center text-sm font-bold shrink-0">
              !
            </span>
            Mandatory Requirement — Unboxing Video
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If your product arrives cracked or damaged, you must record a
            video of the product — showing it in front of the delivery
            person and while opening the box. This video must be sent to us
            on WhatsApp, and{' '}
            <span className="font-semibold text-black">
              only then will your refund be processed.
            </span>{' '}
            Without this video, no damage/crack claim will be accepted under
            any circumstances.
          </p>
        </div>

        {/* Video steps */}
        <h2 className="text-2xl font-bold text-black mb-6">
          How to Record the Unboxing Video
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          {videoSteps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-xl p-6 border border-yellow-600/10 shadow-sm hover:shadow-lg hover:border-yellow-600/40 transition"
            >
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mb-4">
                <span className="text-yellow-500 font-extrabold">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Conditions */}
        <h2 className="text-2xl font-bold text-black mb-6">
          Refund Conditions
        </h2>
        <ul className="space-y-4 mb-14">
          {conditions.map((cond) => (
            <li key={cond} className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-yellow-600 shrink-0" />
              <span className="text-gray-600 leading-relaxed">{cond}</span>
            </li>
          ))}
        </ul>

        {/* Non-eligible */}
        <div className="border-l-4 border-yellow-500 pl-6 mb-14">
          <h2 className="text-xl font-bold text-black mb-2">
            When a Refund Will Not Be Given
          </h2>
          <p className="text-gray-600 leading-relaxed">
            If no unboxing video was recorded in front of the delivery
            person, or the video is incomplete or edited, or the damage claim
            is reported after 24 hours, a refund or replacement will not be
            possible in such cases. Additionally, incorrect design or
            customization that the customer has already approved is also not
            eligible for a refund.
          </p>
        </div>

        {/* Refund process after video */}
        <div className="border-l-4 border-yellow-500 pl-6 mb-14">
          <h2 className="text-xl font-bold text-black mb-2">
            What Happens After You Send the Video
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Once the video is verified, our team will confirm your refund or
            replacement within 2-3 business days. Once approved, the refund
            amount will be credited to your original payment method within
            5-7 business days.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-black rounded-2xl p-8 md:p-10 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            Received a Damaged Product?
          </h3>
          <p className="text-white/70 mb-6">
            Send your unboxing video on WhatsApp to start the refund process.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:bg-yellow-400 transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.87 9.87 0 0 0 4.62 1.17h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.64-1.03-5.13-2.9-7-1.87-1.87-4.36-2.84-7.01-2.84Zm0 18.07h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.3c0-4.52 3.68-8.2 8.24-8.2 2.2 0 4.27.86 5.83 2.42a8.14 8.14 0 0 1 2.42 5.79c0 4.52-3.69 8.15-8.25 8.15Zm4.52-6.14c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
            </svg>
            Send Video on WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}