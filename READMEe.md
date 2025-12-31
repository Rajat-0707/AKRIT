# AKRIT 

## Overview
This document describes the complete booking and messaging system implemented for the artist booking platform. Users (clients) can now send booking requests to artists, and artists can manage these requests through their dashboard.

---

## Features Implemented

### 1. **User Features (Clients)**
- Browse and view artist profiles
- Send booking requests to artists with detailed event information
- View all sent booking requests in "My Requests" page
- Filter requests by status (All, Pending, Accepted, Rejected)
- Cancel pending booking requests
- See artist responses to their requests

### 2. **Artist Features**
- View all received booking requests in "Received Bookings" page
- Filter received requests by status
- Accept or decline booking requests with optional messages
- Mark accepted bookings as completed
- Quick access from Artist Dashboard

---

## Backend Implementation

### Database Models

#### BookingRequest Model
**Location:** `api/src/models/BookingRequest.js`

**Schema:**
```javascript
{
  client_id: ObjectId (ref: User),
  artist_id: ObjectId (ref: User),
  event_type: String (required),
  event_date: Date (required),
  event_location: String (required),
  budget: Number (optional),
  message: String (required),
  status: String ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
  artist_response: String (optional),
  client_name: String (optional),
  client_email: String (optional),
  client_phone: String (optional),
  timestamps: true
}
```

### API Routes

#### Booking Routes
**Location:** `api/src/routes/bookings.js`

**Endpoints:**

1. **POST /api/bookings**
   - Create a new booking request
   - Auth required: Yes
   - Body: `{ artist_id, event_type, event_date, event_location, budget?, message, client_name?, client_email?, client_phone? }`
   - Response: `{ success, booking, message }`

2. **GET /api/bookings/my-requests**
   - Get all booking requests sent by current user (client view)
   - Auth required: Yes
   - Response: `{ success, bookings: [...] }`

3. **GET /api/bookings/received**
   - Get all booking requests received by current user (artist view)
   - Auth required: Yes
   - Response: `{ success, bookings: [...] }`

4. **GET /api/bookings/:id**
   - Get a specific booking request
   - Auth required: Yes
   - Response: `{ success, booking }`

5. **PATCH /api/bookings/:id/status**
   - Update booking status (artist only)
   - Auth required: Yes (must be the artist)
   - Body: `{ status: 'accepted' | 'rejected' | 'completed', artist_response? }`
   - Response: `{ success, booking, message }`

6. **DELETE /api/bookings/:id**
   - Cancel a pending booking request (client only)
   - Auth required: Yes (must be the client)
   - Response: `{ success, message }`

---

## Frontend Implementation

### Components

#### 1. BookingModal Component
**Location:** `my-app/src/components/BookingModal.jsx`

**Purpose:** Modal form for users to send booking requests to artists

**Features:**
- Event type selection (Wedding, Corporate, Birthday, Concert, etc.)
- Event date picker (future dates only)
- Event location input
- Budget field (optional)
- Detailed message textarea
- Optional contact information override
- Form validation
- Success/error handling

**Props:**
- `artist`: Artist object containing id, name, service, img
- `onClose`: Function to close modal
- `onSuccess`: Function called after successful booking

---

### Pages

#### 1. MyRequests Page
**Location:** `my-app/src/pages/MyRequests.jsx`

**Purpose:** Display all booking requests sent by the current user

**Features:**
- Filter by status (All, Pending, Accepted, Rejected)
- Display artist information
- Show event details (type, date, location, budget)
- Display booking status with color-coded badges
- Show artist responses
- Cancel pending requests
- Empty state when no requests exist
- Responsive grid layout

**Route:** `/my-requests`

---

#### 2. ReceivedBookings Page
**Location:** `my-app/src/pages/ReceivedBookings.jsx`

**Purpose:** Display all booking requests received by the artist

