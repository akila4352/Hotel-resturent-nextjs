// components/Rooms.jsx
"use client"
import React, { useState, useEffect } from "react"
import Image from "next/image"
import { roomsdata } from "@/assets/data/dummydata"
import Head from "next/head"

const seoTitle = "Rooms & Suites | Hotel Amore - Beach Resort in Balapitiya, Sri Lanka"
const seoDescription = "Stay in style at Hotel Amore. Our rooms and suites offer luxury, comfort, and stunning views in Balapitiya, Sri Lanka. Book your beachfront escape today."
const seoKeywords = "luxury beach resort, boutique hotel, romantic hotel, family-friendly hotel, quiet beach hotel, all-inclusive resort, hotel in srilanka, hotel in Balapitiya, hotel in Ambalangoda, hotel in Galle, beach hotel in srilanka, beach hotel in Balapitiya, beach hotel in Ambalangoda, beach hotel in Galle, resort in srilanka, resort in Balapitiya, resort in Ambalangoda, resort in Galle, beachfront hotel srilanka, beachfront hotel Balapitiya, beachfront hotel Ambalangoda, beachfront hotel Galle, seaside hotel srilanka, seaside hotel Balapitiya, seaside hotel Ambalangoda, seaside hotel Galle"

const Rooms = () => {
  const [selectedImages, setSelectedImages] = useState({})