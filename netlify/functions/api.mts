import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);
    let path = url.pathname;

    // Clean up the path - remove function prefix
    if (path.includes('/.netlify/functions/api')) {
      path = path.replace('/.netlify/functions/api', '');
    }

    // Handle empty path
    if (!path || path === '/') {
      path = '/ping';
    }

    console.log('API Function called with path:', path);

    // Add CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    };

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers });
    }

    // Simple routing
    if (path === '/ping') {
      return new Response(JSON.stringify({
        message: "pong",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
      }), {
        status: 200,
        headers,
      });
    }

    if (path === '/demo') {
      return new Response(JSON.stringify({
        message: "Demo endpoint working!",
        path: path,
        method: req.method,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers,
      });
    }

    // Default response
    return new Response(JSON.stringify({
      error: "Endpoint not found",
      path: path,
      method: req.method,
      available: ['/ping', '/demo'],
      fullUrl: req.url
    }), {
      status: 404,
      headers,
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
