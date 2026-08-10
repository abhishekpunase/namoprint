export function PrivacyPolicyPage() {
  const sections = [
    {
      title: '1. Introduction',
      content: `Namo Print ("we", "us", "our") respects your privacy and is
      committed to protecting the personal information you share with us.
      This Privacy Policy explains how we collect, use, store, and protect
      your information when you visit our website or place an order with us.`,
    },
    {
      title: '2. Information We Collect',
      content: `We may collect personal details such as your name, email
      address, phone number, shipping address, and payment information when
      you create an account, place an order, or contact us. We also collect
      non-personal information such as browser type, device information, and
      usage data to improve our services.`,
    },
    {
      title: '3. How We Use Your Information',
      content: `We use the information we collect to process orders, provide
      customer support, personalize your shopping experience, send order
      updates and promotional offers (only if you opt in), and improve our
      website and services.`,
    },
    {
      title: '4. Sharing Your Information',
      content: `We do not sell or rent your personal information to third
      parties. We may share your information with trusted service providers
      such as payment gateways, shipping partners, and analytics providers,
      solely for the purpose of fulfilling your order and improving our
      services.`,
    },
    {
      title: '5. Cookies',
      content: `Our website uses cookies to enhance your browsing experience,
      remember your preferences, and analyze site traffic. You can choose to
      disable cookies through your browser settings, though this may affect
      certain features of the website.`,
    },
    {
      title: '6. Data Security',
      content: `We implement industry-standard security measures to protect
      your personal information from unauthorized access, alteration,
      disclosure, or destruction. However, no method of transmission over the
      internet is 100% secure, and we cannot guarantee absolute security.`,
    },
    {
      title: '7. Your Rights',
      content: `You have the right to access, update, or delete your personal
      information at any time. You may also opt out of receiving promotional
      communications from us by using the unsubscribe link or contacting us
      directly.`,
    },
    {
      title: '8. Third-Party Links',
      content: `Our website may contain links to third-party websites. We are
      not responsible for the privacy practices or content of those websites.
      We encourage you to review the privacy policies of any third-party
      sites you visit.`,
    },
    {
      title: '9. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. Any
      changes will be posted on this page with an updated revision date. We
      encourage you to review this policy periodically.`,
    },
    {
      title: '10. Contact Us',
      content: `If you have any questions or concerns about this Privacy
      Policy or how your data is handled, please reach out to us at
      support@namoprint.com or visit our Contact page.`,
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
            Privacy <span className="text-yellow-500">Policy</span>
          </h1>
          <p className="text-white/60 text-sm">
            Last updated: July 14, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-gray-600 leading-relaxed mb-10">
          At Namo Print, your trust matters to us. This page outlines how we
          collect, use, and safeguard your personal information whenever you
          use our website or services.
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
            Have questions about your data?
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is happy to help clarify anything related to your
            privacy.
          </p>
          <a
            href="/contact"
            className="inline-block bg-black text-yellow-500 font-semibold px-8 py-3 rounded-full hover:bg-yellow-600 hover:text-black transition"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  )
}