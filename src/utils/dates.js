const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

// Returns today's local calendar date as YYYY-MM-DD.
export function getTodayDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Converts a YYYY-MM-DD string to a UTC timestamp.
export function dateKeyToUtcMilliseconds(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)

  return Date.UTC(year, month - 1, day)
}

// Adds calendar days without introducing local-time-zone drift.
export function addDays(dateKey, numberOfDays) {
  const date = new Date(
    dateKeyToUtcMilliseconds(dateKey) +
      numberOfDays * MILLISECONDS_PER_DAY,
  )

  return date.toISOString().slice(0, 10)
}

// Finds the active seven-day program window for a given date.
export function getProgramWeekRange(startDate, currentDate) {
  if (currentDate < startDate) {
    return {
      weekStart: startDate,
      weekEnd: addDays(startDate, 6),
    }
  }

  const daysSinceStart = Math.floor(
    (dateKeyToUtcMilliseconds(currentDate) -
      dateKeyToUtcMilliseconds(startDate)) /
      MILLISECONDS_PER_DAY,
  )

  const currentWeekIndex = Math.floor(daysSinceStart / 7)
  const weekStart = addDays(startDate, currentWeekIndex * 7)

  return {
    weekStart,
    weekEnd: addDays(weekStart, 6),
  }
}

// Returns the weekday for a YYYY-MM-DD date key.
// Sunday = 0 through Saturday = 6.
export function getDateKeyWeekday(dateKey) {
  if (!dateKey) {
    return null
  }

  return new Date(
    dateKeyToUtcMilliseconds(dateKey),
  ).getUTCDay()
}

// Finds the first selected weekly check-in weekday
// occurring at least seven full days after plan start.
export function getFirstWeeklyCheckInDate(
  startDate,
  checkinDay,
) {
  if (
    !startDate ||
    !Number.isInteger(Number(checkinDay))
  ) {
    return null
  }

  const firstEligibleDate = addDays(
    startDate,
    7,
  )

  const firstEligibleWeekday =
    getDateKeyWeekday(firstEligibleDate)

  const daysUntilCheckIn =
    (Number(checkinDay) -
      firstEligibleWeekday +
      7) %
    7

  return addDays(
    firstEligibleDate,
    daysUntilCheckIn,
  )
}

// Returns true only on the recurring weekly check-in
// dates anchored to the plan's selected weekday.
export function isWeeklyCheckInDate(
  startDate,
  checkinDay,
  currentDate,
) {
  const firstWeeklyDate =
    getFirstWeeklyCheckInDate(
      startDate,
      checkinDay,
    )

  if (
    !firstWeeklyDate ||
    !currentDate ||
    currentDate < firstWeeklyDate
  ) {
    return false
  }

  const daysSinceFirstWeekly =
    Math.floor(
      (dateKeyToUtcMilliseconds(currentDate) -
        dateKeyToUtcMilliseconds(
          firstWeeklyDate,
        )) /
        MILLISECONDS_PER_DAY,
    )

  return daysSinceFirstWeekly % 7 === 0
}
