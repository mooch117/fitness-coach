# Juntos Fit — Start Check-In Permission Repair

This ZIP contains full replacement files, not snippets.

## Files

- `src/services/startCheckInService.js`
- `supabase/migrations/20260721000100_start_checkin_permission_repair.sql`

## Why this is needed

The front photo can upload without changing the coaching plan.

The side-photo step also saves the plan's selected measurement side. The old
browser code attempted a direct update on `public.coaching_plans`, which the
database correctly blocked.

This repair uses a narrowly scoped `security definer` RPC. It:

- requires an authenticated user
- updates only the signed-in user's own plan
- updates only `measurement_side` and `time_zone`
- does not grant broad UPDATE access on `coaching_plans`

## Install

Extract the entire ZIP into:

`C:\FitnessCoach\App`

Allow Windows to merge folders and replace files.

## Run

```powershell
npx supabase db push
npm run build
```

Test Deb's side-photo upload locally first.

Then deploy:

```powershell
.\buildPush.ps1 "Repair Start Check-In plan preference permissions"
```
