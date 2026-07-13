// Bare Server v3 implementation as Vercel Serverless Function
// Handles HTTP proxy requests without WebSocket (works when Wisp/WebSocket is blocked)

module.exports = async function handler(req, res) {
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

  // Parse the path after /api/bare/
  const fullUrl = req.url || '';
  const pathMatch = fullUrl.match(/\/api\/bare\/(.*)/);
  const subPath = pathMatch ? pathMatch[1] : '';

  // Root: return server info
  if (!subPath || subPath === '/' || subPath === '') {
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
  if (subPath.startsWith('v3')) {
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

      // Parse headers to forward
      let bareHeaders = {};
      try { bareHeaders = JSON.parse(bareHeadersRaw); } catch(e) {}
      
      let forwardHeaders = [];
      try { forwardHeaders = JSON.parse(bareForwardHeadersRaw); } catch(e) {}

      // Build fetch headers
      const fetchHeaders = { ...bareHeaders };
      for (const header of forwardHeaders) {
        const lower = header.toLowerCase();
        if (req.headers[lower]) {
          fetchHeaders[header] = req.headers[lower];
        }
      }

      // Remove host header (will be set by fetch)
      delete fetchHeaders['host'];
      delete fetchHeaders['Host'];

      // Collect request body for non-GET requests
      let body = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        if (chunks.length > 0) {
          body = Buffer.concat(chunks);
        }
      }

      // Fetch the target URL
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: fetchHeaders,
        body: body,
        redirect: 'manual',
      });

      // Collect response headers
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Set bare response headers
      res.setHeader('X-Bare-Status', response.status.toString());
      res.setHeader('X-Bare-Status-Text', response.statusText || '');
      res.setHeader('X-Bare-Headers', JSON.stringify(responseHeaders));

      // Stream the response body
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.status(200).end(buffer);
    } catch (err) {
      console.error('Bare proxy error:', err);
      res.status(500).json({ error: err.message || 'Proxy error' });
    }
    return;
  }

  res.status(404).json({ error: 'Not found' });
};
