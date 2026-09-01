import type { CSSProperties } from 'react'
import { withBase } from '../lib/assetUrl'

type IconProps = {
  src: string
  className?: string
  style?: CSSProperties
  label?: string
}

/**
 * Színezhető ikon — a Design elemek SVG-jeit CSS mask-image-ként jeleníti meg
 * (background-color: currentColor), mert egy <img>-be töltött SVG belső
 * currentColor-ja NEM örökli az oldal színét, csak a mask-technika teszi
 * lehetővé, hogy az ikon mindig a márkaszínt (var(--color-primary)) viselje.
 */
export default function Icon({ src, className = '', style, label }: IconProps) {
  return (
    <span
      className={`icon-fyb icon-mask ${className}`}
      style={{ WebkitMaskImage: `url(${withBase(src)})`, maskImage: `url(${withBase(src)})`, ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
