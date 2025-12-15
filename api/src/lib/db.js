import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/su1_app';

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI, {
    // options can be added if needed
  });
  console.log('Connected to MongoDB');
}