**Features:**
- Filter by status (All, Pending, Accepted, Rejected)
- Display client information
- Show event details with contact information
- Accept/decline requests with optional response message
- Mark accepted bookings as completed
- Empty state for no bookings
- Responsive grid layout

**Route:** `/received-bookings`

**Access:** Artists only

---

#### 3. Artist Profile Updates
**Location:** `my-app/src/pages/ArtistProfile.jsx`

**Updates:**
- "Request Booking" button now opens BookingModal
- Redirects to login if user not authenticated
- Success toast notification after booking sent

---

#### 4. Artist Dashboard Updates
**Location:** `my-app/src/pages/ArtistDashboard.jsx`

**Updates:**
- New "Booking Requests" card with description
- "View Booking Requests" button navigates to `/received-bookings`
- Quick access to manage incoming requests

---

### Navigation Updates

#### Navbar Component
**Location:** `my-app/src/components/Navbar.jsx`

**Updates:**
- Added "My Requests" link for client users (desktop & mobile)
- Link appears only when user is authenticated and not an artist
- Active state highlighting for current route

---

### Routes

#### App.jsx Updates
**Location:** `my-app/src/App.jsx`

**New Routes:**
- `/my-requests` - MyRequests page (for clients)
- `/received-bookings` - ReceivedBookings page (for artists)

---

## User Workflows

### Client Workflow: Sending a Booking Request

1. Browse artists on search page or service pages
2. Click on artist card to view full profile
3. Click "Request Booking" button
4. Fill out booking form:
   - Select event type
   - Choose event date
   - Enter location
   - Add budget (optional)
   - Write detailed message
   - Override contact info if needed
5. Submit request
6. See success notification
7. View request in "My Requests" page

### Client Workflow: Managing Requests

1. Navigate to "My Requests" from navbar
2. View all sent booking requests
3. Filter by status if needed
4. Cancel pending requests if plans change
5. Read artist responses for accepted/rejected requests

### Artist Workflow: Managing Booking Requests

1. Log in as artist
2. Go to Artist Dashboard
3. Click "View Booking Requests" or navigate to "Received Bookings"
4. Review pending requests with full event details
5. For each request:
   - Click "Respond to Request"
   - Optionally add a message
   - Click "Accept Booking" or "Decline"
6. For accepted bookings:
   - Mark as "Completed" when event is done

---

## Status Flow

```
Booking Request Status Flow:

pending → accepted → completed
         ↘ rejected

pending → cancelled (by client)
```

**Status Definitions:**
- **pending**: Initial state, awaiting artist response
- **accepted**: Artist has accepted the booking
- **rejected**: Artist has declined the booking
- **completed**: Event finished, booking fulfilled
- **cancelled**: Client cancelled before artist responded

---

## Styling

### Color Coding for Status Badges

