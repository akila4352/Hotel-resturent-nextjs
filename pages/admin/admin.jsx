

import Cards from "./Cards"
import TableData from "./TableData"
import React, { useState } from "react"


const Admin = () => {
  const [reservationCount, setReservationCount] = useState(0);
  return (
    <>
      <section className='home bodyadmin'>
        <div className='container'>
          <div className='heading flexSB'>
            <h3>Admin</h3>
            
          </div>
          <Cards reservationCount={reservationCount} />
          <TableData setReservationCount={setReservationCount} />
        </div>
      </section>
    </>
  )
}

export default Admin
