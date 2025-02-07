import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';
import { corsOptions } from '@/app/services/api/_db';
import { NextRequest } from 'next/server';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const url = new URL(req.url);
  const imageUrl = url.searchParams.get('url');

  if (!imageUrl) {
    return Response.json(
      { error: ERRORS.IMAGE_URL_MISSING },
      { ...corsParams, status: HTTP_STATUS_CODES.BAD_REQUEST }
    );
  }

  try {
    const response = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }, // Evita bloqueos de Instagram
    });

    if (!response.ok) throw new Error('Failed to fetch image');

    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      ...corsParams,
      headers: {
        ...corsParams.headers,
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // 1 día
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Image fetch failed' },
      { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
    );
  }
}
