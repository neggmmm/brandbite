# Table Booking System - API Reference

## Base URL

```
/api/restaurants/:restaurantId/bookings
/api/restaurants/:restaurantId/tables
```

---

## BOOKING ENDPOINTS

### Create Booking (Customer)

```
POST /api/restaurants/:restaurantId/bookings
Content-Type: application/json

{
  "restaurantId": "rest_123",
  "date": "2025-01-20",
  "startTime": "19:00",
  "endTime": "21:00",  // Optional - auto-calculated if omitted
  "guests": 4,
  "customerEmail": "john@email.com",
  "customerPhone": "+1234567890",
  "customerName": "John Doe",
  "source": "online",  // "online", "phone", "walk-in"
  "notes": "Window seat preferred"
}

Response: 201 Created
{
  "_id": "booking_123",
  "bookingId": "RES-2025-12345",
  "restaurantId": "rest_123",
  "date": "2025-01-20",
  "startTime": "19:00",
  "endTime": "21:00",
  "guests": 4,
  "customerEmail": "john@email.com",
  "customerName": "John Doe",
  "tableId": null,  // Assigned by cashier
  "status": "pending",
  "source": "online",
  "notes": "Window seat preferred",
  "createdAt": "2025-01-10T10:30:00Z",
  "updatedAt": "2025-01-10T10:30:00Z"
}
```

---

### List Bookings (Admin/Cashier)

```
GET /api/restaurants/:restaurantId/bookings?date=2025-01-20

Response: 200 OK
[
  {
    "_id": "booking_123",
    "bookingId": "RES-2025-12345",
    "date": "2025-01-20",
    "startTime": "19:00",
    "guests": 4,
    "customerName": "John Doe",
    "status": "pending",
    ...
  },
  ...
]
```

---

### Get Booking by ID

```
GET /api/restaurants/:restaurantId/bookings/:bookingId

Response: 200 OK
{
  "_id": "booking_123",
  "bookingId": "RES-2025-12345",
  ...
}
```

---

### Get Today's Bookings (Cashier)

```
GET /api/restaurants/:restaurantId/bookings/today

Response: 200 OK
[
  { status: "pending", ... },
  { status: "confirmed", ... },
  { status: "seated", ... }
]
```

---

### Get Upcoming Bookings (Cashier)

```
GET /api/restaurants/:restaurantId/bookings/upcoming?days=7

Response: 200 OK
[
  // All pending, confirmed, seated for next 7 days
]
```

---

### Get Customer's Bookings

```
GET /api/restaurants/:restaurantId/bookings/customer
?restaurantId=rest_123&customerEmail=john@email.com

Response: 200 OK
[
  { status: "confirmed", ... },
  { status: "completed", ... }
]
```

---

### Get Bookings by Date

```
GET /api/restaurants/:restaurantId/bookings/by-date/2025-01-20

Response: 200 OK
[...]
```

---

### Confirm Booking & Assign Table(s) - CASHIER ONLY

```
POST /api/restaurants/:restaurantId/bookings/:bookingId/confirm
Content-Type: application/json

{
  "tableIds": ["table_5", "table_6"]  // Can assign multiple tables
}

Response: 200 OK
{
  "_id": "booking_123",
  "status": "confirmed",
  "tableId": "table_5",  // Primary table
  ...
}

Errors:
- 400: Booking not pending
- 400: Table not found
- 400: Insufficient capacity
- 400: Overlapping booking exists
```

---

### Reject Booking - CASHIER ONLY

```
POST /api/restaurants/:restaurantId/bookings/:bookingId/reject
Content-Type: application/json

{
  "reason": "All tables fully booked for that time"
}

Response: 200 OK
{
  "_id": "booking_123",
  "status": "cancelled",
  "notes": "...\nRejected: All tables fully booked...",
  ...
}
```

---

### Mark Guest as Seated - CASHIER ONLY

```
PATCH /api/restaurants/:restaurantId/bookings/:bookingId/seated

Response: 200 OK
{
  "_id": "booking_123",
  "status": "seated",
  ...
}
```

---

### Complete Booking - CASHIER ONLY

```
PATCH /api/restaurants/:restaurantId/bookings/:bookingId/complete

Response: 200 OK
{
  "_id": "booking_123",
  "status": "completed",
  ...
}
```

