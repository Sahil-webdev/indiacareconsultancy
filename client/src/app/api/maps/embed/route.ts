import { NextRequest, NextResponse } from 'next/server';

function buildFallbackEmbed(address: string) {
  const query = address || 'India Care Consultancy';
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

function parseEmbedUrl(sourceUrl: string | null, address: string) {
  if (!sourceUrl?.trim()) {
    return buildFallbackEmbed(address);
  }

  try {
    const parsed = new URL(sourceUrl);

    if (parsed.pathname.includes('/maps/embed')) {
      return sourceUrl;
    }

    const directQuery =
      parsed.searchParams.get('q') ||
      parsed.searchParams.get('query') ||
      parsed.searchParams.get('destination') ||
      parsed.searchParams.get('daddr');

    if (directQuery) {
      return `https://www.google.com/maps?q=${encodeURIComponent(directQuery)}&z=15&output=embed`;
    }

    const placeMatch = parsed.pathname.match(/\/place\/([^/]+)/);
    if (placeMatch?.[1]) {
      const place = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ');
      return `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`;
    }

    const searchMatch = parsed.pathname.match(/\/search\/([^/]+)/);
    if (searchMatch?.[1]) {
      const place = decodeURIComponent(searchMatch[1]).replace(/\+/g, ' ');
      return `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`;
    }

    const atCoordsMatch = sourceUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (atCoordsMatch) {
      return `https://www.google.com/maps?q=${atCoordsMatch[1]},${atCoordsMatch[2]}&z=15&output=embed`;
    }

    const dataCoordsMatch = sourceUrl.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (dataCoordsMatch) {
      return `https://www.google.com/maps?q=${dataCoordsMatch[1]},${dataCoordsMatch[2]}&z=15&output=embed`;
    }
  } catch {
    return buildFallbackEmbed(address);
  }

  return buildFallbackEmbed(address);
}

async function resolveGoogleMapsUrl(rawUrl: string, address: string) {
  if (!rawUrl.trim()) {
    return buildFallbackEmbed(address);
  }

  try {
    const parsed = new URL(rawUrl);
    const isShortGoogleUrl =
      parsed.hostname.includes('maps.app.goo.gl') ||
      parsed.hostname === 'goo.gl';

    if (!isShortGoogleUrl) {
      return parseEmbedUrl(rawUrl, address);
    }

    const response = await fetch(rawUrl, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; ICCMapResolver/1.0)',
      },
      cache: 'no-store',
    });

    return parseEmbedUrl(response.url || rawUrl, address);
  } catch {
    return buildFallbackEmbed(address);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawUrl = searchParams.get('url') || '';
  const address = searchParams.get('address') || '';

  const embedUrl = await resolveGoogleMapsUrl(rawUrl, address);
  return NextResponse.json({ embedUrl });
}
