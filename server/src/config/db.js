import mongoose from 'mongoose';

export async function connectDb(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI missing');
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
  console.log('Mongo connected');
}
