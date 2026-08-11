import { Link } from 'react-router-dom'

export function ShippingPolicyPage() {
  const sections = [
    {
      title: '1. Order Processing Time',
      content: `All orders are processed within 1-2 business days after
      design approval and payment confirmation. Custom and bulk orders may
      require additional processing time depending on order complexity and
      quantity.`,
    },
    {
      title: '2. Shipping Timeframes',
      content: `Standard delivery typically takes 3-7 business days
      depending on your location. Remote areas may experience slightly
      longer delivery times. Estimated delivery dates are provided at
      checkout but are not guaranteed due to factors beyond our control.`,
    },
    {
      title: '3. Shipping Charges',
      content: `Shipping charges are calculated based on your delivery
      location, order weight, and package size, and will be displayed at
      checkout before you confirm your order. Free shipping may be offered
      on select products or orders above a certain value.`,
    },
    {
      title: '4. Order Tracking',
      content: `Once your order is shipped, you will receive a tracking
      number via email, SMS, or WhatsApp. You can use this number to track
      your shipment's status directly through the courier partner's
      website.`,
    },
    {
      title: '5. Delivery Attempts',
      content: `Our courier partners typically make up to 2-3 delivery
      attempts. If delivery is unsuccessful after multiple attempts, the
      package may be returned to us, and additional shipping charges may
      apply for re-delivery.`,
    },
    {
      title: '6. Delayed or Lost Shipments',
      content: `While we work with trusted courier partners, delays can
      occasionally occur due to weather, logistics issues, or other
      unforeseen circumstances. If your order is significantly delayed or
      appears lost in transit, please contact our support team for
      assistance.`,
    },
    {
      title: '7. Damaged or Incorrect Shipments',
      content: `If your product arrives cracked, damaged, or incorrect,
      please refer to our Refund Policy. An unboxing video recorded in
      front of the delivery person is mandatory to be eligible for a refund
      or replacement.`,
    },
    {
      title: '8. Address Accuracy',
      content: `Please ensure your shipping address, contact number, and
      pin code are accurate at the time of order. We are not responsible
      for delays or failed deliveries caused by incorrect or incomplete
      address details provided by the customer.`,
    },
    {
      title: '9. International Shipping',
      content: `Currently, we primarily ship within India. If international
      shipping becomes available, additional customs duties, taxes, or
      import charges may apply and are the responsibility of the
      customer.`,
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this Shipping Policy from time to time to
      reflect changes in our processes or courier partnerships. Any updates
      will be posted on this page with a revised date.`,
    },
    {
      title: '11. Contact Us',
      content: `For any questions regarding shipping or delivery, please
      reach out to us at support@namoprint.com or visit our Contact page.`,
    },
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
            Shipping <span className="text-yellow-500">Policy</span>
          </h1>
          <p className="text-white/60 text-sm">
            Last updated: July 14, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-gray-600 leading-relaxed mb-10">
          At Namo Print, we aim to get your custom-printed products to you
          quickly and safely. This Shipping Policy explains how we process,
          ship, and deliver your orders.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div
              key={section.title}
              className="border-l-4 border-yellow-500 pl-6"
            >
              <h2 className="text-xl font-bold text-black mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Quick info strip */}
        <div className="grid sm:grid-cols-3 gap-6 mt-14">
          {[
            ['1-2 Days', 'Order Processing'],
            ['3-7 Days', 'Standard Delivery'],
            ['Live Tracking', 'On Every Order'],
          ].map(([num, label]) => (
            <div
              key={label}
              className="bg-yellow-50 border border-yellow-600/20 rounded-xl p-6 text-center"
            >
              <p className="text-2xl font-extrabold text-yellow-600 mb-1">
                {num}
              </p>
              <p className="text-gray-600 text-sm">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-black rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Have a question about your shipment?
          </h3>
          <p className="text-white/70 mb-6">
            Our support team is happy to help track or resolve any shipping
            issue.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-yellow-500 text-black font-semibold px-8 py-3 rounded-full hover:bg-yellow-400 transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}