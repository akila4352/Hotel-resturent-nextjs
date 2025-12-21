export const TitleLogo = ({ title, caption, className }) => {
  return (
    <h1 className={`${className} title-logo`}>
      <span>{caption}</span>
      {title}
      <style jsx>{`
        .title-logo {
          color: black;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.1),
            2px 2px 0px rgba(0, 0, 0, 0.08),
            3px 3px 0px rgba(0, 0, 0, 0.06),
            4px 4px 0px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </h1>
  )
}

export const TitleSm = ({ title, className = "" }) => {
  return (
    <h1 className={`${className} titleSm title-underline`}>
      {title}
      <style jsx>{`
        .titleSm {
          color: black;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.1),
            2px 2px 0px rgba(0, 0, 0, 0.08),
            3px 3px 0px rgba(0, 0, 0, 0.06),
            4px 4px 0px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </h1>
  )
}

export const Title = ({ title, className }) => {
  return (
    <h1 className={`${className} title title-underline`}>
      {title}
      <style jsx>{`
        .title {
          color: black;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.1),
            2px 2px 0px rgba(0, 0, 0, 0.08),
            3px 3px 0px rgba(0, 0, 0, 0.06),
            4px 4px 0px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </h1>
  )
}
