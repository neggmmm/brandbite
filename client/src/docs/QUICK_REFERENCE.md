# Table Booking Frontend - Quick Reference

## Quick Import Guide

```jsx
// Pages
import { CustomerBookingPage } from "./pages/CustomerBookingPage";
import { AdminTableManagementPage } from "./pages/AdminTableManagementPage";
import { CashierManagementPage } from "./pages/CashierManagementPage";

// Components
import {
  BookingModal,
  BookingCard,
  BookingStatusBadge,
  Alert,
  FloorPlan,
  TableCard,
  AvailableTablesList,
  ConfirmationDialog,
  TableManagementForm,
} from "./components/tableBooking";

// Hooks
import { useBookingAndTableAPI } from "./hooks/useBookingAndTableAPI";
import useWebSocketIntegration from "./hooks/useWebSocketIntegration";

// Routes
import bookingRoutes from "./config/bookingRoutes";

// Redux
import bookingReducer from "./redux/slices/bookingSlice";
import tableReducer from "./redux/slices/tableSlice";
```

## Quick Setup

### 1. Redux Store

```jsx
import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./redux/slices/bookingSlice";
import tableReducer from "./redux/slices/tableSlice";

const store = configureStore({
  reducer: {
    booking: bookingReducer,
    table: tableReducer,
  },
});
```

### 2. App.jsx

```jsx
import useWebSocketIntegration from "./hooks/useWebSocketIntegration";

function App() {
  const userRole = useSelector((state) => state.auth.userRole);
  const restaurantId = useSelector((state) => state.auth.restaurantId);

  useWebSocketIntegration(userRole, restaurantId);

  return <Routes>{bookingRoutes}</Routes>;
}
```

## Component Usage Examples

### Booking Modal

```jsx
const [isOpen, setIsOpen] = useState(false);

<BookingModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={handleSubmit}
  loading={false}
/>;
```

### Floor Plan

```jsx
const tables = useSelector((state) => state.table.tables);

<FloorPlan
  tables={tables}
  selectedTableId={selectedTableId}
  onTableSelect={setSelectedTableId}
  showActions={true}
  columns={3}
/>;
```

### Booking Card

```jsx
<BookingCard
  booking={booking}
  onConfirm={confirmBooking}
  onReject={rejectBooking}
  onSeated={markSeated}
  showActions={true}
/>
```

## API Hook Usage

### Create Booking

```jsx
const { useBookingAPI } = useBookingAndTableAPI();
const { create: createBooking } = useBookingAPI();

const result = await createBooking({
  date: "2024-01-15",
  startTime: "19:00",
  endTime: "21:00",
  guests: 4,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+1234567890",
  notes: "Window seat preferred",
  tableId: "table_123",
});
```

### Check Availability

```jsx
const { useTableAPI } = useBookingAndTableAPI();
const { checkAvailability } = useTableAPI();

const availableTables = await checkAvailability({
  date: "2024-01-15",
  startTime: "19:00",
  guests: 4,
  durationMinutes: 120,
});
```

### Get Booking Status

```jsx
const { loading, error } = useBookingAPI();

if (loading) return <p>Loading...</p>;
if (error) return <Alert type="error" message={error} />;
```

## Redux State Access

### Get Customer Bookings

```jsx
const bookings = useSelector((state) => state.booking.customerBookings);
```

### Get Tables

```jsx
const tables = useSelector((state) => state.table.tables);
const floorPlan = useSelector((state) => state.table.floorPlan);
```

### Get Loading States

```jsx
const { loading: bookingLoading, error: bookingError } = useSelector(
  (state) => state.booking
);

const { loading: tableLoading, error: tableError } = useSelector(
  (state) => state.table
);
```

## Route Configuration

### Add Routes

```jsx
import bookingRoutes from "./config/bookingRoutes";

<Routes>
  {bookingRoutes.map((route) => (
    <Route key={route.path} {...route} />
  ))}
</Routes>;
```

