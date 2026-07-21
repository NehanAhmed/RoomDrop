import { upload, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError } from '@imagekit/next'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024

interface UploadAuth {
  token: string
  expire: number
  signature: string
  publicKey: string
  urlEndpoint: string
}

async function fetchUploadAuth(): Promise<UploadAuth> {
  const res = await fetch('/api/upload/sign')
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error ?? 'Failed to get upload credentials')
  }
  return res.json()
}

export async function uploadToImageKit(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be under 10MB')
  }

  const { token, expire, signature, publicKey } = await fetchUploadAuth()

  try {
    const response = await upload({
      file,
      fileName: file.name,
      token,
      expire,
      signature,
      publicKey,
      useUniqueFileName: true,
      folder: '/roomdrop',
    })

    return response.url!
  } catch (error) {
    if (error instanceof ImageKitInvalidRequestError) {
      throw new Error(`Invalid upload request: ${error.message}`)
    }
    if (error instanceof ImageKitUploadNetworkError) {
      throw new Error(`Network error: ${error.message}`)
    }
    if (error instanceof ImageKitServerError) {
      throw new Error(`Server error: ${error.message}`)
    }
    throw error
  }
}
