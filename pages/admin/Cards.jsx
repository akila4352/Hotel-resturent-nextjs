import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
import Common from "./Common";
import { ref, get, child } from "firebase/database";
import { rtdb } from "../../lib/firebase";


const Cards = ({ reservationCount }) => {
  const [stats, setStats] = useState({
    earnings: 0,
    reservations: 0,
    availableRooms: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dbRef = ref(rtdb);

        // Fetch reservations and sum totalPrice for earnings
        const resSnap = await get(child(dbRef, "reservations"));
        let earnings = 0;
        if (resSnap.exists()) {
          const reservationsObj = resSnap.val();
          earnings = Object.values(reservationsObj).reduce((sum, b) => {
            if (typeof b.totalPrice === 'number') return sum + b.totalPrice;
            if (typeof b.totalPrice === 'string' && !isNaN(Number(b.totalPrice))) return sum + Number(b.totalPrice);
            return sum;
          }, 0);
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
          reservations: reservationCount,
          availableRooms,
        });
      } catch (err) {
        console.error("Error fetching hotel stats:", err);
      }
    };

    fetchStats();
  }, [reservationCount]);
 
  // Chart configs
  const earningsData = {
    series: [stats.earnings],
    options: {
      chart: { type: "radialBar" },
      plotOptions: {
        radialBar: {
          hollow: { size: "58%" },
          dataLabels: {
            value: { show: false }, // Hide the value label inside the circle
          },
        },
      },
      labels: ["Earnings"],
      colors: ["#4CAF50"],
    },
  };

  const reservationsData = {
    series: [stats.reservations],
    options: {
      chart: { type: "radialBar" },
      plotOptions: { radialBar: { hollow: { size: "58%" }, dataLabels: { value: { show: true } } } },
      labels: ["Reservations"],
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
            <h1>USD {stats.earnings.toFixed(2)}</h1>
            <p>Earnings</p>
          </div>
        </div>
      </div>

      <div className="cardBox">
        <Common title="Total Reservations" />
        <div className="circle">
          <div className="row">
            <ReactApexChart options={reservationsData.options} series={reservationsData.series} type="radialBar" height={150} />
          </div>
          <div className="title row">
            <h1>{stats.reservations}</h1>
            <p>Reservations</p>
          </div>
        </div>
      </div>

      {/* Removed Today's Available Rooms card as requested */}
    </section>
  );
};

export default Cards;
