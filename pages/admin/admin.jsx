import Cards from "./Cards"
import TableData from "./TableData"
import React, { useState } from "react"

const loginBg = {
  minHeight: "100vh", // changed from 80vh to 100vh
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#000", // changed from rgba(0,0,0,0.03) to black
};

const cardStyle = {
  background: "#232733",
  borderRadius: "16px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  padding: "40px 32px",
  maxWidth: "350px",
  width: "100%",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  margin: "10px 0 20px 0",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#181b23",
  color: "#fff",
  fontSize: "16px",
  outline: "none",
};

const labelStyle = {
  alignSelf: "flex-start",
  marginBottom: "4px",
  fontWeight: "bold",
  fontSize: "15px",
  color: "#ffd700",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #ffd700 0%, #ffb300 100%)",
  color: "#232733",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px",
  transition: "background 0.2s",
};

const logoStyle = {
  width: "120px",
  marginBottom: "16px",
};

const headingStyle = {
  fontSize: "2rem",
  fontWeight: "bold",
  marginBottom: "10px",
  color: "#ffd700",
  letterSpacing: "1px",
};

const Admin = () => {
  const [reservationCount, setReservationCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      username === process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
      password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  if (!loggedIn) {
    return (
      <div style={loginBg}>
        <form onSubmit={handleLogin} style={cardStyle}>
   
          <div style={headingStyle}>Admin Login</div>
          <div style={{ width: "100%" }}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={inputStyle}
              placeholder="Enter your username"
              autoFocus
            />
          </div>
          <div style={{ width: "100%" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="Enter your password"
            />
          </div>
          {error && <p style={{ color: "#ff4d4f", margin: "0 0 10px 0" }}>{error}</p>}
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      </div>
    );
  }

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
