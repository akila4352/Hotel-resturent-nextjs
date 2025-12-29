import Footer from "./Footer"
import Header from "./Header"
import { useRouter } from "next/router"


const Layout = (props) => {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  // TEMPORARY: Block site due to payment issue
  const showOverlay = true;
  return (
    <>
      {showOverlay && (
        <div className="payment-block-overlay">
          <div className="payment-block-message">
            <h1>Site Closed</h1>
            <p>Access is temporarily disabled.<br/>Development payment not received.</p>
          </div>
        </div>
      )}
      <Header />
      <main>{props.children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}

export default Layout
