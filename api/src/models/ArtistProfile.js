import mongoose from 'mongoose';

const ArtistProfileSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true, required: true },
    img_url: { type: String },
    bio: { type: String },
    budget_min: { type: Number },
    budget_max: { type: Number },
    availability_status: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
    rating_avg: { type: Number },
    reviews_count: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('ArtistProfile', ArtistProfileSchema);
