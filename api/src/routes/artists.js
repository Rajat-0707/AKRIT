import express from 'express';
import User from '../models/User.js';
import ArtistProfile from '../models/ArtistProfile.js';

const router = express.Router();

// GET /api/artists
// Query params: q, service, location, minBudget, maxBudget, limit, offset
router.get('/artists', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const service = (req.query.service || '').trim();
    const location = (req.query.location || '').trim();
    const minBudget = req.query.minBudget !== undefined ? Number(req.query.minBudget) : undefined;
    const maxBudget = req.query.maxBudget !== undefined ? Number(req.query.maxBudget) : undefined;
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    // Build base user filter
    const userMatch = { role: 'artist' };
    if (q) {
      userMatch.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }
    if (service) {
      userMatch.category = service;
    }
    if (location) {
      userMatch.city = { $regex: location, $options: 'i' };
    }

    // Aggregate to left join artist profile
    const pipeline = [
      { $match: userMatch },
      {
        $lookup: {
          from: ArtistProfile.collection.name,
          localField: '_id',
          foreignField: 'user_id',
          as: 'profile',
        },
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    ];

    // Apply budget filters if provided
    if (minBudget !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            { 'profile.budget_min': { $gte: minBudget } },
            { 'profile.budget_max': { $gte: minBudget } },
          ],
        },
      });
    }
    if (maxBudget !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            { 'profile.budget_max': { $lte: maxBudget } },
            { 'profile.budget_min': { $lte: maxBudget } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { _id: -1 } });
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });

    const rows = await User.aggregate(pipeline);

    const items = rows.map((row) => {
      const item = {
        id: row._id,
        name: row.name || null,
        role: 'artist',
        service: row.category || null,
        budget_min: row?.profile?.budget_min ?? null,
        budget_max: row?.profile?.budget_max ?? null,
        rating: row?.profile?.rating_avg ?? null,
        reviews: row?.profile?.reviews_count ?? 0,
        location: row.city || null,
        img: row?.profile?.img_url ?? null,
        bio: row?.profile?.bio ?? null,
      };

      if (row?.profile?.img_url) {
        console.log('Artist image URL retrieved:', row?.profile?.img_url);
      }

      return item;
    });

    console.log(`Returning ${items.length} artists`);
    return res.json({ success: true, items, count: items.length });
  } catch (e) {
    console.error('Artists list error', e);
    return res.status(500).json({ success: false, error: 'DB error' });
  }
});

export default router;
