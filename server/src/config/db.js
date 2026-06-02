import mongoose from 'mongoose';

// Cache the connection across serverless invocations. Without this, every warm
// function call would open a new connection and quickly exhaust the Atlas pool.
// `global` survives between invocations on the same warm instance.
let cached = global._animaMongoose;
if (!cached) {
  cached = global._animaMongoose = { conn: null, promise: null };
}

export async function connectDb(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI missing');
  }
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((mongooseInstance) => {
        console.log('Mongo connected');
        return mongooseInstance;
      })
      .catch((err) => {
        // Reset so the next request can retry instead of caching a rejected promise
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
