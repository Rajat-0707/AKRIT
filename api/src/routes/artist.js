import express from 'express';
import User from '../models/User.js';
import ArtistProfile from '../models/ArtistProfile.js';
import { authRequired } from '../middleware/auth.js';
import { upload, getImageUrl } from '../middleware/upload.js';

const router = express.Router();

// GET /api/artist/me - Only for artist role
router.get('/artist/me', authRequired, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const user = await User.findById(userId).select('role name email category city');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role !== 'artist') return res.status(403).json({ success: false, error: 'Not an artist account' });

    const profile = await ArtistProfile.findOne({ user_id: user._id }).lean();

    const resp = {
      id: user._id,
      role: user.role,
      name: user.name || null,
      email: user.email,
      service: user.category || null,
      city: user.city || null,
      img: profile?.img_url ?? null,
      bio: profile?.bio ?? null,
      budget_min: profile?.budget_min ?? null,
      budget_max: profile?.budget_max ?? null,
      availability: profile?.availability_status ?? null,
      rating: profile?.rating_avg ?? null,
      reviews: profile?.reviews_count ?? 0,
    };

    return res.json({ success: true, artist: resp });
  } catch (e) {
    console.error('Artist me error', e);
    return res.status(500).json({ success: false, error: 'DB error' });
  }
});

// POST /api/artist/update - Update artist and profile
router.post('/artist/update', authRequired, upload, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const user = await User.findById(userId).select('role');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role !== 'artist') return res.status(403).json({ success: false, error: 'Not an artist account' });

    const body = req.body || {};
    const updateUser = {};
    if (body.name !== undefined) updateUser.name = String(body.name).trim();
    if (body.city !== undefined) updateUser.city = String(body.city).trim();
    if (body.service !== undefined) updateUser.category = String(body.service).trim();

    const updateProfile = {};
    if (body.bio !== undefined) updateProfile.bio = String(body.bio);
    if (body.img !== undefined) updateProfile.img_url = String(body.img);

    // Handle photo upload
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      const imageUrl = getImageUrl(req.files.photo[0].filename);
      updateProfile.img_url = imageUrl;
    }

    const hasMin = body.budget_min !== undefined && body.budget_min !== '';
    const hasMax = body.budget_max !== undefined && body.budget_max !== '';

    if (hasMin) updateProfile.budget_min = Math.max(0, Number(body.budget_min));
    if (hasMax) updateProfile.budget_max = Math.max(0, Number(body.budget_max));

    if (hasMin && hasMax && updateProfile.budget_min > updateProfile.budget_max) {
      return res.status(400).json({ success: false, error: 'budget_min cannot exceed budget_max' });
    }

    if (body.availability !== undefined) {
      const v = String(body.availability);
      const allowed = ['available', 'busy', 'unavailable'];
      if (!allowed.includes(v)) {
        return res.status(400).json({ success: false, error: 'Invalid availability value' });
      }
      updateProfile.availability_status = v;
    }

    // Transaction-like sequence; Mongo single ops are atomic per document
    if (Object.keys(updateUser).length > 0) {
      await User.updateOne({ _id: userId }, { $set: updateUser });
    }

    if (Object.keys(updateProfile).length > 0) {
      console.log('Updating ArtistProfile with data:', updateProfile);
      await ArtistProfile.updateOne(
        { user_id: userId },
        { $set: { user_id: userId, ...updateProfile } },
        { upsert: true }
      );
      console.log('ArtistProfile updated successfully');
    }

    // Return the updated image URL if a new photo was uploaded
    const response = { success: true };
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      response.img = getImageUrl(req.files.photo[0].filename);
      console.log('New image URL generated:', response.img);
    }

    return res.json(response);
  } catch (e) {
    console.error('Artist update error', e);
    return res.status(500).json({ success: false, error: 'DB error' });
  }
});

export default router;
