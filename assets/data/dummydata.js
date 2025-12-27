import {
  FaSuitcase,
  FaBus,
  FaMapMarkedAlt,
  FaBed,
  FaConciergeBell
} from "react-icons/fa";
import { GiPalmTree } from "react-icons/gi";

export const home = [
  {
    icon: <FaSuitcase size={25} />, // Packing Area
    title: "Packing Area",
  },
  {
    icon: <FaConciergeBell size={25} />, // Restaurant
    title: "Restaurant",
  },
  {
    icon: <FaBus size={25} />, // Transport
    title: "Transport",
  },
  {
    icon: <GiPalmTree size={25} />, // Beach
    title: "Beach",
  },
  {
    icon: <FaMapMarkedAlt size={25} />, // Nearby Activity
    title: "Nearby Activity",
  },
  {
    icon: <FaBed size={25} />, // Rooms
    title: "Rooms",
  },
];


// assets/data/dummydata.js

// Add this to your existing dummydata.js file

export const dishdata = [
  // BREAKFAST
  {
    id: 1,
    name: "ROAST & VEGETABLES",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "80",
    oldPrice: "100",
    category: "BREAKFAST",
    image: "/images/dish1.jpg",
    icon: "🍳"
  },
  {
    id: 2,
    name: "MEAT SOUP",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "62.25",
    oldPrice: "85",
    category: "BREAKFAST",
    image: "/images/dish2.jpg",
    icon: "🥣"
  },
  {
    id: 3,
    name: "PANCAKES",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "45",
    oldPrice: "60",
    category: "BREAKFAST",
    image: "/images/dish3.jpg",
    icon: "🥞"
  },

  // LUNCH
  {
    id: 4,
    name: "GRILLED CHICKEN",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "120",
    oldPrice: "150",
    category: "LUNCH",
    image: "/images/dish4.jpg",
    icon: "🍗"
  },
  {
    id: 5,
    name: "SEAFOOD PASTA",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "95",
    oldPrice: "110",
    category: "LUNCH",
    image: "/images/dish5.jpg",
    icon: "🍝"
  },
  {
    id: 6,
    name: "BEEF BURGER",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "75",
    oldPrice: "90",
    category: "LUNCH",
    image: "/images/dish6.jpg",
    icon: "🍔"
  },

  // DINNER
  {
    id: 7,
    name: "STEAK & VEGETABLES",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "150",
    oldPrice: "180",
    category: "DINNER",
    image: "/images/dish7.jpg",
    icon: "🥩"
  },
  {
    id: 8,
    name: "LOBSTER SPECIAL",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "200",
    oldPrice: "250",
    category: "DINNER",
    image: "/images/dish8.jpg",
    icon: "🦞"
  },
  {
    id: 9,
    name: "LAMB CURRY",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "130",
    oldPrice: "160",
    category: "DINNER",
    image: "/images/dish9.jpg",
    icon: "🍛"
  },

  // DRINK
  {
    id: 10,
    name: "FRESH JUICE",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "25",
    oldPrice: "35",
    category: "DRINK",
    image: "/images/drink1.jpg",
    icon: "🍹"
  },
  {
    id: 11,
    name: "COCKTAILS",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "45",
    oldPrice: "60",
    category: "DRINK",
    image: "/images/drink2.jpg",
    icon: "🍸"
  },
  {
    id: 12,
    name: "COFFEE & TEA",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "15",
    oldPrice: "20",
    category: "DRINK",
    image: "/images/drink3.jpg",
    icon: "☕"
  },
    {
    id: 12,
    name: "COFFEE & TEA",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "15",
    oldPrice: "20",
    category: "DRINK",
    image: "/images/drink4.jpg",
    icon: "☕"
  },
    {
    id: 12,
    name: "COFFEE & TEA",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    price: "15",
    oldPrice: "20",
    category: "DRINK",
    image: "/images/drink5.jpg",
    icon: "☕"
  }
]
// assets/data/dummydata.js