### Use Navigation Links

```jsx
import { bookingNavLinks } from "./config/bookingRoutes";

const userRole = useSelector((state) => state.auth.userRole);
const links = bookingNavLinks[userRole];

links.forEach((link) => {
  // link.path
  // link.label
  // link.icon
});
```

## Common Patterns

### Loading State

```jsx
const { loading } = useBookingAPI();

<button disabled={loading}>{loading ? "Loading..." : "Submit"}</button>;
```

### Error Handling

```jsx
try {
  await createBooking(data);
  // Success
} catch (error) {
  setShowAlert({
    type: "error",
    title: "Error",
    message: error.message,
  });
}
```

### Real-time Updates

```jsx
// Component automatically updates when:
// 1. Redux state changes from API calls
// 2. WebSocket events update Redux
const bookings = useSelector((state) => state.booking.customerBookings);

// Re-render happens automatically when bookings change
```

## Responsive Design

All components are responsive:

- Mobile-first approach
- Grid layouts adjust for different screen sizes
- Sidebar collapses on mobile (`lg:col-span-*`)

Example responsive grid:

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* 1 column on mobile, 3 on desktop */}
</div>
```

## Dark Mode Support

All components support dark mode with `dark:` classes:

```jsx
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-white">Content</p>
</div>
```

## Icon Library

Uses lucide-react for icons:

```jsx
import { Clock, Users, MapPin, Edit2, Trash2, Plus, X } from 'lucide-react';

<Clock size={16} />
<Users size={20} />
<MapPin className="text-blue-600" />
```

## Accessibility

- All forms have labels
- Buttons have meaningful text or ARIA labels
- Modals have proper focus management
- Color contrast meets WCAG standards

## Performance Tips

1. Use Redux selectors for state access
2. Memoize event handlers with useCallback
3. Use React.memo for expensive components
4. Lazy load pages with React.lazy
5. Don't create new objects in render

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Size Reference

- BookingComponents.jsx: ~12 KB
- TableComponents.jsx: ~13 KB
- CustomerBookingPage.jsx: ~11 KB
- AdminTableManagementPage.jsx: ~12 KB
- CashierManagementPage.jsx: ~16 KB
- bookingSlice.js: ~13 KB
- tableSlice.js: ~12 KB
- useBookingAndTableAPI.js: ~9 KB
- socketService.js: ~5 KB

**Total:** ~103 KB of code (uncompressed)

## Debugging Tips

### Redux DevTools

```jsx
// Install: npm install --save-dev redux-devtools-extension
import { composeWithDevTools } from "redux-devtools-extension";

const store = configureStore({
  reducer: {
    /* ... */
  },
  enhancers: composeWithDevTools(),
});
```

### WebSocket Events

```jsx
// Check browser console for socket events
// socket.on() listeners log when events received
// socket.emit() shows when events sent
```

### Redux State

```jsx
// Use Redux DevTools to inspect state
// Time-travel debugging available
// Action history visible
```

## Deployment Checklist

- [ ] Environment variables set (.env file)
- [ ] API base URL correct for production
- [ ] Redux DevTools only in development
- [ ] Console.log statements removed
- [ ] Unused imports cleaned up
- [ ] Components tested on mobile
- [ ] Dark mode tested
- [ ] Keyboard navigation tested
- [ ] Error handling tested
- [ ] WebSocket URL configured for production

## Environment Variables

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://yourdomain.com
REACT_APP_AUTH_TOKEN_KEY=authToken
```

## Dependencies

```json
{
  "@reduxjs/toolkit": "^1.9.0",
  "react-redux": "^8.1.0",
  "socket.io-client": "^4.5.0",
  "lucide-react": "^0.284.0",
  "axios": "^1.4.0"
}
```

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format

# Type check (if using TypeScript)
npm run type-check
```

---

For detailed information, see FRONTEND_INTEGRATION_GUIDE.md
