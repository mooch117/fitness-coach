# Coaching Plan Permission Fix

The Start Check-In was failing because the browser client tried to update
`coaching_plans` directly.

This patch uses a narrow authenticated database function instead. It only
allows a signed-in user to save the measurement side and time zone on their
own coaching plan.

## Install

Extract the ZIP into:

`C:\FitnessCoach\App`

Merge the folders and replace the service file.

## Run

```powershell
npx supabase db push
npm run build
```

Then refresh TestUser's Start Check-In and press **Complete Start Check-In**
again.

No test measurements or photos need to be re-entered.
