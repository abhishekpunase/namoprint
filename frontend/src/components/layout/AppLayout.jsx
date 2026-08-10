import { Outlet } from 'react-router-dom'
import { RouteSeo } from '../seo/RouteSeo'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppLayout() {
  return (
    <>
      <RouteSeo />
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
