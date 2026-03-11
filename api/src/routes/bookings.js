import express from 'express';
import BookingRequest from '../models/BookingRequest.js';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

 
router.post('/bookings', authRequired, async (req, res) => {
  try {
    const { artist_id, event_type, event_date, event_location, budget, message, client_name, client_email, client_phone } = req.body;
     
    if (!artist_id || !event_type || !event_date || !event_location || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: artist_id, event_type, event_date, event_location, message' 
      });
    }
 
    const artist = await User.findById(artist_id);
    if (!artist || artist.role !== 'artist') {
      return res.status(404).json({ success: false, error: 'Artist not found' });
    }
 
    const booking = new BookingRequest({
      client_id: req.user.sub,
      artist_id,
      event_type,
      event_date: new Date(event_date),
      event_location,
      budget: budget ? Number(budget) : null,
      message,
      client_name: client_name || req.user.name,
      client_email: client_email || req.user.email,
      client_phone: client_phone || req.user.phone,
    });

    await booking.save();
 
    await booking.populate('artist_id', 'name email');
    await booking.populate('client_id', 'name email');

    res.status(201).json({ 
      success: true, 
      booking,
      message: 'Booking request sent successfully' 
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ success: false, error: 'Failed to create booking request' });
  }
});

 
router.get('/bookings/my-requests', authRequired, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ client_id: req.user.sub })
      .populate('artist_id', 'name email category city')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

  
router.get('/bookings/received', authRequired, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ artist_id: req.user.sub })
      .populate('client_id', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Error fetching received bookings:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch received bookings' });
  }
});

 
router.get('/bookings/:id', authRequired, async (req, res) => {
  try {
    const booking = await BookingRequest.findById(req.params.id)
      .populate('artist_id', 'name email category city')
      .populate('client_id', 'name email phone')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
 
    if (booking.client_id._id.toString() !== req.user.sub && booking.artist_id._id.toString() !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
});

 
router.patch('/bookings/:id/status', authRequired, async (req, res) => {
  try {
    const { status, artist_response } = req.body;
    
    if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const booking = await BookingRequest.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
 
    if (booking.artist_id.toString() !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this booking' });
    }

    booking.status = status;
    if (artist_response) {
      booking.artist_response = artist_response;
    }
    
    await booking.save();

    res.json({ success: true, booking, message: 'Booking status updated' });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ success: false, error: 'Failed to update booking status' });
  }
});
 
router.delete('/bookings/:id', authRequired, async (req, res) => {
  try {
    const booking = await BookingRequest.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
 
    if (booking.client_id.toString() !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Can only cancel pending bookings' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

export default router;
