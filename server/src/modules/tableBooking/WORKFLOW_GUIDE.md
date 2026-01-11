# Restaurant Table Booking System - Workflow Guide

## Overview

This enhanced table booking system implements a complete real-world restaurant booking workflow with role-based features for customers, cashiers, and administrators.

## Booking Workflow States

```
pending → confirmed → seated → completed
          ↓
        rejected/no-show
          ↓
       cancelled
```

### States Explained:

- **pending**: Customer creates booking request, awaiting cashier confirmation
- **confirmed**: Cashier confirmed booking and assigned table(s)
- **seated**: Guest has arrived and is seated at table
- **completed**: Guest has left, booking finished successfully
- **no-show**: Guest didn't arrive for confirmed booking
- **cancelled**: Booking was cancelled by customer or rejected by cashier

---

## CUSTOMER FEATURES

### 1. Create Booking Request

Customers initiate bookings - they start in "pending" status awaiting cashier confirmation.

**Endpoint:** `POST /bookings`

**Request Body:**

```json
{
  "restaurantId": "rest_123",
  "date": "2025-01-20",
  "startTime": "19:00",
  "guests": 4,
  "customerEmail": "customer@email.com",
  "customerPhone": "+1234567890",
  "customerName": "John Doe",
  "source": "online",
  "notes": "Window seat preferred"
}
```

**Notes:**

- `endTime` is auto-calculated from default duration in booking rules (default: 120 minutes)
- `tableId` is NOT provided by customer - cashier assigns later
- Status automatically set to "pending"

---

### 2. View Own Bookings

Customers can only see their own bookings.

**Endpoint:** `GET /bookings/customer?restaurantId=rest_123&customerEmail=customer@email.com`

**Response:** Array of customer's bookings (excluding cancelled ones)

---

### 3. Cancel Booking

Customers can cancel their own bookings (if not already completed/seated).

**Endpoint:** `DELETE /bookings/:id?customerEmail=customer@email.com`

**Notes:**

- Table is freed if booking was confirmed/seated
- Customer email optional but recommended for verification

---

## CASHIER FEATURES

### 1. View Today's Bookings

See all pending, confirmed, and seated bookings for today.

**Endpoint:** `GET /bookings/today?restaurantId=rest_123`

**Response:** Array of today's active bookings

---

### 2. View Upcoming Bookings

See bookings for the next N days.

**Endpoint:** `GET /bookings/upcoming?restaurantId=rest_123`

**Response:** Array of upcoming bookings (default 7 days)

---

### 3. Check Table Availability

Before confirming a booking, check which tables are available for the requested time.

**Endpoint:** `GET /tables/availability?restaurantId=rest_123&date=2025-01-20&time=19:00&guests=4&durationMinutes=120&bufferMinutes=15`

**Query Parameters:**

- `date`: YYYY-MM-DD format
- `time`: HH:mm format
- `guests`: Number of guests
- `durationMinutes`: Expected booking duration (default: 120)
- `bufferMinutes`: Cleanup buffer between bookings (default: 15)

**Response:** Array of available tables with capacity >= guests

---

### 4. Get Table Suggestions

Get smart suggestions for optimal table assignment.

**Endpoint:** `GET /tables/suggest?restaurantId=rest_123&date=2025-01-20&time=19:00&guests=4&durationMinutes=120`

**Response:**

```json
{
  "tables": [
    {
      "_id": "table_1",
      "name": "Table 5",
      "capacity": 4,
      "status": "available"
    }
  ],
  "totalCapacity": 4,
  "message": "Suggested 1 table(s) for 4 guests"
}
```

---

### 5. Confirm Booking & Assign Table(s)

Cashier confirms a pending booking and assigns one or more tables.

**Endpoint:** `POST /bookings/:id/confirm`

**Request Body:**

```json
{
  "tableIds": ["table_id_1", "table_id_2"]
}
```

**Validation:**

- Booking must be in "pending" status
- All tables must exist and belong to restaurant
- Total capacity must be >= number of guests
- No overlapping confirmed/seated bookings on assigned tables
- Respects buffer between bookings

**On Success:**

- Booking status → "confirmed"
- Table status → "reserved"
- WebSocket emit: `booking:confirmed`

---

### 6. Reject Booking

Reject a pending booking request.

**Endpoint:** `POST /bookings/:id/reject`

**Request Body:**

```json
{
  "reason": "All tables fully booked for that time"
}
```

**On Success:**

- Booking status → "cancelled"
- Customer receives email notification
- WebSocket emit: `booking:rejected`

---

### 7. Mark Guest as Seated

