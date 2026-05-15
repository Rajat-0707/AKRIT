# Redis - Implementation Roadmap & Visual Guide

## 🗺️ Redis Usage Map - Current vs Recommended

```
CURRENT IMPLEMENTATION:
├─ Artist Profile Cache ✓
│  ├─ Key: artist:${user_id}
│  ├─ TTL: 1 hour
│  └─ Issue: NOT invalidated on update ❌
│
├─ Booking Lists Cache ✓
│  ├─ my_bookings - client side
│  ├─ received_bookings - artist side
│  ├─ TTL: 1 hour
│  └─ Issue: NOT invalidated on any changes ❌
│
└─ Artist Search Results ✗
   └─ Missing: No caching at all ❌


RECOMMENDED ENHANCEMENTS:
├─ Fix Cache Invalidation (CRITICAL)
│  ├─ Invalidate artist cache on profile update
│  ├─ Invalidate booking caches on CRUD operations
│  └─ Use redis.del() to clear outdated data
│
├─ Add Rate Limiting (HIGH)
│  ├─ Login attempt tracking
│  ├─ Registration throttling
│  └─ Prevent brute force attacks
│
├─ Add Search Caching (HIGH)
│  ├─ Cache aggregation results
│  ├─ Clear on artist profile changes
│  └─ TTL: 30-60 minutes
│
├─ Session Token Management (MEDIUM)
│  ├─ Token blacklist on logout
│  ├─ Preventing JWT reuse after logout
│  └─ TTL: Until token expiry
│
└─ Future Features (LOW)
   ├─ Real-time notifications queue
   ├─ Online status tracking
   └─ Search trending data
```

---

## 🚦 Data Flow & Caching Issues

### CURRENT PROBLEM: Booking Status Update Flow
```
┌─────────────────────────────────────────────────────────────┐
│ User A (Artist) Updates Booking Status: Pending → Accepted  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    [API: PATCH /bookings/:id/status]
                              ↓
                    [Update MongoDB Database] ✓
                              ↓
                    [Return Response to API] ✓
                              ↓
         ❌ PROBLEM: Redis Cache NOT Invalidated ❌
                              ↓
    ┌──────────────────────────────────────────┐
    │ User B (Client) Views Their Bookings     │
    │ [API: GET /bookings/my-requests]         │
    │                                          │
    │ ✓ Cache Hit: Serves STALE data          │
    │ ✗ Shows Status: Still "PENDING"         │
    │ ✗ User Confused: Doesn't see update     │
    │ ⏰ Until cache expires (1 hour later)   │
    └──────────────────────────────────────────┘
```

### CORRECT FLOW WITH FIX:
```
┌─────────────────────────────────────────────────────────────┐
│ User A (Artist) Updates Booking Status: Pending → Accepted  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    [API: PATCH /bookings/:id/status]
                              ↓
                    [Update MongoDB Database] ✓
                              ↓
      [INVALIDATE: Clear Redis cache keys] ✓ FIX
                              ↓
              client.del(`artist:${artist_id}:received_bookings`)
              client.del(`client:${client_id}:my_bookings`)
                              ↓
                    [Return Response to API] ✓
                              ↓
    ┌──────────────────────────────────────────┐
    │ User B (Client) Views Their Bookings     │
    │ [API: GET /bookings/my-requests]         │
    │                                          │
    │ ✗ Cache Miss (was cleared)              │
    │ ✓ Query Fresh Database                  │
    │ ✓ Shows Status: "ACCEPTED"              │
    │ ✓ User Happy: Sees real-time update     │
    └──────────────────────────────────────────┘
```

---

## 📝 Quick Fix Checklist

### Files to Modify

#### 1. `/api/src/routes/bookings.js` - Three places need fixes:

**Fix #1: After booking CREATE (line 48-50)**
```javascript
// BEFORE:
await booking.save();
res.status(201).json({ ... });

// AFTER:
await booking.save();
// Clear caches
await client.del(`client:${req.user.sub}:my_bookings`);
await client.del(`artist:${artist_id}:received_bookings`);
res.status(201).json({ ... });
```

**Fix #2: After booking status UPDATE (line 148)**
```javascript
// BEFORE:
await booking.save();
res.json({ success: true, booking, message: 'Booking status updated' });

// AFTER:
await booking.save();
// Clear caches
await client.del(`artist:${req.user.sub}:received_bookings`);
await client.del(`client:${booking.client_id}:my_bookings`);
res.json({ success: true, booking, message: 'Booking status updated' });
```

**Fix #3: After booking CANCEL (line 170)**
```javascript
// BEFORE:
booking.status = 'cancelled';
await booking.save();
res.json({ success: true, message: 'Booking cancelled successfully' });

// AFTER:
booking.status = 'cancelled';
await booking.save();
// Clear caches
await client.del(`artist:${booking.artist_id}:received_bookings`);
await client.del(`client:${req.user.sub}:my_bookings`);
res.json({ success: true, message: 'Booking cancelled successfully' });
```

#### 2. `/api/src/routes/artist.js` - One place needs a fix:

