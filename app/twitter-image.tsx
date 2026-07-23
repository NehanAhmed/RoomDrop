import { ImageResponse } from 'next/og'
import { BASE_URL } from '@/lib/constants'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Wick Chat — Anonymous Chat Rooms'

const displayDomain = new URL(BASE_URL).hostname

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
  const [bebasNeue, nunitoSans, nunitoSansBold] = await Promise.all([
    loadGoogleFont('Bebas+Neue', 400),
    loadGoogleFont('Nunito+Sans', 400),
    loadGoogleFont('Nunito+Sans', 700),
  ])

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700 }[] = []
  if (bebasNeue) fonts.push({ name: 'Bebas Neue', data: bebasNeue, weight: 400 as const })
  if (nunitoSans) fonts.push({ name: 'Nunito Sans', data: nunitoSans, weight: 400 as const })
  if (nunitoSansBold) fonts.push({ name: 'Nunito Sans', data: nunitoSansBold, weight: 700 as const })

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          background: '#0d0d10',
          color: '#fafafa',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Nunito Sans, sans-serif',
        }}
      >
        {/* Top accent bar — amber primary */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: '#d97706',
          }}
        />

        {/* Outer border frame */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />

        {/* Content — left-aligned, more compact for Twitter */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            padding: '0 80px',
            zIndex: 1,
          }}
        >
          {/* Label — uppercase tracking */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#d97706',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Anonymous Chat Rooms
          </span>

          {/* Heading — Bebas Neue */}
          <h1
            style={{
              fontSize: 104,
              fontWeight: 400,
              letterSpacing: '0.1em',
              margin: 0,
              color: '#fafafa',
              fontFamily: 'Bebas Neue, sans-serif',
              lineHeight: 1,
            }}
          >
            WICK CHAT
          </h1>

          {/* Hairline divider */}
          <div
            style={{
              width: 80,
              height: 2,
              background: '#d97706',
              marginTop: 24,
              marginBottom: 24,
            }}
          />

          {/* Description */}
          <p
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: '#a1a1aa',
              margin: 0,
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            Create instant, signup-free chat rooms. Share a link and start chatting with complete privacy.
          </p>
        </div>

        {/* Bottom bar — domain */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '18px 0',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: '#52525b',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            {displayDomain}
          </span>
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
