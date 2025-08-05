export default async (req: Request) => {
  return new Response(JSON.stringify({ 
    message: "Test function working!",
    timestamp: new Date().toISOString(),
    url: req.url
  }), {
    status: 200,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
