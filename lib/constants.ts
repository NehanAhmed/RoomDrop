export const BASE_URL: string =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://chat.nehan.site'

export function getBaseUrl(): string {
  return BASE_URL
}
