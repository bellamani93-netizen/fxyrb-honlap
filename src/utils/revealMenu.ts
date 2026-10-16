/** ref-callback a legördülő menükhöz: megnyitáskor a menüt a látható területre
 * görgeti (telefonon az oldal alján megnyitott lista különben a képernyő alá
 * lógna, és a felhasználónak magának kellene lejjebb görgetnie) */
export function revealMenu(el: HTMLElement | null) {
  el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

/** a hosszú, normál folyásban nyíló listákhoz (pl. állapotfelmérő többválasztós
 * mezők): a nyitó gombot a képernyő tetejére görgeti, így alatta a lista eleje
 * látszik, és lefelé görgetve végigböngészhető */
export function revealPanel(el: HTMLElement | null) {
  const trigger = el?.previousElementSibling as HTMLElement | null
  trigger?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}
