import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  // Add cache-busting headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };

  // Handle OPTIONS for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: ""
    };
  }

  // Simple routing based on path
  const path = event.path || "";

  if (path.includes("/ping") || path === "/api/ping") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "pong",
        timestamp: new Date().toISOString(),
        path: event.path,
        method: event.httpMethod,
        version: "1.0.1"
      })
    };
  }

  // Default response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "Netlify API function working!",
      path: event.path,
      method: event.httpMethod,
      timestamp: new Date().toISOString(),
      available_endpoints: ["/api/ping"],
      version: "1.0.1"
    })
  };
};
