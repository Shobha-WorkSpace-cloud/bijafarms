export default async (req: Request) => {
  return new Response(JSON.stringify({ 
    message: "Demo endpoint working!",
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  }), {
    status: 200,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
