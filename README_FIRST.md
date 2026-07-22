# Juntos Fit — Visible Build Version

This adds a tiny version marker to every app screen.

Example:

`v0.0.1 · a1b2c3d`
`Jul 21, 9:42 AM`

- `v0.0.1` is the app milestone version from `package.json`.
- `a1b2c3d` is the exact Git commit used by the build.
- The date/time is formatted in the phone or computer's local time.

Cloudflare Pages supplies its current commit SHA automatically. Local builds
fall back to the current local Git commit.

## Install

Extract the entire ZIP into:

`C:\FitnessCoach\App`

Allow Windows to merge folders and replace files.

No database migration is needed.

## Test locally

```powershell
npm run build
npm run dev
```

The label should appear in the bottom-right corner.

## Deploy

```powershell
.\buildPush.ps1 "Add visible build version"
```

At the end, the script prints the seven-character commit code to watch for.
When the live app displays that same code, Cloudflare is serving the new build.

## Future milestone versions

Change only the `version` value in `package.json`, for example:

- `0.0.2`
- `0.1.0`
- `1.0.0`

The commit code and build time update automatically on every deployment.
