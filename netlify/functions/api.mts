import type { Context } from "@netlify/functions";
import serverless from "serverless-http";
import { createServer } from "../../server/index.js";

const app = createServer();
const handler = serverless(app);

export default async (request: Request, context: Context) => {
  return await handler(request, context);
};
