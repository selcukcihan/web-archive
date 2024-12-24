import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 180,
  height: 180,
}
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#18181B',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '140px',
          height: '140px',
        }}>
          {/* Stacked papers effect */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                background: i === 2 ? '#059669' : '#3f3f46',
                height: '45px',
                borderRadius: '4px',
                transform: `translateY(${i * -6}px)`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