**Fix: After profile UPDATE (around line 95)**
```javascript
// BEFORE:
if (Object.keys(updateProfile).length > 0) {
  await ArtistProfile.updateOne(...);
}
res.json({ success: true, message: 'Artist profile updated successfully' });

// AFTER:
if (Object.keys(updateProfile).length > 0) {
  await ArtistProfile.updateOne(...);
}
// Clear artist cache
await client.del(`artist:${userId}`);
res.json({ success: true, message: 'Artist profile updated successfully' });
```

---

## 🎯 After Critical Fixes, Add These Enhancements

### Enhancement 1: Rate Limiting on Login ([auth.js](auth.js))
```javascript
// Add this middleware function:
const checkLoginRateLimit = async (email) => {
  const key = `rate_limit:login:${email.toLowerCase()}`;
  const attempts = await client.incr(key);
  
  if (attempts === 1) {
    await client.expire(key, 900); // 15 minute window
  }
  
  return attempts;
};

// In login endpoint, before password check:
const attempts = await checkLoginRateLimit(emailNorm);
if (attempts > 5) {
  return res.status(429).json({ 
    success: false, 
    error: 'Too many login attempts. Try again in 15 minutes.' 
  });
}

// After successful login, clear the counter:
await client.del(`rate_limit:login:${emailNorm}`);
```

### Enhancement 2: Cache Artist Search Results ([artists.js](artists.js))
```javascript
// Add at the beginning of GET /artists:
const cacheKey = `artists:search:${JSON.stringify(req.query)}`;
const cached = await client.get(cacheKey);
if (cached) {
  return res.json(JSON.parse(cached));
}

// ... run aggregation ...

// Before sending response, add to cache:
await client.set(cacheKey, JSON.stringify({success: true, items, count: items.length}), 'EX', 1800);
res.json({ success: true, items, count: items.length });

// When artist updates profile (in artist.js), add:
await client.del(/artists:search:.*/); // Clear all search caches
```

---

## 📊 Cache Key Reference

| Key Pattern | Where Used | TTL | Invalidated When |
|------------|-----------|-----|-----------------|
| `artist:${user_id}` | artist.js - GET /artist/me | 1h | Artist updates profile |
| `client:${user_id}:my_bookings` | bookings.js - GET /my-requests | 1h | Booking created/updated/cancelled |
| `artist:${user_id}:received_bookings` | bookings.js - GET /received | 1h | Booking created/updated/cancelled |
| `artists:search:*` | artists.js - GET /artists | 30m | Any artist updates profile |
| `rate_limit:login:${email}` | auth.js - POST /login | 15m | Timeout or successful login |
| `blacklist:${token}` | auth.js - logout | token_ttl | N/A (automatic expiry) |

---

## ✅ Validation Checklist

After implementing fixes, verify:

- [ ] Create a booking → Check that artist receives notification immediately (not after 1 hour)
- [ ] Accept a booking → Check that client sees new status immediately
- [ ] Cancel a booking → Check that artist's list updates immediately
- [ ] Update artist profile → Check that profile shows new info immediately
- [ ] Test 6 failed logins → Account should be locked for 15 minutes
- [ ] Search with same filters twice → Second search should be faster (cached)
- [ ] Try same login token after logout → Should return "Token invalidated" error

---

## ⚠️ Common Redis Issues You Might Face

| Issue | Cause | Solution |
|-------|-------|----------|
| Changes don't appear | Cache not invalidated | Add `client.del()` calls |
| Cache contains old data | No TTL set | Set TTL with `EX` parameter |
| Rate limiting doesn't work | Key doesn't expire | Use `expire()` or `EX` parameter |
| Redis connection errors | Wrong `REDIS_URL` | Check `.env` file, verify Redis running |
| Memory issues | Cache growing indefinitely | Check TTLs, implement cache eviction |

---

## 🔗 Redis Best Practices

1. **Always Invalidate Related Caches**
   - When user updates profile, clear all caches related to that user
   - When booking changes, clear both artist AND client caches

2. **Use Consistent Key Naming**
   - Use patterns like: `entity:user_id:action`
   - Example: `artist:123:profile`, `bookings:456:received`

3. **Set TTLs Always**
   - Never set cache without expiry time
   - Use format: `await client.set(key, value, 'EX', seconds)`

4. **Handle Cache Failures Gracefully**
   - If Redis is down, should still work (fallback to DB)
   - Current code would crash - add try-catch

5. **Log Cache Operations**
   - Log cache hits/misses to monitor effectiveness
   - Log cache invalidations for debugging

---

## 📚 Implementation Priority

```
Week 1: 🔴 CRITICAL
├─ Fix booking creation cache invalidation
├─ Fix booking update cache invalidation
├─ Fix booking cancel cache invalidation
└─ Fix artist profile update cache invalidation

Week 2: 🟡 HIGH
├─ Add rate limiting to auth routes
├─ Add artist search caching
└─ Test and validate all changes

Week 3+: 🟢 OPTIONAL
├─ Add logout token blacklist
├─ Add real-time notifications
└─ Add advanced caching strategies
```
