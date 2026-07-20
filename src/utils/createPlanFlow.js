export const CREATE_PLAN_STEP_IDS = {
  GOAL: 'goal',
  START_DATE: 'start-date',
  LENGTH: 'length',
  CHECKIN_DAY: 'checkin-day',
  NUTRITION: 'nutrition',
  ACTIVITY: 'activity',
}

export const CREATE_PLAN_STEPS = [
  CREATE_PLAN_STEP_IDS.GOAL,
  CREATE_PLAN_STEP_IDS.START_DATE,
  CREATE_PLAN_STEP_IDS.LENGTH,
  CREATE_PLAN_STEP_IDS.CHECKIN_DAY,
  CREATE_PLAN_STEP_IDS.NUTRITION,
  CREATE_PLAN_STEP_IDS.ACTIVITY,
]

export const GOAL_OPTIONS = [
  {
    value: 'fat_loss',
    label: 'Fat Loss',
  },
  {
    value: 'maintenance',
    label: 'Maintain',
  },
  {
    value: 'muscle_gain',
    label: 'Build Muscle',
  },
]

export const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export function getDateKeyWeekday(dateKey) {
  if (!dateKey) {
    return null
  }

  return new Date(`${dateKey}T00:00:00Z`).getUTCDay()
}

function hasWholeNumber(value, minimum, maximum) {
  if (value === '') {
    return false
  }

  const number = Number(value)

  return (
    Number.isInteger(number) &&
    number >= minimum &&
    number <= maximum
  )
}

// Returns an error message for one Create Plan step.
export function validateCreatePlanStep(
  step,
  form,
  today,
) {
  if (step === CREATE_PLAN_STEP_IDS.GOAL) {
    return form.goal
      ? ''
      : 'Choose your coaching goal.'
  }

  if (step === CREATE_PLAN_STEP_IDS.START_DATE) {
    if (!form.start_date) {
      return 'Choose your plan start date.'
    }

    if (form.start_date < today) {
      return 'Your plan start date cannot be in the past.'
    }

    return ''
  }

  if (step === CREATE_PLAN_STEP_IDS.LENGTH) {
    return hasWholeNumber(
      form.program_length_weeks,
      1,
      52,
    )
      ? ''
      : 'Program length must be between 1 and 52 weeks.'
  }

  if (step === CREATE_PLAN_STEP_IDS.CHECKIN_DAY) {
    return hasWholeNumber(form.checkin_day, 0, 6)
      ? ''
      : 'Choose your weekly check-in day.'
  }

  if (step === CREATE_PLAN_STEP_IDS.NUTRITION) {
    if (
      !hasWholeNumber(
        form.calorie_target,
        1,
        10000,
      )
    ) {
      return 'Enter a valid daily calorie target.'
    }

    const macroFields = [
      form.protein_grams,
      form.carb_grams,
      form.fat_grams,
    ]

    if (
      macroFields.some(
        (value) =>
          !hasWholeNumber(value, 0, 1000),
      )
    ) {
      return 'Enter valid protein, carbohydrate, and fat targets.'
    }

    return ''
  }

  if (step === CREATE_PLAN_STEP_IDS.ACTIVITY) {
    if (
      !hasWholeNumber(
        form.weekly_workout_target,
        0,
        14,
      )
    ) {
      return 'Weekly workouts must be between 0 and 14.'
    }

    if (
      !hasWholeNumber(
        form.weekly_cardio_target_minutes,
        0,
        3000,
      )
    ) {
      return 'Weekly cardio must be between 0 and 3,000 minutes.'
    }

    if (
      !hasWholeNumber(
        form.daily_water_goal_oz,
        1,
        500,
      )
    ) {
      return 'Daily water must be between 1 and 500 ounces.'
    }

    return ''
  }

  return ''
}

export function validateCreatePlan(form, today) {
  for (const step of CREATE_PLAN_STEPS) {
    const error = validateCreatePlanStep(
      step,
      form,
      today,
    )

    if (error) {
      return {
        error,
        step,
      }
    }
  }

  return {
    error: '',
    step: null,
  }
}
