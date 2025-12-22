import Layout from "@/components/common/Layout"
import "@/styles/main.scss"
import "../pages/admin/Table.css"
import "../pages/admin/cards.css"
import "../pages/admin/users.css"

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
