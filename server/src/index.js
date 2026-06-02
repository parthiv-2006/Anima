// Local development entry point. In production the app runs as a Vercel
// serverless function (see /api/index.mjs), which imports ./app.js directly.
import 'dotenv/config';
import app from './app.js';
import { connectDb } from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDb(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect DB', err);
    process.exit(1);
  });
