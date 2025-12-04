import Head from "next/head"
import Blogs from "../sections/Blogs" // add: render the Blogs component

const blogs = () => {
  return (
    <>
      <Head>
        <title>Amore — Contact</title>
      </Head>

      {/* render the Contact/Blogs section so /blogs shows the page */}
      <Blogs />
    </>
  )
}

export default blogs
