type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

/** Általános csúszka-kapcsoló (2026.09.03., állapotfelmérő "nézet" váltóhoz) —
 * bárhol újrahasználható két állapot közötti váltásra (pl. hát/röntgen nézet). */
export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      className={`toggle-switch ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch-knob" />
    </button>
  )
}
