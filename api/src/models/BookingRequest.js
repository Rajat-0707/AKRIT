import mongoose from 'mongoose';

const BookingRequestSchema = new mongoose.Schema(
  {
    client_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    artist_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    event_type: { 
      type: String, 
      required: true 
    },
    event_date: { 
      type: Date, 
      required: true 
    },
    event_location: { 
      type: String, 
      required: true 
    },
    budget: { 
      type: Number 
    },
    message: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], 
      default: 'pending',
      index: true
    },
    artist_response: { 
      type: String 
    },
    client_name: { 
      type: String 
    },
    client_email: { 
      type: String 
    },
    client_phone: { 
      type: String 
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
BookingRequestSchema.index({ client_id: 1, createdAt: -1 });
BookingRequestSchema.index({ artist_id: 1, createdAt: -1 });

export default mongoose.model('BookingRequest', BookingRequestSchema);
