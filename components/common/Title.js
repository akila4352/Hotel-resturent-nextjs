export const TitleLogo = ({ title, caption, className }) => {
  return (
    <h1 className={`${className}  title-logo`}>
      <span>{caption}</span>
      {title}
    </h1>
  )
}

export const TitleSm = ({ title, className = "" }) => {
  return <h1 className={`${className} titleSm title-underline`}>{title}</h1>
}
export const Title = ({ title, className }) => {
  return <h1 className={`${className} title title-underline`}>{title}</h1>
}
