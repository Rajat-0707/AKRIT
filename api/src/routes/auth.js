import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ArtistProfile from '../models/ArtistProfile.js';
import { authRequired, signToken } from '../middleware/auth.js';
import { upload, getImageUrl } from '../middleware/upload.js';

const router = express.Router();

// POST /api/register
router.post('/register', upload, async (req, res) => {
  try {
    const { role, email, password } = req.body || {};

    // Ensure role is properly extracted from FormData or JSON
    const userRole = role || (req.body.role ? String(req.body.role).trim() : '');

    if (!['artist', 'client'].includes(userRole)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const emailNorm = (email || '').trim().toLowerCase();
    if (!emailNorm || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailNorm)) {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: emailNorm }).lean();
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);

    const userData = {
      role: userRole,
      email: emailNorm,
      password_hash,
      name: (req.body.name || '').trim() || undefined,
      phone: (req.body.phone || '').trim() || undefined,
      category: (req.body.category || '').trim() || undefined,
      city: (req.body.city || '').trim() || undefined,
      portfolio_url: (req.body.portfolio_url || '').trim() || undefined,
      business_type: (req.body.business_type || '').trim() || undefined,
      address_line: (req.body.address_line || '').trim() || undefined,
      state_region: (req.body.state_region || '').trim() || undefined,
      postal_code: (req.body.postal_code || '').trim() || undefined,
      country: (req.body.country || '').trim() || undefined,
    };

    const user = await User.create(userData);

    // If it's an artist registration and a photo was uploaded, create artist profile with image URL
    if (userRole === 'artist' && req.files && req.files.photo && req.files.photo.length > 0) {
      const imageUrl = getImageUrl(req.files.photo[0].filename);
      console.log('Creating ArtistProfile with image URL:', imageUrl);

      const profile = await ArtistProfile.create({
        user_id: user._id,
        img_url: imageUrl,
      });

      console.log('ArtistProfile created successfully:', profile._id);

      return res.status(201).json({
        success: true,
        user: {
          id: user._id,
          role: user.role,
          email: user.email,
          name: user.name || null,
        },
        img: imageUrl, // Include the image URL in response
      });
    }

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name || null,
      },
    });
  } catch (e) {
    console.error('Register error', e);
    return res.status(500).json({ success: false, error: 'Failed to register' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    const emailNorm = (email || '').trim().toLowerCase();
    if (!emailNorm || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    if (role && !['artist', 'client'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const query = role ? { email: emailNorm, role } : { email: emailNorm };
    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = signToken({ sub: String(user._id), email: user.email, role: user.role, name: user.name });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name || null,
        email: user.email,
      },
    });
  } catch (e) {
    console.error('Login error', e);
    return res.status(500).json({ success: false, error: 'DB error' });
  }
});

// GET /api/me
router.get('/me', authRequired, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const user = await User.findById(userId).select('role name email');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, user: { id: user._id, role: user.role, name: user.name || null, email: user.email } });
  } catch (e) {
    console.error('Me error', e);
    return res.status(500).json({ success: false, error: 'DB error' });
  }
});

export default router;
