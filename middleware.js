export const config = {
  matcher: '/api/bare/:path*',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const subPath = url.pathname.replace(/^\/api\/bare\/?/, '');

  // Root: return server info
  if (!subPath || subPath === '') {
    return new Response(JSON.stringify({
      versions: ['v3'],
      language: 'EdgeMiddleware',
      project: { name: 'bare-server-edge' },
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': '*',
      },
    });
  }

  // v3 endpoint
  if (subPath.startsWith('v3')) {
    try {
      const bareHost = request.headers.get('x-bare-host');
      const barePort = request.headers.get('x-bare-port') || '';
      const bareProtocol = request.headers.get('x-bare-protocol') || 'https:';
      const barePath = request.headers.get('x-bare-path') || '/';
      const bareHeadersRaw = request.headers.get('x-bare-headers') || '{}';
      const bareForwardHeadersRaw = request.headers.get('x-bare-forward-headers') || '[]';

      if (!bareHost) {
        return new Response(JSON.stringify({ error: 'Missing x-bare-host' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const port = barePort && barePort !== '443' && barePort !== '80' ? `:${barePort}` : '';
      const targetUrl = `${bareProtocol}//${bareHost}${port}${barePath}`;

      let bareHeaders = {};
      try { bareHeaders = JSON.parse(bareHeadersRaw); } catch(e) {}

      let forwardHeaders = [];
      try { forwardHeaders = JSON.parse(bareForwardHeadersRaw); } catch(e) {}

      const fetchHeaders = new Headers(bareHeaders);
      for (const header of forwardHeaders) {
        const val = request.headers.get(header);
        if (val) fetchHeaders.set(header, val);
      }
      fetchHeaders.delete('host');
      fetchHeaders.delete('accept-encoding');

      const body = (request.method !== 'GET' && request.method !== 'HEAD')
        ? await request.arrayBuffer()
        : undefined;

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: fetchHeaders,
        body,
        redirect: 'manual',
      });

      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        // Edge Runtime auto-decompresses, so remove stale encoding/length headers
        const lower = key.toLowerCase();
        if (lower === 'content-encoding' || lower === 'content-length' || lower === 'transfer-encoding') return;
        responseHeaders[key] = value;
      });

      const respBody = await response.arrayBuffer();

      return new Response(respBody, {
        status: 200,
        headers: {
          'X-Bare-Status': response.status.toString(),
          'X-Bare-Status-Text': response.statusText || '',
          'X-Bare-Headers': JSON.stringify(responseHeaders),
          'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Expose-Headers': '*',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  return new Response('Not found', { status: 404 });
}
