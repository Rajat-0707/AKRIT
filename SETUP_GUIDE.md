# AKRIT

 its a platform that connects artists like singers, choreographers, etc with comoon people and event organisers. 

## Prerequisites
- Node.js installed
- MongoDB running
- Existing project dependencies installed

## Backend Setup

### 1. No additional dependencies needed
The booking system uses existing dependencies:
- `mongoose` (already installed)
- `express` (already installed)

### 2. Start the API server
```bash
cd api
npm start
# Server runs on http://localhost:4000
```

The booking routes are automatically loaded when the server starts.

## Frontend Setup

### 1. No additional dependencies needed
The booking system uses existing dependencies:
- React Router (already installed)
- Existing UI components

### 2. Start the frontend
```bash
cd my-app
npm run dev
# or
npm start
```

## Database

The `BookingRequest` collection will be created automatically when the first booking is made.

### Indexes
Indexes are automatically created by Mongoose based on the schema definition.

## Testing the System

### As a Client User:

1. **Register/Login as Client**
   - Go to `/auth/client` or `/login`
   - Create account or login

2. **Browse Artists**
   - Navigate to "Find Artists" section
   - Click on any artist card

3. **Send Booking Request**
   - On artist profile, click "Request Booking"
   - Fill out the form:
     - Event Type: Select from dropdown
     - Event Date: Choose future date
     - Location: Enter venue/city
     - Budget: Optional amount
     - Message: Describe your event
   - Submit the request

4. **View Your Requests**
   - Click "My Requests" in the navbar
   - See all your sent booking requests
   - Filter by status
   - Cancel pending requests if needed

### As an Artist User:

1. **Register/Login as Artist**
   - Go to `/auth/artist` or `/login`
   - Create account or login

2. **Access Dashboard**
   - Automatically redirected to `/dashboard`
   - Click "View Booking Requests"

3. **Manage Bookings**
   - View all received booking requests
   - For pending requests:
     - Click "Respond to Request"
     - Add optional message
     - Accept or Decline
   - For accepted bookings:
     - Mark as completed when event is done

## API Endpoints Reference

### Create Booking
```bash
POST http://localhost:4000/api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "artist_id": "artist_mongodb_id",
  "event_type": "wedding",
  "event_date": "2024-12-25",
  "event_location": "Mumbai, Grand Hotel",
  "budget": 50000,
  "message": "Looking for a performer for my wedding...",
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "client_phone": "+91-9876543210"
}
```

### Get My Requests (Client)
```bash
GET http://localhost:4000/api/bookings/my-requests
Authorization: Bearer <token>
```

### Get Received Bookings (Artist)
```bash
GET http://localhost:4000/api/bookings/received
Authorization: Bearer <token>
```

### Update Booking Status (Artist)
```bash
PATCH http://localhost:4000/api/bookings/:bookingId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted",
  "artist_response": "I'd be happy to perform at your event!"
}
```

### Cancel Booking (Client)
```bash
DELETE http://localhost:4000/api/bookings/:bookingId
Authorization: Bearer <token>
```

## Routes Added

### Frontend Routes
- `/my-requests` - View sent booking requests (clients)
- `/received-bookings` - View received bookings (artists)

### API Routes
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-requests` - Get sent bookings
- `GET /api/bookings/received` - Get received bookings
- `GET /api/bookings/:id` - Get specific booking
- `PATCH /api/bookings/:id/status` - Update status
- `DELETE /api/bookings/:id` - Cancel booking

## Troubleshooting

### Issue: "Booking request failed"
- **Solution**: Ensure API server is running on port 4000
- Check browser console for errors
- Verify user is logged in (valid JWT token)

### Issue: "Artist not found"
- **Solution**: Ensure the artist_id is valid
- Check if artist exists in database

### Issue: "Not authorized"
- **Solution**: 
  - Ensure user is logged in
  - Check if token is valid
  - Verify user has permission (client for requests, artist for status updates)

### Issue: Navigation links not showing
- **Solution**: 
  - Clear browser cache
  - Ensure user role is correctly set in localStorage
  - Re-login if necessary

## Environment Variables

No new environment variables are required. The system uses existing configuration.

## File Structure

```
su-1/
├── api/
│   └── src/
│       ├── models/
│       │   └── BookingRequest.js          [NEW]
│       ├── routes/
│       │   └── bookings.js                [NEW]
│       └── index.js                       [MODIFIED]
│
└── my-app/
    └── src/
        ├── components/
        │   ├── BookingModal.jsx           [NEW]
        │   ├── BookingModal.css           [NEW]
        │   └── Navbar.jsx                 [MODIFIED]
        ├── pages/
        │   ├── MyRequests.jsx             [NEW]
        │   ├── MyRequests.css             [NEW]
        │   ├── ReceivedBookings.jsx       [NEW]
        │   ├── ReceivedBookings.css       [NEW]
        │   ├── ArtistProfile.jsx          [MODIFIED]
        │   ├── ArtistProfile.css          [MODIFIED]
        │   └── ArtistDashboard.jsx        [MODIFIED]
        └── App.jsx                        [MODIFIED]
```

## Next Steps

1. **Test the complete flow**:
   - Create a client account
   - Send a booking request
   - Login as the artist
   - Accept/reject the request

2. **Customize as needed**:
   - Modify event types in BookingModal
   - Adjust styling in CSS files
   - Add additional fields to booking form

3. **Deploy**:
   - Ensure environment variables are set for production
   - Update CORS settings in backend
   - Deploy frontend and backend separately

## Support

For issues or questions:
- Check the main documentation: `BOOKING_SYSTEM_DOCUMENTATION.md`
- Review API route implementations
- Check browser console for frontend errors
- Review server logs for backend errors
