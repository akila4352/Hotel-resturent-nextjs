import React from "react"
import Cards from "./Cards"
import TableData from "./TableData"

const Admin = () => {
  return (
    <>
      <section className='home bodyadmin'>
        <div className='container'>
          <div className='heading flexSB'>
            <h3>Hotel Booking Dashboard</h3>
            <span>Admin/ Hotel Bookings</span>
          </div>
          <Cards />
          <TableData />
        </div>
      </section>
    </>
  )
}

export default Admin
