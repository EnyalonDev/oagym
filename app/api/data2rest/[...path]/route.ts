import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://d2r.nestorovallos.com';
const PROJECT_ID = process.env.PROJECT_ID || '1';
const API_KEY = process.env.DATA2REST_API_KEY || '';
const SYSTEM_PROJECT_ID = process.env.SYSTEM_PROJECT_ID || '1';
const SYSTEM_API_KEY = process.env.SYSTEM_API_KEY || 'd702f017d9460980828cd1a8929511d4015d67d78ed513a08a84ed37ef88d7ec';

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathSegments } = await params;
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';

    let targetUrl = '';
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Forward incoming Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // Routing Logic
    if (path === 'auth/me' || path === 'v1/auth/me') {
      // Global session endpoint without X-Project-ID (resolved via JWT)
      targetUrl = `${BACKEND_URL}/api/v1/auth/me${queryString}`;
    } else if (path === 'v1/auth/logout' || path === 'auth/logout') {
      // Logout endpoint
      targetUrl = `${BACKEND_URL}/api/v1/auth/logout${queryString}`;
    } else if (path.startsWith('system/')) {
      // System administrative actions
      const subPath = path.replace(/^system\//, '');
      targetUrl = `${BACKEND_URL}/api/projects/${SYSTEM_PROJECT_ID}/${subPath}${queryString}`;
      headers['X-Project-ID'] = SYSTEM_PROJECT_ID;
      if (SYSTEM_API_KEY) headers['X-API-Key'] = SYSTEM_API_KEY;
    } else if (path.startsWith('auth/')) {
      // Project-specific Auth actions (check-or-login, verify-pin, qr-login, etc.)
      targetUrl = `${BACKEND_URL}/api/projects/${PROJECT_ID}/${path}${queryString}`;
      headers['X-Project-ID'] = PROJECT_ID;
      if (API_KEY) headers['X-API-Key'] = API_KEY;
    } else {
      // Standard project data / tables
      targetUrl = `${BACKEND_URL}/api/projects/${PROJECT_ID}/${path}${queryString}`;
      headers['X-Project-ID'] = PROJECT_ID;
      if (API_KEY) headers['X-API-Key'] = API_KEY;
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const bodyText = await request.text();
        if (bodyText) {
          fetchOptions.body = bodyText;
        }
      } catch {
        // No body
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Proxy Error',
        message: error?.message || 'Error al conectar con el backend Data2Rest',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Project-ID, X-API-Key',
    },
  });
}
