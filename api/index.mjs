// Vercel serverless entry point. All /api/* requests are routed here by the
// rewrite in vercel.json. The Express app handles its own internal routing.
import app from '../server/src/app.js';
import { connectDb } from '../server/src/config/db.js';

export default async function handler(req, res) {
  await connectDb(process.env.MONGODB_URI);
  return app(req, res);
}
