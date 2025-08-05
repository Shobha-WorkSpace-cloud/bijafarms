export default async (req: Request) => {
  return new Response(JSON.stringify({ 
    message: "pong", 
    timestamp: new Date().toISOString(),
    status: "working from Netlify!"
  }), {
    status: 200,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
