import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['artist', 'client'], required: true },
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    category: { type: String }, // service
    city: { type: String },
    portfolio_url: { type: String },
    business_type: { type: String },
    address_line: { type: String },
    state_region: { type: String },
    postal_code: { type: String },
    country: { type: String },
    password_hash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
