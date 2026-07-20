import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'RoomDrop — Anonymous Chat Rooms'

async function loadGoogleFont(
  fontName: string,
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 400,
): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${fontName}:wght@${weight}&display=swap`,
      { signal: AbortSignal.timeout(5000) },
    ).then((r) => r.text())

    const url = css.match(/src: url\((.+?)\)/)?.[1]
    if (!url) return null

    return fetch(url, { signal: AbortSignal.timeout(5000) }).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

export default async function Image() {
  const [fontRegular, fontBold] = await Promise.all([
    loadGoogleFont('DM+Sans', 400),
    loadGoogleFont('DM+Sans', 700),
  ])

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700 }[] = []
  if (fontRegular) fonts.push({ name: 'DM Sans', data: fontRegular, weight: 400 as const })
  if (fontBold) fonts.push({ name: 'DM Sans', data: fontBold, weight: 700 as const })

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d0d10 0%, #1a1a22 50%, #0d0d10 100%)',
          fontFamily: fonts.length > 0 ? 'DM Sans' : 'sans-serif',
          color: '#fafafa',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            RoomDrop
          </h1>
          <p
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: '#a1a1aa',
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            Anonymous Chat Rooms
          </p>
          <div
            style={{
              width: 60,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #d97706, transparent)',
              marginTop: 8,
            }}
          />
          <p
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: '#71717a',
              margin: 0,
              maxWidth: 500,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: '#52525b',
              margin: 0,
              marginTop: 16,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            room-drop.vercel.app
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  )
}