// Add this export to your existing dummydata.js

export const roomsdata = [
  {
    id: 1,
    name: "ROOM-1. Family Room",
    roomNumber: 1,
    startingPrice: "START FROM $30 PER DAY",
    description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
    image: "/images/bed3.JPG",
    gallery: [
      "/images/Tribbel1.JPG",
      "/images/Tribbel2.JPG",
      "/images/Tribbel3.JPG",
      "/images/Tribbel4.JPG",
      "/images/Tribbeltoilet.JPG"
     
    ],
    features: [
      "King Size Bed & double Bed",
      "Air Conditioning",
      "42-inch Flat Screen TV",
      "Free Wi-Fi",
      "Luxury Bathroom",
      "Mini Bar",
      "24-hour Room Service"
    ]
  },
  {
    id: 2,
    name: "ROOM-2. Antik room",
    roomNumber: 2,
    startingPrice: "START FROM $20 PER DAY",
    description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
    image: "/images/bed2.jpg",
    gallery: [
      "/images/double11.jpg",
      "/images/double12.jpeg",
      "/images/double13.jpg",
      "/images/double14.jpg",  
      "/images/double15.jpeg"
    ],
    features: [
      "one Queen Size Bed",
      "Spacious Living Area",
      "Air Conditioning",
      "1 Bathrooms",
      "Free Wi-Fi",
      "Flat Screen TV",
      "Separate Dining Area"
    ]
  },
  {
    id: 3,
    name: "ROOM-3. Relax Deluxe",
    roomNumber: 3,
    startingPrice: "START FROM $20 PER DAY",
    description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
    image: "/images/double21.jpeg",
    gallery: [
      "/images/double22.jpeg",
      "/images/double23.jpeg",
      "/images/double24.jpeg",
      "/images/double25.jpeg"
    ],
    features: [
      "Double Bed",
      "Air Conditioning",
      "32-inch Flat Screen TV",
      "Free Wi-Fi",
      "Private Bathroom",
      "Work Desk",
      "Daily Housekeeping"
    ]
  },
  {
    id: 4,
    name: "ROOM-4. Deluxe room",
    roomNumber: 4,
    startingPrice: "START FROM $20 PER DAY",
    description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
    image: "/images/double32.jpeg",
    gallery: [
      "/images/double31.jpeg",
      "/images/double33.jpeg",
      "/images/double34.jpeg"
    ],
    features: [
      "Double Bed",
      "Air Conditioning",
      "Jacuzzi Tub",
      "Free Wi-Fi",
      "Rain Shower",
      "Premium Toiletries",
      "Mood Lighting",
      "Romantic Ambiance"
    ]
  },{
    id: 5,
    name: "ROOM-5. No Air Conditioning With Fan",
    roomNumber: 5,
    startingPrice: "START FROM $10 PER DAY",
    description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
    image:  "/images/double42.jpeg",
    gallery: [
      "/images/double41.jpeg",
      "/images/double42.jpeg",
      
    ],
    features: [
      "Double Bed",
      "Air Conditioning",
      "Jacuzzi Tub",
      "Free Wi-Fi",
      "Rain Shower",
      "Premium Toiletries",
      "Mood Lighting",
      "Romantic Ambiance"
    ]
  },
  {
    id: 6,
    name: "ROOM-6. Non Air conditioning With Fan",
    roomNumber: 6,
    startingPrice: "START FROM $10 PER DAY",
    description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
    image:  "/images/single11.JPG",
    gallery: [
      "/images/single12.JPG",
      "/images/single13.JPG",
      "/images/single14.JPG",
      "/images/singletoilet.JPG"
      
    ],
    features: [
      "Double Bed",
      "Air Conditioning",
      "Jacuzzi Tub",
      "Free Wi-Fi",
      "Rain Shower",
      "Premium Toiletries",
      "Mood Lighting",
      "Romantic Ambiance"
    ]
  }
]
export const expertise = [
  {
    id: 1,
    title: "ROOM-1. Family Room",
    roomNumber: 1,
    price: "30",
    cover: "/images/Tribbel2.JPG",
    coverHover: "/images/Tribbel2.JPG", // <-- updated
    capacity: "4 Adult & 1 Child",
    size: "30m2 / 323ft2",
    view: "FREE wifi",
    bed: "King & Double"
  },{
    id: 2,
    title: "ROOM-2. Antik room",
    roomNumber: 2,
    price: "33.99",
    cover: "/images/double13.jpg",
    coverHover: "/images/double13.jpg", // <-- updated
    capacity: "2 Adult & 1 Child",
    size: "30m2 / 323ft2",
    view: "FREE wifi",
    bed: "King Size"
  },{
    id: 3,
    title: "ROOM-3. Relax Deluxe",
    roomNumber: 3,
    price: "33.99",
    cover: "/images/double21.jpeg",
    coverHover: "/images/double21.jpeg", // <-- updated
    capacity: "2 Adult & 1 Child",
    size: "30m2 / 323ft2",
    view: "FREE wifi",
    bed: "King Size"
  },{
    id: 4,
    title: "ROOM-4. Deluxe room",
    roomNumber: 4,
    price: "33.99",
    cover: "/images/double32.jpeg",
    coverHover: "/images/double32.jpeg", // <-- updated
    capacity: "2 Adult & 1 Child",
    size: "30m2 / 323ft2",
    view: "FREE wifi",
    bed: "King Size"
  },
  {
    id: 5,
    title: "ROOM-5. No Air Conditioning With Fan",
    roomNumber: 5,
    price: "33.99",
    cover: "/images/double41.jpeg",
    coverHover: "/images/double41.jpeg", // <-- updated
    capacity: "2 Adult & 1 Child",
    size: "30m2 / 323ft2",
    view: "FREE wifi",
    bed: "King Size"
  },
  {
    id: 6,
    title: "ROOM-6. Non Air conditioning With Fan",
    roomNumber: 6,
    price: "33.99",
    cover: "/images/single12.JPG",
    coverHover: "/images/single12.JPG", // <-- updated
    capacity: "1 Adult & 1 Child",
    size: "30m2 / 323ft2",
    view: "FREE wifi",
    bed: "double"
  },

]

