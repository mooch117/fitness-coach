# Juntos Fit Weekly Check-In Gating Patch

Extract this ZIP into the app root and replace the four matching files.

Files changed:

- src/pages/DashboardPage.jsx
- src/services/dashboardService.js
- src/App.jsx
- src/utils/dates.js

Behavior:

- The first Weekly Check-In occurs on the selected check-in weekday at least seven full days after plan start.
- It repeats every seven days after that.
- On a scheduled weekly date, Weekly Check-In replaces Daily Check-In completely.
- The Weekly button currently opens a placeholder page.
- Existing weekly records are recognized through their linked daily_checkin_id.

Quick examples:

- Sunday start + Sunday check-in: first Weekly Check-In is the following Sunday (Day 7).
- Sunday start + Tuesday check-in: first Weekly Check-In is the following week's Tuesday (Day 9).
