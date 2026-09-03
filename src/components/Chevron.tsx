import { withBase } from '../lib/assetUrl'

type ChevronProps = {
  direction?: 'left' | 'right' | 'down'
  /** két, szorosan egymás mellett álló nyíl — a logóban látható ismétlődő minta, pl. eyebrow-khoz */
  double?: boolean
  className?: string
  /** ha meg van adva, az eredeti grafika helyett egy erre a színre maszkolt változat jelenik meg
   * (ugyanaz a technika, mint az Icon.tsx-nél — ld. .icon-mask), pl. var(--lime). */
  color?: string
}

// A korábbi, magunk vágta "chevron_unit.png" nem volt elég precíz (Marci
// hibajelzésére, 2026.09.03. — főleg a videókiosztás nagyméretű, dupla
// nyilainál látszott). Helyette a "Design elemek/balra nyíl.png" (Marci
// saját grafikája) adja mindkét változatot: `chevron.png` ennek a fájlnak a
// bal fele (egyetlen nyíl-egység — a két nyíl a forrásban pontosan
// szimmetrikusan, rés nélkül illeszkedik egymáshoz, ezért a felezés önmagában
// egy tiszta, önálló egységet ad), `chevron-double.png` pedig a teljes,
// kész "dupla nyíl" grafika — NEM két egység egymás mellé illesztésével áll
// elő futásidőben (ahogy korábban), hogy a dupla nyíl pontosan azt a formát
// kapja, amit Marci megrajzolt.
function Unit({ color, src, double }: { color?: string; src: string; double?: boolean }) {
  if (color) {
    return (
      <span
        className={`chevron-unit chevron-unit--mask ${double ? 'chevron-unit--mask-double' : ''}`}
        style={{ WebkitMaskImage: `url(${withBase(src)})`, maskImage: `url(${withBase(src)})`, backgroundColor: color }}
      />
    )
  }
  return <img src={withBase(src)} alt="" className="chevron-unit" draggable={false} />
}

export default function Chevron({ direction = 'left', double = false, className = '', color }: ChevronProps) {
  const rotation =
    direction === 'right' ? 'scaleX(-1)' : direction === 'down' ? 'rotate(-90deg)' : undefined
  const src = double ? '/images/chevron-double.png' : '/images/chevron.png'

  return (
    <span
      className={`chevron-svg ${className}`}
      style={rotation ? { transform: rotation } : undefined}
    >
      <Unit color={color} src={src} double={double} />
    </span>
  )
}
