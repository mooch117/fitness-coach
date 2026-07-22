#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const contents = fs.readFileSync(filePath, 'utf8')

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 1) continue

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function loadLocalEnvironment() {
  const scriptFile = fileURLToPath(import.meta.url)
  const scriptDirectory = path.dirname(scriptFile)

  // scripts -> clearUsersPlanData -> APP
  const appDirectory = path.resolve(
    scriptDirectory,
    '..',
    '..',
  )

  loadEnvFile(
    path.join(appDirectory, '.env.local'),
  )

  loadEnvFile(
    path.join(appDirectory, '.env'),
  )
}

async function findUserByEmail(supabase, email) {
  const normalizedEmail = email.trim().toLowerCase()
  const perPage = 200

  for (let page = 1; ; page += 1) {
    const {
      data,
      error,
    } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw new Error(
        `Unable to search Supabase users: ${error.message}`,
      )
    }

    const users = data?.users ?? []
    const match = users.find(
      (user) =>
        user.email?.trim().toLowerCase() === normalizedEmail,
    )

    if (match) return match
    if (users.length < perPage) return null
  }
}

async function main() {
  loadLocalEnvironment()

  const email = process.argv[2]?.trim()

  if (!email) {
    console.error(
      'Usage: ./deleteClearUsersPlanData "user@example.com"',
    )
    process.exitCode = 1
    return
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'Missing SUPABASE_URL or VITE_SUPABASE_URL in .env.local/.env.',
    )
  }

  if (!serviceRoleKey) {
    throw new Error(
      [
        'Missing SUPABASE_SERVICE_ROLE_KEY in .env.local/.env.',
        'Use the server-only service-role key.',
        'Do not prefix this key with VITE_ and do not commit it.',
      ].join(' '),
    )
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  const user = await findUserByEmail(supabase, email)

  if (!user) {
    throw new Error(`No auth user found for ${email}.`)
  }

  const {
    data: plans,
    error: plansError,
  } = await supabase
    .from('coaching_plans')
    .select('id, start_date, status')
    .eq('user_id', user.id)

  if (plansError) {
    throw new Error(
      `Unable to read coaching plans: ${plansError.message}`,
    )
  }

  if (!plans?.length) {
    console.log(
      `No coaching plans found for ${user.email} (${user.id}).`,
    )
    return
  }

  console.log(
    `Deleting ${plans.length} coaching plan(s) for ${user.email} (${user.id})...`,
  )

  for (const plan of plans) {
    console.log(
      `  - ${plan.id} | ${plan.start_date ?? 'no start date'} | ${plan.status ?? 'no status'}`,
    )
  }

  const {
    data: deletedPlans,
    error: deleteError,
  } = await supabase
    .from('coaching_plans')
    .delete()
    .eq('user_id', user.id)
    .select('id')

  if (deleteError) {
    throw new Error(
      `Unable to delete coaching plans: ${deleteError.message}`,
    )
  }

  console.log(
    `Done. Deleted ${deletedPlans?.length ?? plans.length} coaching plan(s).`,
  )
  console.log(
    'The auth user and public profile were not deleted.',
  )
  console.log(
    'Related plan targets/check-ins are removed by your database ON DELETE CASCADE rules.',
  )
}

main().catch((error) => {
  console.error(`Error: ${error.message}`)
  process.exitCode = 1
})