- **Pending**: Yellow/Amber (#fef3c7 bg, #92400e text)
- **Accepted**: Green (#d1fae5 bg, #065f46 text)
- **Rejected**: Red (#fee2e2 bg, #991b1b text)
- **Completed**: Blue (#dbeafe bg, #1e40af text)
- **Cancelled**: Gray (#f3f4f6 bg, #374151 text)

### Design System

- Primary color: Purple gradient (#8b5cf6 to #7c3aed)
- Success color: Green gradient (#10b981 to #059669)
- Danger color: Red (#ef4444)
- Background: Light gradient (#f8fafc to #e2e8f0)
- Cards: White with subtle shadows
- Borders: #e2e8f0

---

## Security Considerations

1. **Authentication Required**: All booking endpoints require valid JWT token
2. **Authorization Checks**: 
   - Clients can only view/cancel their own requests
   - Artists can only manage requests sent to them
   - Status updates restricted to artists only
3. **Data Validation**: Required fields enforced on backend
4. **XSS Protection**: User input sanitized (handled by React)

---

## Testing Recommendations

### Backend Testing
1. Test booking creation with valid/invalid data
2. Test authorization (users can't access others' bookings)
3. Test status update permissions (only artists can update)
4. Test cancellation permissions (only clients can cancel pending)

### Frontend Testing
1. Test booking modal form validation
2. Test responsive layouts on mobile
3. Test filter functionality on both pages
4. Test navigation and routing
5. Test toast notifications
6. Test empty states

---

## Future Enhancements

Potential additions to consider:

1. **Real-time Notifications**: WebSocket for instant booking updates
2. **Email Notifications**: Send emails on booking status changes
3. **Calendar Integration**: Sync bookings with calendar apps
4. **Payment Integration**: Handle deposits or full payments
5. **Review System**: Allow clients to review artists after completion
6. **Messaging System**: Direct chat between clients and artists
7. **Booking Modifications**: Allow editing pending requests
8. **Availability Calendar**: Artists set available/blocked dates
9. **Booking Templates**: Save common event types for reuse
10. **Analytics**: Dashboard stats for artists (bookings over time, revenue)

---

## Files Created/Modified

### Backend Files Created
- `api/src/models/BookingRequest.js` - Database model
- `api/src/routes/bookings.js` - API routes

### Backend Files Modified
- `api/src/index.js` - Added booking routes

### Frontend Files Created
- `my-app/src/components/BookingModal.jsx` - Booking request form
- `my-app/src/components/BookingModal.css` - Modal styles
- `my-app/src/pages/MyRequests.jsx` - Client requests page
- `my-app/src/pages/MyRequests.css` - Requests page styles
- `my-app/src/pages/ReceivedBookings.jsx` - Artist bookings page
- `my-app/src/pages/ReceivedBookings.css` - Received bookings styles

### Frontend Files Modified
- `my-app/src/App.jsx` - Added new routes
- `my-app/src/components/Navbar.jsx` - Added "My Requests" link
- `my-app/src/pages/ArtistProfile.jsx` - Added booking modal integration
- `my-app/src/pages/ArtistProfile.css` - Added toast styles
- `my-app/src/pages/ArtistDashboard.jsx` - Added booking requests card

---

## Database Indexes

The BookingRequest model includes optimized indexes:

```javascript
// Single field indexes
client_id (indexed)
artist_id (indexed)
status (indexed)

// Compound indexes
{ client_id: 1, createdAt: -1 }
{ artist_id: 1, createdAt: -1 }
```

These indexes optimize queries for:
- Fetching user's sent requests (sorted by date)
- Fetching artist's received requests (sorted by date)
- Filtering by status

---

## API Response Examples

### Successful Booking Creation
```json
{
  "success": true,
  "booking": {
    "_id": "67890abcdef...",
    "client_id": { "name": "John Doe", "email": "john@example.com" },
    "artist_id": { "name": "Jane Artist", "email": "jane@example.com" },
    "event_type": "wedding",
    "event_date": "2024-12-25T00:00:00.000Z",
    "event_location": "Mumbai, Grand Hotel",
    "budget": 50000,
    "message": "Looking for a wedding performance...",
    "status": "pending",
    "createdAt": "2024-10-24T13:42:00.000Z",
    "updatedAt": "2024-10-24T13:42:00.000Z"
  },
  "message": "Booking request sent successfully"
}
```

### Get My Requests
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "67890abcdef...",
      "artist_id": {
        "name": "Jane Artist",
        "email": "jane@example.com",
        "category": "singer",
        "city": "Mumbai"
      },
      "event_type": "wedding",
      "event_date": "2024-12-25T00:00:00.000Z",
      "event_location": "Mumbai, Grand Hotel",
      "budget": 50000,
      "message": "Looking for a wedding performance...",
      "status": "pending",
      "createdAt": "2024-10-24T13:42:00.000Z"
    }
  ]
}
```

---

## Conclusion

The booking and messaging system is now fully functional, allowing seamless communication between clients and artists. The system includes comprehensive features for creating, viewing, managing, and responding to booking requests, with a modern, responsive UI and secure backend implementation.
