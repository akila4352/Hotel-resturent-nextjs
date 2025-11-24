export default function CommonHeading({ heading, title, subtitle }) {
  const wrap = {
    paddingTop: 48,
    paddingBottom: 48,
    textAlign: "center",
    maxWidth: 1100,
    margin: "0 auto",
  };
  const lineStyle = {
    height: 4,
    width: 70,
    background: "#f7a33e",
    borderRadius: 4,
    display: "inline-block",
    verticalAlign: "middle",
  };
  const captionStyle = {
    color: "#f7a33e",
    fontWeight: 700,
    letterSpacing: 1,
    margin: "0 18px",
    fontSize: 12,
  };
  const h1Style = {
    fontSize: "clamp(28px, 4.5vw, 48px)",
    lineHeight: 1.02,
    marginTop: 18,
    marginBottom: 28,
    fontWeight: 800,
    color: "#0f2137",
  };

  return (
    <>
      <div
        className="text-center wow fadeInUp"
        data-wow-delay="0.1s"
        style={wrap}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={lineStyle}></span>
          <h6
            className="section-title text-center text-primary text-uppercase"
            style={captionStyle}
          >
            {heading}
          </h6>
          <span style={lineStyle}></span>
        </div>

        <h1 className="mb-5" style={h1Style}>
          {subtitle}{" "}
          <span
            className="text-primary text-uppercase"
            style={{ color: "#f7a33e" }}
          >
            {title}
          </span>
        </h1>
      </div>
    </>
  );
}
