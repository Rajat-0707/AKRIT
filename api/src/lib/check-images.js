import mongoose from 'mongoose';
import dotenv from 'dotenv';
 
dotenv.config();
 
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/su1';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
 
async function checkImageStorage() {
  try { 
    const User = (await import('../models/User.js')).default;
    const ArtistProfile = (await import('../models/ArtistProfile.js')).default;

    console.log('Checking for artists with profile images...');
 
    const artists = await User.find({ role: 'artist' }).lean();
    console.log(`Found ${artists.length} artists`);

    for (const artist of artists) { 
      const profile = await ArtistProfile.findOne({ user_id: artist._id }).lean();

      if (profile && profile.img_url) {
        console.log(`Artist: ${artist.name || artist.email}`);
        console.log(`Image URL: ${profile.img_url}`);
        console.log('---');
      } else if (profile) {
        console.log(`Artist: ${artist.name || artist.email} - No image URL stored`);
        console.log('---');
      }
    }

    if (artists.length === 0) {
      console.log('No artists found in database. Register an artist first to test image storage.');
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}
 
connectDB().then(() => checkImageStorage());
