import { Link } from 'react-router-dom'
import Chevron from './Chevron'
import { useNextStep } from '../hooks/useNextStep'

// sárga sáv az ÜF eredménylapján: mi a következő lépés (ld. useNextStep)
export default function NextStepBanner() {
  const step = useNextStep()
  if (!step) return null
  return (
    <div className="next-step-banner no-print" role="status">
      <div>
        <div className="fw-bold">{step.title}</div>
        <div className="small">{step.text}</div>
      </div>
      <Link to={step.to} className="btn-fyb next-step-btn">
        {step.button}
        <Chevron direction="right" color="var(--navy)" />
      </Link>
    </div>
  )
}
