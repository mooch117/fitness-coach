# Delete/Clear User Plan Data

Copy these files into the root of the Juntos Fit project.

## Required environment values

Add these to `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
```

Never name the service-role variable with a `VITE_` prefix. Never commit
the service-role key.

The project must already include `@supabase/supabase-js`.

## Run

Git Bash:

```bash
chmod +x ./deleteClearUsersPlanData
./deleteClearUsersPlanData "mooch117@gmail.com"
```

PowerShell or Command Prompt:

```powershell
.\deleteClearUsersPlanData "mooch117@gmail.com"
```

PowerShell resolves the included `deleteClearUsersPlanData.cmd` wrapper.

The script:
- finds the auth user by email;
- deletes all rows in `public.coaching_plans` for that user;
- relies on the existing `ON DELETE CASCADE` foreign keys to clear related
  plan targets and check-ins;
- keeps the auth account and `public.profiles` row.

It does not remove physical files from Supabase Storage.
