import Footer from "./Footer"
import Header from "./Header"
import { useRouter } from "next/router"

const Layout = (props) => {
  const router = useRouter()
  const isAdmin = router.pathname.startsWith("/admin")
  return (
    <>
      <Header />
      <main>{props.children}</main>
      {!isAdmin && <Footer />}
    </>
  )
}

export default Layout
