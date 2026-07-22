// Displays the dashboard when no active plan exists.
export function PlanEmptyState({ onCreatePlan }) {
  return (
    <section
      className="empty-plan-card"
      aria-labelledby="empty-plan-title"
    >
      <h2 id="empty-plan-title">
        Ready to get started?
      </h2>

      <p>
        Create your coaching plan to set your start
        date, weekly schedule, and targets.
      </p>

      <button
        type="button"
        className="daily-check-in-button is-due"
        onClick={onCreatePlan}
      >
        Create Plan
      </button>
    </section>
  )
}
