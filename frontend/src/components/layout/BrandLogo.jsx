import { Link } from 'react-router-dom'
import logo from '../../assets/logo-namo.jpeg'

/** Storefront logo — always navigates to home. */
export function BrandLogo({
  className = '',
  imgClassName = 'h-10 w-auto object-contain sm:h-11 md:h-12',
  onClick,
}) {
  return (
    <Link
      to="/"
      aria-label="Namo Print — go to home"
      className={`shrink-0 transition hover:opacity-90 ${className}`.trim()}
      onClick={onClick}
    >
      <img src={logo} alt="Namo Print" className={imgClassName} />
    </Link>
  )
}

/** Admin / compact mark — also goes to storefront home. */
export function BrandHomeLink({ children, className = '', onClick }) {
  return (
    <Link
      to="/"
      aria-label="Namo Print — go to home"
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
