import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'SitiVetrina';
  const category = searchParams.get('category') || 'Blog';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#fafafa',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {category}
            </div>
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 800,
              color: '#18181b',
              lineHeight: 1.15,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#18181b',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 900,
              }}
            >
              SV
            </div>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#18181b' }}>
              SitiVetrina
            </span>
          </div>
          <span style={{ fontSize: '18px', color: '#71717a' }}>
            sitivetrina.it/blog
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
