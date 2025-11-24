import { Hero } from "@/sections"
import Head from "next/head"
import SocialIcons2 from '../components/common/SocialIcons';
export default function Home() {
  return (
    <>
      <Head>
        <title>Amore</title>
      </Head>
      <Hero />
      <SocialIcons2 />
    </>
  )
}