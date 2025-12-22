import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
import Common from "./Common";
import { ref, get, child } from "firebase/database";
import { rtdb } from "../../lib/firebase";

const Cards = () => {
  const [stats, setStats] = useState({
    earnings: 0,
    bookings: 0,
    availableRooms: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dbRef = ref(rtdb);

        // Fetch hotel bookings
        const hotelSnap = await get(child(dbRef, "hotelBookings"));
        let earnings = 0;
        let bookings = 0;
        if (hotelSnap.exists()) {
          const bookingsObj = hotelSnap.val();
          bookings = Object.keys(bookingsObj).length;
          // Assume each booking has a 'price' field
          earnings = Object.values(bookingsObj).reduce((sum, b) => sum + (b.price ? Number(b.price) : 0), 0);
        }

        // Fetch today's available rooms
        // Assume hotelRooms/{roomId} with { available: boolean, ... }
        const roomsSnap = await get(child(dbRef, "hotelRooms"));
        let availableRooms = 0;
        if (roomsSnap.exists()) {
          const roomsObj = roomsSnap.val();
          availableRooms = Object.values(roomsObj).filter(r => r.available).length;
        }

        setStats({
          earnings,
          bookings,
          availableRooms,
        });
      } catch (err) {
        console.error("Error fetching hotel stats:", err);
      }
    };

    fetchStats();
  }, []);

  // Chart configs
  const earningsData = {
    series: [stats.earnings],
    options: {
      chart: { type: "radialBar" },
      plotOptions: { radialBar: { hollow: { size: "58%" }, dataLabels: { value: { show: true } } } },
      labels: ["Earnings"],
      colors: ["#4CAF50"],
    },
  };

  const bookingsData = {
    series: [stats.bookings],
    options: {
      chart: { type: "radialBar" },
      plotOptions: { radialBar: { hollow: { size: "58%" }, dataLabels: { value: { show: true } } } },
      labels: ["Bookings"],
      colors: ["#2196F3"],
    },
  };

  const roomsData = {
    series: [stats.availableRooms],
    options: {
      chart: { type: "radialBar" },
      plotOptions: { radialBar: { hollow: { size: "58%" }, dataLabels: { value: { show: true } } } },
      labels: ["Rooms"],
      colors: ["#E9B251"],
    },
  };

  return (
    <section className="cards grid">
      <div className="cardBox">
        <Common title="Total Earnings" />
        <div className="circle">
          <div className="row">
            <ReactApexChart options={earningsData.options} series={earningsData.series} type="radialBar" height={150} />
          </div>
          <div className="title row">
            <h1>Rs. {stats.earnings}</h1>
            <p>Earnings</p>
          </div>
        </div>
      </div>

      <div className="cardBox">
        <Common title="Total Bookings" />
        <div className="circle">
          <div className="row">
            <ReactApexChart options={bookingsData.options} series={bookingsData.series} type="radialBar" height={150} />
          </div>
          <div className="title row">
            <h1>{stats.bookings}</h1>
            <p>Bookings</p>
          </div>
        </div>
      </div>

      <div className="cardBox">
        <Common title="Today's Available Rooms" />
        <div className="circle">
          <div className="row">
            <ReactApexChart options={roomsData.options} series={roomsData.series} type="radialBar" height={150} />
          </div>
          <div className="title row">
            <h1>{stats.availableRooms}</h1>
            <p>Rooms</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cards;
