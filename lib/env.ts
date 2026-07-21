const requiredServerVars = [
  'DATABASE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'PUSHER_APP_ID',
  'PUSHER_SECRET',
  'IMAGEKIT_PRIVATE_KEY',
] as const

const requiredClientVars = [
  'NEXT_PUBLIC_PUSHER_KEY',
  'NEXT_PUBLIC_PUSHER_CLUSTER',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT',
  'NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY',
] as const

function missingVars(vars: readonly string[]): string[] {
  return vars.filter((name) => !process.env[name])
}

export function getEnvOrThrow(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env file or Vercel Environment Variables.`
    )
  }
  return value
}

export function validateEnv(): void {
  if (typeof window !== 'undefined') return

  const serverMissing = missingVars(requiredServerVars)
  const clientMissing = missingVars(requiredClientVars)

  const allMissing = [...serverMissing, ...clientMissing]
  if (allMissing.length > 0) {
    console.warn(
      `Missing environment variables: ${allMissing.join(', ')}. ` +
        'Some features may not work correctly.'
    )
  }
}

validateEnv()
