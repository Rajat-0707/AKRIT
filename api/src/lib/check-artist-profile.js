import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
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

// Check artist profile data
async function checkArtistProfiles() {
  try {
    // Import models after connection
    const User = (await import('../models/User.js')).default;
    const ArtistProfile = (await import('../models/ArtistProfile.js')).default;

    console.log('Checking artist profiles...');

    // Find all users with artist role
    const artists = await User.find({ role: 'artist' }).lean();
    console.log(`Found ${artists.length} artists`);

    for (const artist of artists) {
      console.log(`\n--- Artist: ${artist.name || artist.email} ---`);
      console.log(`User ID: ${artist._id}`);
      console.log(`Email: ${artist.email}`);

      // Find their profile
      const profile = await ArtistProfile.findOne({ user_id: artist._id }).lean();

      if (profile) {
        console.log('Profile found:');
        console.log(`  Image URL: ${profile.img_url || 'NO IMAGE URL'}`);
        console.log(`  Bio: ${profile.bio || 'No bio'}`);
        console.log(`  Budget Min: ${profile.budget_min || 'Not set'}`);
        console.log(`  Budget Max: ${profile.budget_max || 'Not set'}`);
      } else {
        console.log('NO PROFILE FOUND for this artist');
      }
    }

    if (artists.length === 0) {
      console.log('No artists found in database. Register an artist first to test profile functionality.');
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the check
connectDB().then(() => checkArtistProfiles());
