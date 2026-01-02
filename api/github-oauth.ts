// Vercel Serverless Function to proxy GitHub OAuth requests
// This eliminates the need for a third-party CORS proxy

export const config = {
  runtime: 'edge',
};

const ALLOWED_ENDPOINTS = [
  'https://github.com/login/device/code',
  'https://github.com/login/oauth/access_token',
];

export default async function handler(request: Request): Promise<Response> {
  const origin = request.headers.get('Origin');
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }

  try {
    const { endpoint, ...body } = await request.json();

    // Validate endpoint is allowed
    if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint)) {
      return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
        status: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    // Forward request to GitHub
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GitHub OAuth proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
}

function getCorsHeaders(origin?: string | null): Record<string, string> {
  // In production, restrict to your actual domains
  // For development, allow localhost
  const allowedOrigins = [
    'https://www.cafescribble.app',
    'https://cafescribble.app',
    'https://cafe-scribble.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173',
  ];
  
  const allowOrigin = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.vercel.app')
  ) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

