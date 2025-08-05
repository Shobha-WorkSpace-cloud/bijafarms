import type { Context } from "@netlify/functions";
import serverless from "serverless-http";

// Import the built Express server
export default async (req: Request, context: Context) => {
  try {
    // Dynamically import the built server
    const { createServer } = await import("../../dist/server/netlify-entry.mjs");
    const app = createServer();
    const handler = serverless(app);

    return await handler(req, context);
  } catch (error) {
    console.error("Error loading server:", error);

    // Fallback response
    return new Response(JSON.stringify({
      error: "Server initialization failed",
      message: error.message,
      note: "Check server build and import path",
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
