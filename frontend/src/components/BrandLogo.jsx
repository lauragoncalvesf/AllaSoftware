import allaIcon from "../assets/brand/all-icon-DnPp3Dj_.png"
import allaHorizontalBlue from "../assets/brand/ALLA-HORIZONTAL-AZUL.png"
import allaHorizontalWhite from "../assets/brand/ALLA-HORIZONTAL-BRANCO.png"
import allaStackedBlue from "../assets/brand/ALLA-BAIXO-AZUL.png"
import allaStackedWhite from "../assets/brand/ALLA-BAIXO-BRANCO.png"

export default function BrandLogo({
  variant = "horizontal",
  tone = "dark",
  className = ""
}) {
  if (variant === "icon") {
    return (
      <img
        src={allaIcon}
        alt="ALLA"
        className={`object-contain ${className}`}
      />
    )
  }

  if (variant === "stacked") {
    const src = tone === "light" ? allaStackedWhite : allaStackedBlue

    return (
      <img
        src={src}
        alt="ALLA"
        className={`object-contain ${className}`}
      />
    )
  }

  const src = tone === "light" ? allaHorizontalWhite : allaHorizontalBlue

  return (
    <img
      src={src}
      alt="ALLA"
      className={`object-contain ${className}`}
    />
  )
}