When guest arrives and is seated.

**Endpoint:** `PATCH /bookings/:id/seated`

**Validation:**

- Booking must be "confirmed"

**On Success:**

- Booking status → "seated"
- Table status → "occupied"
- WebSocket emit: `booking:seated`

---

### 8. Complete Booking

When guest leaves and table should be freed.

**Endpoint:** `PATCH /bookings/:id/complete`

**Validation:**

- Booking must be "seated" or "confirmed"

**On Success:**

- Booking status → "completed"
- Table status → "available"
- WebSocket emit: `booking:completed`

---

### 9. Mark as No-Show

Guest didn't arrive for confirmed booking.

**Endpoint:** `PATCH /bookings/:id/no-show`

**Validation:**

- Booking must be "confirmed"

**On Success:**

- Booking status → "no-show"
- Table status → "available"

---

### 10. Mark Table as Cleaning

Mark table as being cleaned between services.

**Endpoint:** `PATCH /tables/:id/cleaning`

**On Success:**

- Table status → "cleaning"
- Table won't be available for new bookings

---

### 11. Mark Table as Available

Return cleaned table to available status.

**Endpoint:** `PATCH /tables/:id/available`

**On Success:**

- Table status → "available"

---

### 12. View Floor Plan

Get all tables with their positions for visual floor plan display.

**Endpoint:** `GET /tables/floor-plan?restaurantId=rest_123`

**Response:** Array of tables with position (positionX, positionY) and status

---

## ADMIN FEATURES

### 1. Create Table

Define a new table in the system.

**Endpoint:** `POST /tables`

**Request Body:**

```json
{
  "restaurantId": "rest_123",
  "name": "Table 5",
  "capacity": 4,
  "location": "Window area",
  "positionX": 100,
  "positionY": 150,
  "isActive": true
}
```

---

### 2. Manage Tables

List, update, or delete tables.

**Endpoints:**

- `GET /tables?restaurantId=rest_123` - List all tables
- `PUT /tables/:id` - Update table details
- `DELETE /tables/:id` - Delete table (only if no active bookings)

**Update Example:**

```json
{
  "name": "Table 5 (Premium)",
  "capacity": 6,
  "positionX": 120
}
```

---

### 3. Bulk Update Tables

Update multiple tables at once (e.g., disable all during renovation).

**Endpoint:** `PATCH /tables?restaurantId=rest_123`

**Request Body:**

```json
{
  "tableIds": ["table_1", "table_2", "table_3"],
  "updates": { "isActive": false }
}
```

---

### 4. Get Tables by Capacity

Find tables suitable for specific group sizes.

**Endpoint:** `GET /tables/by-capacity?restaurantId=rest_123&minCapacity=6`

**Response:** Array of tables with capacity >= minCapacity

---

### 5. View Table Statistics

Get occupancy statistics for a specific date.

**Endpoint:** `GET /tables/stats?restaurantId=rest_123&date=2025-01-20`

**Response:**

```json
{
  "totalTables": 12,
  "totalCapacity": 48,
  "availableTables": 8,
  "occupiedTables": 3,
  "reservedTables": 1,
  "tablesByCapacity": {
    "2": { "count": 4, "name": "2-seater" },
    "4": { "count": 5, "name": "4-seater" },
    "6": { "count": 3, "name": "6-seater" }
  }
}
```

---

### 6. View Booking Analytics

Get booking statistics for a date range.

**Endpoint:** `GET /bookings/analytics?restaurantId=rest_123&startDate=2025-01-01&endDate=2025-12-31`

**Response:**

```json
{
  "total": 245,
  "byStatus": {
    "completed": 200,
    "no-show": 15,
    "cancelled": 30
  },
  "bySource": {
    "online": 180,
    "phone": 50,
    "walk-in": 15
  },
  "totalGuests": 1200,
  "averageGuestSize": 5
}
```

---

### 7. Configure Booking Rules

Edit booking rules in `restaurant.systemSettings.tableBookings`:

```json
{
  "enabled": true,
  "maxGuests": 100,
  "defaultDurationMinutes": 120,
  "bufferMinutesBetweenBookings": 15
}
```

**Rules:**

- `enabled`: Global enable/disable for table booking feature
- `maxGuests`: Maximum guests per booking
- `defaultDurationMinutes`: Default booking duration (used if endTime not provided)
- `bufferMinutesBetweenBookings`: Cleanup time between bookings

---

## VALIDATION & BUSINESS RULES

### Booking Validation

