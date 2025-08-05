import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  // Simple test response first
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      message: "Basic Netlify function working!",
      path: event.path,
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    })
  };
};
