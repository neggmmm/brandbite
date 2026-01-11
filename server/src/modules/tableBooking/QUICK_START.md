# Table Booking System - Quick Start Guide

## Installation & Setup

### 1. Already Installed

All code has been integrated into the existing tableBooking module. No additional packages needed.

### 2. Configure Restaurant Settings

Add booking rules to your restaurant document:

```javascript
systemSettings: {
  tableBookings: {
    enabled: true,
    maxGuests: 100,
    defaultDurationMinutes: 120,  // 2 hours
    bufferMinutesBetweenBookings: 15  // 15 min cleanup
  }
}
```

### 3. Create Tables

```bash
POST /api/restaurants/rest_123/tables
{
  "restaurantId": "rest_123",
  "name": "Table 1",
  "capacity": 4,
  "location": "Window",
  "positionX": 100,
  "positionY": 100
}
```

---

## Basic Workflow Example

### Step 1: Customer Books

```bash
POST /api/restaurants/rest_123/bookings
{
  "restaurantId": "rest_123",
  "date": "2025-01-25",
  "startTime": "19:00",
  "guests": 4,
  "customerEmail": "john@example.com",
  "customerName": "John Doe"
}
```

Status: **pending** ⏳

---

### Step 2: Cashier Reviews

```bash
GET /api/restaurants/rest_123/bookings/today
```

Shows pending bookings waiting for confirmation.

---

### Step 3: Cashier Checks Availability

```bash
GET /api/restaurants/rest_123/tables/availability?date=2025-01-25&time=19:00&guests=4
```

Returns available tables.

---

### Step 4: Cashier Confirms

```bash
POST /api/restaurants/rest_123/bookings/:bookingId/confirm
{
  "tableIds": ["table_1"]
}
```

Status: **confirmed** ✅
Table Status: **reserved** 🔒

---

### Step 5: Guest Arrives

```bash
PATCH /api/restaurants/rest_123/bookings/:bookingId/seated
```

Status: **seated** 🪑
Table Status: **occupied** 👥

---

### Step 6: Guest Leaves

```bash
PATCH /api/restaurants/rest_123/bookings/:bookingId/complete
```

Status: **completed** ✓
Table Status: **available** ✨

---

## Common Operations

### Check If You Have Active Bookings

```bash
GET /api/restaurants/rest_123/bookings/customer?customerEmail=john@example.com
```

### Cancel Your Booking

```bash
DELETE /api/restaurants/rest_123/bookings/:bookingId?customerEmail=john@example.com
```

### Get Available Tables for 4 Guests at 7 PM

```bash
GET /api/restaurants/rest_123/tables/availability?date=2025-01-25&time=19:00&guests=4
```

### Mark Table for Cleaning

```bash
PATCH /api/restaurants/rest_123/tables/:tableId/cleaning
```

### Mark Table Ready Again

```bash
PATCH /api/restaurants/rest_123/tables/:tableId/available
```

### View Floor Plan

```bash
GET /api/restaurants/rest_123/tables/floor-plan
```

### Get Today's Occupancy Stats

```bash
GET /api/restaurants/rest_123/tables/stats?date=2025-01-25
```

---

## Role Permissions Quick Reference

### Customer Can:

- ✅ Create booking (status: pending)
- ✅ View own bookings
- ✅ Cancel own booking
- ❌ Confirm booking
- ❌ Update table status
- ❌ See admin stats

### Cashier Can:

- ✅ View all today's bookings
- ✅ View upcoming bookings
- ✅ Check table availability
- ✅ Get table suggestions
- ✅ Confirm booking + assign tables
- ✅ Reject booking
- ✅ Mark guest seated
- ✅ Complete booking
- ✅ Mark no-show
- ✅ Update table status (available, occupied, cleaning)
- ✅ View floor plan
- ❌ Create/delete tables
- ❌ View analytics

### Admin Can:

- ✅ All cashier operations
- ✅ Create/update/delete tables
- ✅ Bulk update tables
- ✅ View table statistics
- ✅ View booking analytics
- ✅ Configure booking rules
- ✅ Enable/disable booking service

---

## Validation Rules

### Booking Validation

- ✅ Guest count between 1 and maxGuests
- ✅ Time within restaurant hours
- ✅ Time doesn't conflict with existing bookings
- ✅ Table(s) have sufficient capacity
- ✅ Restaurant has booking enabled