---

### Mark as No-Show - CASHIER ONLY

```
PATCH /api/restaurants/:restaurantId/bookings/:bookingId/no-show

Response: 200 OK
{
  "_id": "booking_123",
  "status": "no-show",
  ...
}
```

---

### Cancel Booking - CUSTOMER/ADMIN

```
DELETE /api/restaurants/:restaurantId/bookings/:bookingId
?customerEmail=john@email.com  // Optional for verification

Response: 200 OK
{
  "_id": "booking_123",
  "status": "cancelled",
  ...
}

Errors:
- 401: Not your booking (if customerEmail doesn't match)
```

---

### Get Booking Analytics - ADMIN ONLY

```
GET /api/restaurants/:restaurantId/bookings/analytics
?restaurantId=rest_123&startDate=2025-01-01&endDate=2025-12-31

Response: 200 OK
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

## TABLE ENDPOINTS

### Create Table - ADMIN ONLY

```
POST /api/restaurants/:restaurantId/tables
Content-Type: application/json

{
  "restaurantId": "rest_123",
  "name": "Table 5",
  "capacity": 4,
  "location": "Window area",
  "positionX": 100,
  "positionY": 150,
  "isActive": true
}

Response: 201 Created
{
  "_id": "table_5",
  "restaurantId": "rest_123",
  "name": "Table 5",
  "capacity": 4,
  "location": "Window area",
  "positionX": 100,
  "positionY": 150,
  "isActive": true,
  "status": "available",
  "createdAt": "2025-01-10T10:30:00Z"
}
```

---

### List Tables

```
GET /api/restaurants/:restaurantId/tables

Response: 200 OK
[
  {
    "_id": "table_5",
    "name": "Table 5",
    "capacity": 4,
    "status": "available",
    ...
  },
  ...
]
```

---

### Update Table - ADMIN ONLY

```
PUT /api/restaurants/:restaurantId/tables/:tableId
Content-Type: application/json

{
  "name": "Table 5 (Premium)",
  "capacity": 6,
  "isActive": true
}

Response: 200 OK
{
  "_id": "table_5",
  "name": "Table 5 (Premium)",
  "capacity": 6,
  ...
}
```

---

### Delete Table - ADMIN ONLY

```
DELETE /api/restaurants/:restaurantId/tables/:tableId

Response: 200 OK
{
  "success": true,
  "removed": { ... }
}

Errors:
- 400: Table has active bookings
```

---

### Get Floor Plan

```
GET /api/restaurants/:restaurantId/tables/floor-plan

Response: 200 OK
[
  {
    "_id": "table_1",
    "name": "Table 1",
    "capacity": 2,
    "status": "available",
    "positionX": 50,
    "positionY": 100,
    ...
  },
  ...
]
```

---

### Check Table Availability - CASHIER

```
GET /api/restaurants/:restaurantId/tables/availability
?restaurantId=rest_123
&date=2025-01-20
&time=19:00
&guests=4
&durationMinutes=120
&bufferMinutes=15

Response: 200 OK
[
  {
    "_id": "table_5",
    "name": "Table 5",
    "capacity": 4,
    "status": "available"
  },
  {
    "_id": "table_6",
    "name": "Table 6",
    "capacity": 4,
    "status": "available"
  }
]
```

---

### Get Table Suggestions - CASHIER

```
GET /api/restaurants/:restaurantId/tables/suggest
?restaurantId=rest_123
&date=2025-01-20
&time=19:00
&guests=4
&durationMinutes=120
&numTablesPreferred=1

