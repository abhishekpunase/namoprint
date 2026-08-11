import { Link } from 'react-router-dom'

export function TermsAndConditionsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using the Namo Print website and services,
      you agree to be bound by these Terms and Conditions. If you do not
      agree with any part of these terms, please do not use our website or
      services.`,
    },
    {
      title: '2. Orders and Payments',
      content: `All orders placed through our website are subject to
      availability and confirmation. Prices are listed in the applicable
      currency and may change without prior notice. Full or partial payment
      may be required before production begins, depending on the order type.`,
    },
    {
      title: '3. Custom Designs and Approval',
      content: `For customized products, you are responsible for providing
      accurate design files, text, and specifications. Once a design proof is
      approved by you, we are not liable for errors, spelling mistakes, or
      layout issues present in the approved design.`,
    },
    {
      title: '4. Production and Delivery',
      content: `Production timelines and delivery estimates provided are
      approximate and may vary due to order volume, customization complexity,
      or unforeseen circumstances. We are not responsible for delays caused
      by third-party couriers or shipping partners.`,
    },
    {
      title: '5. Returns, Refunds & Cancellations',
      content: `Because most of our products are custom-made, we generally do
      not accept returns or offer refunds once production has started, except
      in cases of defective products or errors on our part. Cancellations
      requested before production begins may be eligible for a full or
      partial refund.`,
    },
    {
      title: '6. Bulk Order Discounts',
      content: `Discounts offered on bulk orders, including any promotional
      offers such as 20% off, are subject to minimum quantity requirements
      and may be modified or withdrawn at our discretion without prior
      notice.`,
    },
    {
      title: '7. Intellectual Property',
      content: `All content on this website, including logos, graphics, and
      designs created by Namo Print, remain our intellectual property. You
      may not reproduce, distribute, or use our original designs without
      written permission.`,
    },
    {
      title: '8. User-Submitted Content',
      content: `By uploading designs, images, or text for printing, you
      confirm that you own the rights to that content or have obtained proper
      authorization to use it. We are not liable for any copyright
      infringement resulting from content you submit.`,
    },
    {
      title: '9. Limitation of Liability',
      content: `Namo Print shall not be liable for any indirect, incidental,
      or consequential damages arising from the use of our products or
      services, including but not limited to loss of business, profits, or
      data.`,
    },
    {
      title: '10. Account Responsibility',
      content: `If you create an account with us, you are responsible for
      maintaining the confidentiality of your login credentials and for all
      activities that occur under your account.`,
    },
    {
      title: '11. Changes to These Terms',
      content: `We reserve the right to update or modify these Terms and
      Conditions at any time. Continued use of our website after changes are
      posted constitutes your acceptance of the revised terms.`,
    },
    {
      title: '12. Contact Us',
      content: `If you have any questions regarding these Terms and
      Conditions, please reach out to us at support@namoprint.com or visit
      our Contact page.`,
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
            Terms & <span className="text-yellow-500">Conditions</span>
          </h1>
          <p className="text-white/60 text-sm">
            Last updated: July 14, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-gray-600 leading-relaxed mb-10">
          Please read these Terms and Conditions carefully before using the
          Namo Print website or placing an order. These terms govern your use
          of our services and form a binding agreement between you and Namo
          Print.
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

        <div className="mt-14 bg-yellow-50 border border-yellow-600/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-black mb-2">
            Need clarification on our terms?
          </h3>
          <p className="text-gray-600 mb-6">
            Reach out to our team and we'll be happy to help.
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