# Redis Implementation Analysis - AKRIT Project

## Current Redis Usage

### 1. **Artist Profile Caching** ([api/src/routes/artist.js](api/src/routes/artist.js#L15-L45))
- **Location**: `/artist/me` endpoint
- **Cache Key**: `artist:${user_id}`
- **TTL**: 1 hour
- **Purpose**: Cache artist profile data

### 2. **Booking Caching** ([api/src/routes/bookings.js](api/src/routes/bookings.js#L62-L75))
- **Locations**: 
  - `/bookings/my-requests` - Client's booking requests
  - `/bookings/received` - Artist's received bookings
- **Cache Keys**: 
  - `client:${user_id}:my_bookings`
  - `artist:${user_id}:received_bookings`
- **TTL**: 1 hour
- **Purpose**: Cache booking lists for faster retrieval

---

## ⚠️ CRITICAL PROBLEMS WITH CURRENT IMPLEMENTATION

### **1. NO CACHE INVALIDATION** ❌
This is the **BIGGEST ISSUE** causing stale data problems:

#### Problem in [bookings.js](api/src/routes/bookings.js):
- **Creating a booking** (line 48): Cache is NOT invalidated for both client and affected artist
  - Client's `client:${client_id}:my_bookings` should be cleared
  - Artist's `artist:${artist_id}:received_bookings` should be cleared

- **Updating booking status** (line 125-148): Cache is NOT invalidated
  - Should invalidate `artist:${artist_id}:received_bookings`
  - Should invalidate `client:${client_id}:my_bookings`

- **Cancelling a booking** (line 151-170): Cache is NOT invalidated
  - Should invalidate both affected user caches

#### Problem in [artist.js](api/src/routes/artist.js):
- **Updating artist profile** (line 55+): Cache is NOT invalidated
  - When profile updates, `artist:${user_id}` should be cleared
  - But the code doesn't invalidate the cache after update

### **2. Inconsistent Data Issues**
- User updates artist profile → old cached profile still served for 1 hour
- User creates booking → old cached booking list shown (missing new booking)
- User accepts/rejects booking → old cached status still shown
- This can lead to UX confusion and incorrect business logic

### **3. Inefficient Caching**
- [artists.js](api/src/routes/artists.js) - The `/artists` endpoint with complex filtering doesn't use any caching
  - Large aggregation pipeline runs for every request
  - No caching of search results

---

## 📍 WHERE REDIS SHOULD BE USED

### **Priority 1: CRITICAL - Cache Invalidation (Fix Current Issues)**

1. **Booking Operations Cache Invalidation**
   ```
   When booking is created:
   - Clear: client:${client_id}:my_bookings
   - Clear: artist:${artist_id}:received_bookings

   When booking status changes:
   - Clear: artist:${artist_id}:received_bookings
   - Clear: client:${client_id}:my_bookings

   When booking is cancelled:
   - Clear: artist:${artist_id}:received_bookings
   - Clear: client:${client_id}:my_bookings
   ```
   **Location**: [api/src/routes/bookings.js](api/src/routes/bookings.js)

2. **Artist Profile Update Invalidation**
   ```
   When artist profile updates:
   - Clear: artist:${user_id}
   ```
   **Location**: [api/src/routes/artist.js](api/src/routes/artist.js#L55)

---

### **Priority 2: HIGH - New Caching Opportunities**

1. **Artist List Caching** (Search Results)
   - **Where**: [api/src/routes/artists.js](api/src/routes/artists.js#L10)
   - **What to cache**: Filtered artist search results
   - **Cache Key Pattern**: `artists:search:${hash(query+service+location+filters)}`
   - **TTL**: 30-60 minutes
   - **Benefit**: Avoid expensive aggregation pipeline for repeated searches
   - **Invalidation**: Clear when any artist updates profile

2. **Rate Limiting** (Login/Registration Brute Force Protection)
   - **Where**: [api/src/routes/auth.js](api/src/routes/auth.js)
   - **Implementation**: 
     ```
     Key: rate_limit:${email}:login
     Value: attempt_count
     TTL: 15 minutes
     Limit: 5 failed attempts
     ```
   - **Benefit**: Prevent brute force attacks

3. **Session Token Blacklist** (for Logout)
   - **Where**: [api/src/routes/auth.js](api/src/routes/auth.js)
   - **Implementation**:
     ```
     Key: blacklist:${jwt_token}
     Value: timestamp
     TTL: token_expiry_time
     ```
   - **Benefit**: Proper logout functionality

---

### **Priority 3: MEDIUM - Enhancement Features**

1. **Popular Artists Caching**
   - Cache top-rated or featured artists
   - **Key**: `featured:artists`
   - **TTL**: 2-4 hours

2. **User Profile Caching** (for quick lookups)
   - Currently not cached for general users
   - **Key**: `user:${user_id}`
   - **TTL**: 1-2 hours

3. **Booking Stats Caching**
   - Cache aggregate stats (total bookings, completion rate)
   - **Key**: `stats:artist:${artist_id}`
   - **TTL**: 1 hour

4. **Real-time Notifications Queue**
   - Store pending notifications
   - **Key**: `notifications:${user_id}`
   - **Type**: List (LPUSH/RPOP)

---

### **Priority 4: LOW - Optional Features**

1. **Online Status Tracking**
   - Track which artists are online
   - **Key**: `online:artist:${artist_id}`
   - **TTL**: 5 minutes (auto-refresh on activity)

2. **Search Query Caching**
   - Cache frequent search queries
   - **Key**: `search:trending`
   - **Type**: Sorted Set

---

## 📋 Implementation Checklist

### Immediate Fixes Needed:
- [ ] Add cache invalidation in [bookings.js](api/src/routes/bookings.js) - POST, PATCH, DELETE endpoints
- [ ] Add cache invalidation in [artist.js](api/src/routes/artist.js) - POST/PUT update endpoint

### Next Steps:
- [ ] Add rate limiting middleware to auth routes
- [ ] Implement artist search result caching
- [ ] Add session token blacklist functionality
- [ ] Add cache utility functions for consistent key management

---

## ⚡ Quick Fix Summary for Cache Invalidation

### In [bookings.js](api/src/routes/bookings.js):

**After creating a booking (line 48-50):**
```javascript
await client.del(`client:${req.user.sub}:my_bookings`);
await client.del(`artist:${artist_id}:received_bookings`);
```

**After updating booking status (line 148):**
```javascript
await client.del(`artist:${booking.artist_id}:received_bookings`);
await client.del(`client:${booking.client_id}:my_bookings`);
```

**After cancelling booking (line 163):**
```javascript
await client.del(`artist:${booking.artist_id}:received_bookings`);
await client.del(`client:${booking.client_id}:my_bookings`);
```

### In [artist.js](api/src/routes/artist.js#L95):

**After updating artist profile:**
```javascript
await client.del(`artist:${userId}`);
```

---

## 🔍 Additional Notes

- **Redis Client**: Using `ioredis` library (already installed)
- **Connection**: Uses `REDIS_URL` environment variable
- **Error Handling**: Currently logs errors but doesn't handle them gracefully
- **Consider adding**: Redis connection error recovery and retry logic