Response: 200 OK
{
  "tables": [
    {
      "_id": "table_5",
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

### Get Tables by Capacity - ADMIN

```
GET /api/restaurants/:restaurantId/tables/by-capacity
?restaurantId=rest_123&minCapacity=6

Response: 200 OK
[
  {
    "_id": "table_1",
    "name": "Table 1",
    "capacity": 6,
    ...
  },
  {
    "_id": "table_2",
    "name": "Table 2",
    "capacity": 8,
    ...
  }
]
```

---

### Mark Table as Cleaning - CASHIER

```
PATCH /api/restaurants/:restaurantId/tables/:tableId/cleaning

Response: 200 OK
{
  "_id": "table_5",
  "status": "cleaning",
  ...
}
```

---

### Mark Table as Available - CASHIER

```
PATCH /api/restaurants/:restaurantId/tables/:tableId/available

Response: 200 OK
{
  "_id": "table_5",
  "status": "available",
  ...
}
```

---

### Update Table Status - CASHIER

```
PATCH /api/restaurants/:restaurantId/tables/:tableId/status
Content-Type: application/json

{
  "status": "occupied"  // "available", "occupied", "reserved", "cleaning"
}

Response: 200 OK
{
  "_id": "table_5",
  "status": "occupied",
  ...
}
```

---

### Get Table Statistics - ADMIN

```
GET /api/restaurants/:restaurantId/tables/stats
?restaurantId=rest_123&date=2025-01-20

Response: 200 OK
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

### Bulk Update Tables - ADMIN

```
PATCH /api/restaurants/:restaurantId/tables
?restaurantId=rest_123
Content-Type: application/json

{
  "tableIds": ["table_1", "table_2", "table_3"],
  "updates": {
    "isActive": false
  }
}

Response: 200 OK
[
  { "_id": "table_1", "isActive": false, ... },
  { "_id": "table_2", "isActive": false, ... },
  { "_id": "table_3", "isActive": false, ... }
]
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Descriptive error message",
  "status": 400,
  "error": "BadRequest"
}
```

### Common Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Booking overlap
- `500 Internal Server Error` - Server error

### Common Error Messages

- "Booking not found"
- "Only pending bookings can be confirmed"
- "Table already booked for the selected time"
- "Number of guests exceeds table capacity"
- "Table has active bookings and cannot be deleted"
- "Booking time is outside restaurant opening hours"
- "No available tables for selected time"

---

## Query Parameters Summary

### Bookings

| Param         | Type   | Description                       | Example        |
| ------------- | ------ | --------------------------------- | -------------- |
| restaurantId  | string | Restaurant ID (required)          | rest_123       |
| date          | date   | Filter by date                    | 2025-01-20     |
| customerEmail | string | Customer email (for verification) | john@email.com |
| startDate     | date   | Analytics start date              | 2025-01-01     |
| endDate       | date   | Analytics end date                | 2025-12-31     |
| days          | number | Number of days for upcoming       | 7              |

### Tables

| Param              | Type   | Description                | Example    |
| ------------------ | ------ | -------------------------- | ---------- |
| restaurantId       | string | Restaurant ID (required)   | rest_123   |
| date               | date   | Date for availability      | 2025-01-20 |
| time               | time   | Time HH:mm                 | 19:00      |
| guests             | number | Number of guests           | 4          |
| durationMinutes    | number | Booking duration           | 120        |
| bufferMinutes      | number | Cleanup buffer             | 15         |
| minCapacity        | number | Minimum table capacity     | 4          |
| numTablesPreferred | number | Preferred number of tables | 1          |

---

## WebSocket Events

Events emitted in real-time:

### Booking Events

```javascript
// New booking created
socket.on('booking:new', (booking) => { ... })

// Booking confirmed
socket.on('booking:confirmed', (booking) => { ... })

// Guest seated
socket.on('booking:seated', (booking) => { ... })

// Booking completed
socket.on('booking:completed', (booking) => { ... })

// Booking cancelled/rejected
socket.on('booking:cancelled', (booking) => { ... })

// Generic update
socket.on('booking:updated', (booking) => { ... })
```

### Table Events

```javascript
// Table status changed
socket.on('table:updated', (table) => { ... })
```

---

## Rate Limiting (Recommended)

```
POST /bookings - 10 requests per hour (per customer)
GET /bookings/* - 100 requests per hour
POST /tables - 20 requests per hour (admin)
PATCH /tables - 100 requests per hour (admin)
```

---

## Authentication & Authorization (Recommended)

Implement middleware to enforce:

```javascript
// Public endpoints
POST /bookings - Any authenticated user

// Cashier endpoints
PATCH /bookings/:id/seated
PATCH /bookings/:id/complete
POST /bookings/:id/confirm
etc.

// Admin endpoints
POST /tables
DELETE /tables/:id
PATCH /tables/bulk
GET /bookings/analytics
etc.

// Customer endpoints
GET /bookings/customer (with customerEmail verification)
DELETE /bookings/:id (with customerEmail verification)
```
