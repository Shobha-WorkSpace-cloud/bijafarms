import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace('/.netlify/functions/api', '');
  
  // Simple routing
  if (path === '/ping') {
    return new Response(JSON.stringify({ 
      message: "pong", 
      timestamp: new Date().toISOString() 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  if (path === '/demo') {
    return new Response(JSON.stringify({ 
      message: "Demo endpoint working!",
      path: path
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Default response
  return new Response(JSON.stringify({ 
    error: "Endpoint not found",
    path: path,
    available: ['/ping', '/demo']
  }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
};
