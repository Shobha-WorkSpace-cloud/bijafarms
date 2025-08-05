export default async (req: Request) => {
  const url = new URL(req.url);
  let path = url.pathname;
  
  // Clean up the path
  if (path.includes('/.netlify/functions/api')) {
    path = path.replace('/.netlify/functions/api', '');
  }
  
  if (!path || path === '/') {
    path = '/ping';
  }
  
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
  };
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }
  
  if (path === '/ping') {
    return new Response(JSON.stringify({ 
      message: "pong", 
      timestamp: new Date().toISOString(),
      status: "working"
    }), { status: 200, headers });
  }
  
  if (path === '/demo') {
    return new Response(JSON.stringify({ 
      message: "Demo endpoint working!",
      path: path,
      timestamp: new Date().toISOString()
    }), { status: 200, headers });
  }
  
  return new Response(JSON.stringify({ 
    error: "Endpoint not found",
    path: path,
    available: ['/ping', '/demo']
  }), { status: 404, headers });
};