### Table Validation

- ✅ Status must be: available, occupied, reserved, or cleaning
- ✅ Capacity >= 1
- ✅ Can't delete if active bookings exist

---

## Status Workflow

```
BOOKING WORKFLOW:
pending ──confirm──> confirmed ──seated──> seated ──complete──> completed
  │                     │
  └──reject─────────> cancelled
       │
       no-show
```

```
TABLE WORKFLOW:
available ──reserve──> reserved ──occupy──> occupied ──free──> available
    │
    └──clean──> cleaning ──done──> available
```

---

## Key Features Implemented

✅ **Workflow Management**

- Multi-state booking workflow
- Status validation
- Cascading table updates

✅ **Availability Checking**

- Real-time table availability
- Buffer time between bookings
- Overlap detection
- Multiple tables per booking

✅ **Business Rules**

- Opening hours validation
- Guest limit enforcement
- Booking duration config
- Cleanup buffer config

✅ **Real-time Updates**

- WebSocket events
- Email notifications
- Floor plan visualization

✅ **Analytics**

- Booking statistics
- Table occupancy stats
- Revenue tracking ready

---

## Testing Quick Commands

### Create a Test Booking

```bash
curl -X POST http://localhost:5000/api/restaurants/rest_123/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId":"rest_123",
    "date":"2025-01-25",
    "startTime":"19:00",
    "guests":4,
    "customerEmail":"test@email.com",
    "customerName":"Test User"
  }'
```

### Check Availability

```bash
curl "http://localhost:5000/api/restaurants/rest_123/tables/availability?date=2025-01-25&time=19:00&guests=4"
```

### Confirm Booking

```bash
curl -X POST http://localhost:5000/api/restaurants/rest_123/bookings/:bookingId/confirm \
  -H "Content-Type: application/json" \
  -d '{"tableIds":["table_1"]}'
```

### Mark Seated

```bash
curl -X PATCH http://localhost:5000/api/restaurants/rest_123/bookings/:bookingId/seated
```

### Complete Booking

```bash
curl -X PATCH http://localhost:5000/api/restaurants/rest_123/bookings/:bookingId/complete
```

---

## Database Fields Reference

### Booking Document

```javascript
{
  _id: ObjectId,
  bookingId: String,        // "RES-2025-12345"
  restaurantId: String,
  tableId: ObjectId,        // Primary table
  date: String,             // "2025-01-25"
  startTime: String,        // "19:00"
  endTime: String,          // "21:00"
  guests: Number,
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  source: String,           // "online", "phone", "walk-in"
  notes: String,
  status: String,           // "pending", "confirmed", "seated", "completed", "no-show", "cancelled"
  createdAt: Date,
  updatedAt: Date
}
```

### Table Document

```javascript
{
  _id: ObjectId,
  restaurantId: String,
  name: String,             // "Table 5"
  capacity: Number,
  location: String,         // "Window area"
  positionX: Number,
  positionY: Number,
  isActive: Boolean,
  status: String,           // "available", "occupied", "reserved", "cleaning"
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Problem: "Table already booked for the selected time"

**Solution:** Check availability with buffer time

```bash
GET /tables/availability?date=...&time=...&guests=...&bufferMinutes=15
```

### Problem: "Only pending bookings can be confirmed"

**Solution:** Check booking status is "pending"

```bash
GET /bookings/:bookingId
```

### Problem: "Cannot delete table with active bookings"

**Solution:** Complete or cancel all bookings first

```bash
GET /bookings?date=today
```

### Problem: "Booking time is outside restaurant opening hours"

**Solution:** Check restaurant hours in systemSettings.landing.hours

```javascript
restaurant.systemSettings.landing.hours.monday; // { open: "11:00", close: "23:00" }
```

---

## Next Steps

1. **Add Role-Based Middleware** - Protect endpoints with role checks
2. **Implement Notifications** - Email/SMS booking confirmations
3. **Setup WebSocket** - Real-time updates to dashboards
4. **Create Admin Dashboard** - Visualize bookings and tables
5. **Add Customer Portal** - Self-service booking and cancellation
6. **Setup Analytics** - Track no-shows, peak times, revenue

---

## Support & Documentation

- **Full API Reference**: See `API_REFERENCE.md`
- **Workflow Guide**: See `WORKFLOW_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

All code includes inline comments explaining the logic.
