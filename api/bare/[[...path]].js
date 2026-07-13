// Bare Server v3 implementation as Vercel Serverless Function
// Handles HTTP proxy requests without WebSocket (works when Wisp/WebSocket is blocked)

export default async function handler(req, res) {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url.replace(/^\/api\/bare\/?/, '');

  // Root: return server info
  if (!url || url === '/') {
    res.status(200).json({
      versions: ['v3'],
      language: 'NodeJS',
      project: {
        name: 'bare-server-vercel',
        repository: 'https://github.com/nicechat',
      },
    });
    return;
  }

  // v3 endpoint
  if (url.startsWith('v3/') || url === 'v3') {
    try {
      const bareHost = req.headers['x-bare-host'];
      const barePort = req.headers['x-bare-port'] || '';
      const bareProtocol = req.headers['x-bare-protocol'] || 'https:';
      const barePath = req.headers['x-bare-path'] || '/';
      const bareHeadersRaw = req.headers['x-bare-headers'] || '{}';
      const bareForwardHeadersRaw = req.headers['x-bare-forward-headers'] || '[]';

      if (!bareHost) {
        res.status(400).json({ error: 'Missing x-bare-host header' });
        return;
      }

      // Build target URL
      const port = barePort && barePort !== '443' && barePort !== '80' ? `:${barePort}` : '';
      const targetUrl = `${bareProtocol}//${bareHost}${port}${barePath}`;

      // Parse headers
      let bareHeaders = {};
      try { bareHeaders = JSON.parse(bareHeadersRaw); } catch(e) {}
      
      let forwardHeaders = [];
      try { forwardHeaders = JSON.parse(bareForwardHeadersRaw); } catch(e) {}

      // Forward specified headers from the request
      const fetchHeaders = { ...bareHeaders };
      for (const header of forwardHeaders) {
        const lower = header.toLowerCase();
        if (req.headers[lower]) {
          fetchHeaders[header] = req.headers[lower];
        }
      }

      // Remove problematic headers
      delete fetchHeaders['host'];
      delete fetchHeaders['Host'];

      // Fetch the target
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(targetUrl, {
        method: req.method === 'POST' ? (fetchHeaders['x-bare-method'] || req.method) : req.method,
        headers: fetchHeaders,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
        redirect: 'manual',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Collect response headers
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Set bare response headers
      res.setHeader('X-Bare-Status', response.status.toString());
      res.setHeader('X-Bare-Status-Text', response.statusText || '');
      res.setHeader('X-Bare-Headers', JSON.stringify(responseHeaders));
      res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');

      // Stream the body
      res.status(200);
      
      if (response.body) {
        const reader = response.body.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        res.end(Buffer.from(result));
      } else {
        res.end();
      }
    } catch (err) {
      console.error('Bare proxy error:', err);
      res.status(500).json({ error: err.message || 'Proxy error' });
    }
    return;
  }

  res.status(404).json({ error: 'Not found' });
}