export const testimonial = [
  {
    id: 1,
    name: "Alexander Black",
    cover: "/images/testimonial-1.jpg",
    post: "solo traveler",
    desc: "Nunc fermentum - tempus erat ligula, sit amet lacinia justo cursus ac. Suspendisse quis nulla tincidunt! Lorem ipsum dolor amet at ornare ex, quis fringilla tortor! Nunc consectetur feugiat rutrum. Sed rhoncus sapien!",
  },
  {
    id: 2,
    name: "Diana Green",
    cover: "/images/testimonial-2.jpg",
    post: "family vacation",
    desc: "Cras at ornare fermentum quam et tortor euismod, vel maximus metus tristique at ornare ex, quis fringilla tortor. Aenean semper neque quis consectetur lobortis. Quisque nec convallis ex. Aenean ut metus et nunc cursus aliquet.",
  },
  {
    id: 3,
    name: "Alexander Black",
    cover: "/images/testimonial-3.jpg",
    post: "photographer",
    desc: "Nunc fermentum - tempus erat ligula, sit amet lacinia justo cursus ac. Suspendisse quis nulla tincidunt! Lorem ipsum dolor amet at ornare ex, quis fringilla tortor! Nunc consectetur feugiat rutrum. Sed rhoncus sapien!",
  },
  {
    id: 4,
    name: "Diana Green",
    cover: "/images/testimonial-4.jpg",
    post: "traveler",
    desc: "Cras at ornare fermentum quam et tortor euismod, vel maximus metus tristique at ornare ex, quis fringilla tortor. Aenean semper neque quis consectetur lobortis. Quisque nec convallis ex. Aenean ut metus et nunc cursus aliquet.",
  },
]
export const showcase = [
  {
    id: 1,
    title: "madu lake bote ride  ",
    cover: "/images/boat.jpg",
    catgeory: "Lake Tours",
  },
  {
    id: 2,
    title: "crocadile watching",
    catgeory: "Lake Tours",
    cover: "/images/crocadile.jpg",
  },
  {
    id: 3,
    title: "Sea Turtle Hatchery",
    cover: "/images/kesbewa.jpeg",
    catgeory: "Sea Tours",
  },
  {
    id: 4,
    title: "mirissa beach tour",
    cover: "/images/mirissa.jpg",
    catgeory: "Beach Tours",
  },
  {
    id: 5,
    title: "Thalpe beach  tour",
    cover: "/images/thalpe.jpg",
    catgeory: "Beach Tours",
  },
  {
    id: 6,
    title: "safari tour",
    cover: "/images/udawalawa.jpg",
    catgeory: "Safari Tours",
  },
]
export const brand = [
  {
    id: 1,
    cover: "/images/l1.svg",
  },
  {
    id: 2,
    cover: "/images/l2.svg",
  },
  {
    id: 3,
    cover: "/images/l3.svg",
  },
  {
    id: 4,
    cover: "/images/l4.svg",
  },
  {
    id: 5,
    cover: "/images/l5.svg",
  },
  {
    id: 6,
    cover: "/images/l6.svg",
  },
]
export const blogdata = [
  {
    id: 1,
    title: "Ligula vel urna accumsan placerat",
    cover: "/images/b1.webp",
    catgeory: "INDUSTRY",
    date: "JANUARY 12, 2023",
  },
  {
    id: 2,
    title: "Don’t underestimate the lorem ipsum dolor amet",
    cover: "/images/b2.jpg",
    catgeory: "TIPS & TRICKS",
    date: "OCTOBER 20, 2023",
  },
  {
    id: 3,
    title: "Building the real VR lorem ipsum dolor amet glavrida from a scratch",
    cover: "/images/b3.jpg",
    catgeory: "TIPS & TRICKS",
    date: "OCTOBER 9, 2023",
  },
  {
    id: 4,
    title: "What eleifend posuere tincidunt",
    cover: "/images/b4.jpg",
    catgeory: "EVENTS",
    date: "OCTOBER 8, 2023",
  },
]
export const teamdata = [
  {
    id: 1,
    title: "Kottu Roti",
    cover: "/images/dish1.jpg",
    post: "Street Food",
  },
  {
    id: 2,
    title: "Fish Ambul Thiyal",
    cover: "/images/dish2.jpg",
    post: "Seafood Main",
  },
  {
    id: 3,
    title: "Hoppers (Appa)",
    cover: "/images/dish3.jpg",
    post: "Breakfast / Snack",
  },
  {
    id: 4,
    title: "Devilled Prawns",
    cover: "/images/dish4.jpg",
    post: "Spicy Seafood",
  },
  {
    id: 5,
    title: "String Hoppers (Idiyappam)",
    cover: "/images/dish5.jpg",
    post: "Breakfast",
  },
  {
    id: 6,
    title: "Lamprais",
    cover: "/images/dish6.jpg",
    post: "Traditional Rice",
  },
  {
    id: 7,
    title: "Pol Sambol & Lunu Miris",
    cover: "/images/dish7.jpg",
    post: "Condiment / Side",
  },
  {
    id: 8,
    title: "Crispy Calamari",
    cover: "/images/dish8.jpg",
    post: "Appetizer",
  },
];
export const roomdata = [
  {
    id: 1,
    title: "Family Room",
    roomNumber: 1,
    cover: "/images/Tribbel1.JPG",
    coverHover: "/images/Tribbel1.JPG",
    post: "AC · King Bed", // removed "· Sea View"
    ac: true,
    minAdults: 2,
    maxAdults: 4,
    maxChildren: 2,
    oneAdultRequiresChild: false,
  },
  {
    id: 2,
    title: "Antik room",
    roomNumber: 2,
    cover: "/images/double15.jpeg",
    coverHover: "/images/double15.jpeg",
    post: "AC · Double Bed · Work Desk",
    ac: true,
    minAdults: 1,
    maxAdults: 2,
    maxChildren: 1,
    oneAdultRequiresChild: true,
  },
  {
    id: 3,
    title: "Relax Deluxe",
    roomNumber: 3,
    cover: "/images/double41.jpeg",
    coverHover: "/images/double41.jpeg",
    post: "AC · Twin Beds · Balcony",
    ac: true,
    minAdults: 1,
    maxAdults: 2,
    maxChildren: 1,
    oneAdultRequiresChild: true,
  },
  {
    id: 4,
    title: "Deluxe room",
    roomNumber: 4,
    cover: "/images/bed4.jpg",
    coverHover: "/images/bed1.jpg",
    post: "Non-AC · Twin Beds",
    ac: false,
    minAdults: 1,
    maxAdults: 2,
    maxChildren: 1,
    oneAdultRequiresChild: true,
  },
  {
    id: 5,
    title: "No Air Conditioning With Fan",
    roomNumber: 5,
    cover: "/images/double41.jpeg",
    coverHover: "/images/double41.jpeg",
    post: "AC · Queen Bed · City View",
    ac: true,
    minAdults: 1,
    maxAdults: 2,
    maxChildren: 1,
    oneAdultRequiresChild: true,
  },
  {
    id: 6,
    title: "Non Air conditioning With Fan",
    roomNumber: 6,
    cover: "/images/single12.JPG",
    coverHover: "/images/single12.JPG",
    post: "Non-AC · Single Bed",
    ac: false,
    minAdults: 1,
    maxAdults: 1,
    maxChildren: 1,
    oneAdultRequiresChild: true,
  },
]
export const facility = [
  {
    icon: <i className="fa fa-bed me-2"></i>,
    quantity: 3,
    facility: "bed",
  },
  {
    icon: <i className="fa fa-bath me-2"></i>,
    quantity: 2,
    facility: "bath",
  },
  {
    icon: <i className="fa fa-wifi me-2"></i>,
    facility: "Wifi",
  },
];
export const roomItems = [
  {
    img: "/images/bed4.jpg",
    price: "$110/night",
    name: "Junior Suit",
    star: [
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
    ],
    description:
      "Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.",
    yellowbtn: "View Detail",
    darkbtn: "book now",
  },

  {
    img: "/images/bed4.jpg",
    price: "$110/night",
    name: "Executive Suite",
    star: [
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
    ],
    description:
      "Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.",
    yellowbtn: "View Detail",
    darkbtn: "book now",
  },
  {
    img: "/images/bed4.jpg",
    price: "$110/night",
    name: "Super Deluxe",
    star: [
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
      <small className="fa fa-star"></small>,
    ],
    description:
      "Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.",
    yellowbtn: "View Detail",
    darkbtn: "book now",
  }, 
];
// Add social icons data used by the SocialIcons component
export const socialIconLocations = [
  {
    type: 'whatsapp',
    link: 'https://wa.me/+46738939199',
    img: '/images/logo.png',
  },
];
export const roomdata1 = [
  {
    id: 1,
    title: "About Image 1",
    cover: "/images/bed1.jpg",
    description: "Spacious lobby with modern design."
  }, 
  {
    id: 2,
    title: "About Image 2",
    cover: "/images/Tribbel4.JPG",
    description: "Relaxing pool area with sunbeds."
  },
  {
    id: 3,
    title: "About Image 3",
    cover: "/images/double22.jpeg",
    description: "Cozy restaurant with local cuisine."
  }
];
