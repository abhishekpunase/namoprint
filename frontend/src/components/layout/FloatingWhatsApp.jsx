import { useLocation } from 'react-router-dom'

export default function FloatingWhatsApp() {
  const { pathname } = useLocation()

  // Storefront only — never show on admin panel
  if (pathname.startsWith('/admin')) return null

  const whatsappNumber = '+919098570277'
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hi Namo Print, I am interested in your products.',
  )}`

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.87 9.87 0 0 0 4.62 1.17h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.64-1.03-5.13-2.9-7-1.87-1.87-4.36-2.84-7.01-2.84Zm0 18.07h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.3c0-4.52 3.68-8.2 8.24-8.2 2.2 0 4.27.86 5.83 2.42a8.14 8.14 0 0 1 2.42 5.79c0 4.52-3.69 8.15-8.25 8.15Zm4.52-6.14c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
      </svg>
    </a>
  )
}
