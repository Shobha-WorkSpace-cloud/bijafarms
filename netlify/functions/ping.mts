import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  return new Response(JSON.stringify({ 
    message: "pong", 
    timestamp: new Date().toISOString() 
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const config: Config = {
  path: "/api/ping"
};
