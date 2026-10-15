/** ref-callback a legördülő menükhöz: megnyitáskor a menüt a látható területre
 * görgeti (telefonon az oldal alján megnyitott lista különben a képernyő alá
 * lógna, és a felhasználónak magának kellene lejjebb görgetnie) */
export function revealMenu(el: HTMLElement | null) {
  el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}