1. ✅ Restaurant exists and has booking service enabled
2. ✅ Guest count >= 1 and <= maxGuests limit
3. ✅ Booking time falls within restaurant opening hours
4. ✅ Tables exist and belong to restaurant
5. ✅ Total table capacity >= number of guests
6. ✅ No overlapping bookings (with configurable buffer)

### Table Capacity

- Each table has a maximum capacity
- Multiple tables can be assigned to large parties
- System validates total capacity before confirmation

### Overlap Detection

- Uses buffer minutes between bookings for cleaning
- Example: 2 hr booking (19:00-21:00) + 15min buffer = table unavailable until 21:15
- Prevents double-booking same table

### Opening Hours

- Respects restaurant opening hours from `systemSettings.landing.hours`
- Booking time must start within operating hours
- Configured per day (Monday, Tuesday, etc.)

---

## WEBSOCKET EVENTS

The system emits real-time updates via WebSocket:

**Booking Events:**

- `booking:new` - New booking request created (emitted to "cashier" room)
- `booking:confirmed` - Booking confirmed and tables assigned
- `booking:seated` - Guest seated
- `booking:completed` - Booking completed
- `booking:cancelled` - Booking cancelled/rejected
- `booking:updated` - Generic booking update

**Table Events:**

- `table:updated` - Table status changed

---

## EXAMPLE WORKFLOW: Complete Customer Booking

### Step 1: Customer Creates Booking

```bash
POST /bookings
{
  "restaurantId": "rest_123",
  "date": "2025-01-20",
  "startTime": "19:00",
  "guests": 4,
  "customerEmail": "john@email.com",
  "customerName": "John Doe"
}
```

→ Returns booking with status "pending"

### Step 2: Cashier Reviews Pending Booking

```bash
GET /bookings/today?restaurantId=rest_123
```

→ Shows John's pending booking

### Step 3: Cashier Checks Availability

```bash
GET /tables/availability?restaurantId=rest_123&date=2025-01-20&time=19:00&guests=4
```

→ Returns list of available tables

### Step 4: Cashier Confirms Booking

```bash
POST /bookings/:bookingId/confirm
{
  "tableIds": ["table_5"]
}
```

→ Booking status → "confirmed", Table 5 status → "reserved"

### Step 5: Guest Arrives

```bash
PATCH /bookings/:bookingId/seated
```

→ Booking status → "seated", Table 5 status → "occupied"

### Step 6: Guest Leaves

```bash
PATCH /bookings/:bookingId/complete
```

→ Booking status → "completed", Table 5 status → "available"

---

## TABLE STATUS LIFECYCLE

```
available → reserved (when booking confirmed)
          → occupied (when guest seated)
          → available (when guest leaves or booking cancelled)

available → cleaning (cashier manually marking)
          → available (after cleaning done)
```

---

## ERROR HANDLING

All endpoints return appropriate HTTP status codes:

- `201` - Resource created
- `200` - Success
- `400` - Validation error
- `404` - Not found
- `500` - Server error

Error responses include descriptive message:

```json
{
  "message": "Table already booked for the selected time"
}
```

---

## SECURITY NOTES

1. **Customer Role**: Use `customerEmail` verification to restrict access to own bookings
2. **Cashier Role**: Access to confirm, reject, and update table status
3. **Admin Role**: Full access to table management and booking configuration
4. **Implement middleware** to enforce role-based access control (not included in this module)

---

## TESTING QUICK COMMANDS

```bash
# Create booking
curl -X POST http://localhost:5000/bookings \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":"rest_123","date":"2025-01-20","startTime":"19:00","guests":4,"customerEmail":"test@email.com","customerName":"Test"}'

# Check availability
curl "http://localhost:5000/tables/availability?restaurantId=rest_123&date=2025-01-20&time=19:00&guests=4"

# Get suggestions
curl "http://localhost:5000/tables/suggest?restaurantId=rest_123&date=2025-01-20&time=19:00&guests=4"

# Confirm booking
curl -X POST http://localhost:5000/bookings/:id/confirm \
  -H "Content-Type: application/json" \
  -d '{"tableIds":["table_1"]}'

# Mark seated
curl -X PATCH http://localhost:5000/bookings/:id/seated

# Complete booking
curl -X PATCH http://localhost:5000/bookings/:id/complete
```

---

## FUTURE ENHANCEMENTS

- [ ] Cancellation policies and penalties
- [ ] Waitlist for fully booked times
- [ ] Special requests per booking
- [ ] Pricing/revenue tracking
- [ ] Customer preferences (favorite tables)
- [ ] Automatic no-show handling (after grace period)
- [ ] Integration with POS for payment
- [ ] Email/SMS reminders
- [ ] Rating/feedback system
