import {
  dateKeyToUtcMilliseconds,
  getTodayDateKey,
} from '../../utils/dates'

const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000

// Displays a human-friendly countdown before plan start.
export function PlanStartStatus({
  startDate,
  today = getTodayDateKey(),
}) {
  if (!startDate || today > startDate) {
    return null
  }

  const daysUntilStart = Math.round(
    (dateKeyToUtcMilliseconds(startDate) -
      dateKeyToUtcMilliseconds(today)) /
      MILLISECONDS_PER_DAY,
  )

  let message = 'Your plan starts today'

  if (daysUntilStart === 1) {
    message = 'Your plan starts tomorrow'
  }

  if (daysUntilStart > 1) {
    message = `${daysUntilStart} days until your plan starts`
  }

  return (
    <p className="plan-start-countdown">
      {message}
    </p>
  )
}
