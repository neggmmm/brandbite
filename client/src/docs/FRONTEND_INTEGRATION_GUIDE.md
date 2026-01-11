/\*\*

- Table Booking Frontend - Complete Implementation Guide
-
- ============================================================
- OVERVIEW
- ============================================================
-
- This document provides a complete guide for integrating the table booking
- system in your React/Redux frontend application.
-
- The system includes:
- - Redux state management for bookings and tables
- - WebSocket integration for real-time updates
- - Custom React hooks for API calls
- - Pre-built UI components (buttons, cards, forms, modals)
- - Complete pages for customers, admins, and cashiers
-
- ============================================================
- QUICK START
- ============================================================
-
- 1.  INSTALL DEPENDENCIES (if not already installed)
- npm install @reduxjs/toolkit socket.io-client lucide-react
-
- 2.  ADD REDUX TO APP.JSX
- See "Step-by-Step Integration" section below
-
- 3.  INITIALIZE WEBSOCKET
- Import useWebSocketIntegration hook in your main layout or App.jsx
-
- 4.  ADD ROUTES
- Import bookingRoutes from config/bookingRoutes.jsx and add to your routes
-
- ============================================================
- FILE STRUCTURE
- ============================================================
-
- src/
- ├── redux/
- │ └── slices/
- │ ├── bookingSlice.js (Redux state for bookings)
- │ └── tableSlice.js (Redux state for tables)
- ├── components/
- │ └── tableBooking/
- │ ├── BookingComponents.jsx (Modal, Card, Status Badge, Alert)
- │ ├── TableComponents.jsx (Table Card, Floor Plan, Form, etc)
- │ └── index.js (Export all components)
- ├── pages/
- │ ├── CustomerBookingPage.jsx (Customer booking interface)
- │ ├── AdminTableManagementPage.jsx (Admin table CRUD)
- │ ├── CashierManagementPage.jsx (Cashier booking management)
- │ └── tableBooking/
- │ └── index.js (Export all pages)
- ├── hooks/
- │ ├── useBookingAndTableAPI.js (API hooks for bookings and tables)
- │ └── useWebSocketIntegration.js (WebSocket setup hook)
- ├── services/
- │ └── socketService.js (WebSocket event handlers)
- ├── config/
- │ └── bookingRoutes.jsx (Route configuration)
- └── api/
-     └── axios.js                  (Axios instance - should already exist)
-
- ============================================================
- STEP-BY-STEP INTEGRATION
- ============================================================
-
- STEP 1: Setup Redux Store
- ***
- In your store configuration (redux/store.js or similar):
-
- ```jsx

  ```
- import { configureStore } from '@reduxjs/toolkit';
- import bookingReducer from './slices/bookingSlice';
- import tableReducer from './slices/tableSlice';
-
- const store = configureStore({
- reducer: {
-     booking: bookingReducer,
-     table: tableReducer,
-     // ... other reducers
- },
- });
-
- export default store;
- ```

  ```
-
- STEP 2: Setup WebSocket in App.jsx
- ***
- ```jsx

  ```
- import useWebSocketIntegration from './hooks/useWebSocketIntegration';
-
- function App() {
- // Get current user's role (adjust based on your auth system)
- const userRole = useSelector(state => state.auth.userRole);
- const restaurantId = useSelector(state => state.auth.restaurantId);
-
- // Initialize WebSocket
- useWebSocketIntegration(userRole, restaurantId);
-
- return (
-     // ... rest of app
- );
- }
- ```

  ```
-
- STEP 3: Add Routes
- ***
- In your routing file (e.g., routes.jsx or App.jsx):
-
- ```jsx

  ```
- import { Routes, Route } from 'react-router-dom';
- import bookingRoutes from './config/bookingRoutes';
-
- function AppRoutes() {
- return (
-     <Routes>
-       {bookingRoutes.map(route => (
-         <Route key={route.path} {...route} />
-       ))}
-       {/* ... other routes */}
-     </Routes>
- );
- }
- ```

  ```
-
- STEP 4: Add Navigation Links
- ***
- In your navigation component:
-
- ```jsx

  ```
- import { bookingNavLinks } from './config/bookingRoutes';
-
- function Navigation() {
- const userRole = useSelector(state => state.auth.userRole);
- const links = bookingNavLinks[userRole] || [];
-
- return (
-     <nav>
-       {links.map(link => (
-         <Link key={link.path} to={link.path}>
-           {link.label}
-         </Link>
-       ))}
-     </nav>
- );
- }
- ```

  ```
-
- ============================================================
- COMPONENT USAGE EXAMPLES
- ============================================================
-
- 1.  USING BOOKING MODAL
- ***
- ```jsx

  ```
- import { BookingModal } from './components/tableBooking';
-
- function MyComponent() {
- const [isOpen, setIsOpen] = useState(false);
-
- const handleSubmit = async (formData) => {
-     console.log('Booking:', formData);
-     // Your API call here
- };
-
- return (
-     <>
-       <button onClick={() => setIsOpen(true)}>Book Now</button>
-       <BookingModal
-         isOpen={isOpen}
-         onClose={() => setIsOpen(false)}
-         onSubmit={handleSubmit}
-       />
-     </>
- );
- }
- ```

  ```
-
- 2.  USING API HOOKS
- ***
- ```jsx

  ```
- import { useBookingAndTableAPI } from './hooks/useBookingAndTableAPI';
-
- function BookingComponent() {
- const { useBookingAPI } = useBookingAndTableAPI();
- const {
-     create: createBooking,
-     fetchCustomer: fetchMyBookings,
-     cancel: cancelBooking,
-     loading,
-     error,
- } = useBookingAPI();
-
- const handleCreate = async () => {
-     try {
-       const result = await createBooking({
-         date: '2024-01-15',
-         startTime: '19:00',
-         guests: 4,
-         customerEmail: 'user@example.com',
-         tableId: 'table123',
-       });
-       console.log('Booking created:', result);
-     } catch (err) {
-       console.error('Error:', err.message);
-     }
- };
-
- return (
-     <>
-       <button onClick={handleCreate} disabled={loading}>
-         {loading ? 'Creating...' : 'Create Booking'}
-       </button>
-       {error && <p className="text-red-600">{error}</p>}
-     </>
- );
- }
- ```

  ```
-
- 3.  USING FLOOR PLAN COMPONENT
- ***
- ```jsx

  ```
- import { FloorPlan } from './components/tableBooking';
- import { useSelector, useDispatch } from 'react-redux';
-
- function AdminFloorPlan() {
- const tables = useSelector(state => state.table.tables);
- const [selectedTableId, setSelectedTableId] = useState(null);
-
- return (
-     <FloorPlan
-       tables={tables}
-       selectedTableId={selectedTableId}
-       onTableSelect={setSelectedTableId}
-       showActions={true}
-       columns={4}
-     />
- );
- }
- ```

  ```
-
- ============================================================
- API INTEGRATION
- ============================================================
-
- Base URL Configuration:
- Make sure your axios instance points to the correct API:
-
- In src/api/axios.js (or your API config):
- ```jsx

  ```
- import axios from 'axios';
-
- const api = axios.create({
- baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
- headers: {
-     'Content-Type': 'application/json',
- },
- });
-
- // Add auth token to requests
- api.interceptors.request.use((config) => {
- const token = localStorage.getItem('authToken');
- if (token) {
-     config.headers.Authorization = `Bearer ${token}`;
- }
- return config;
- });
-
- export default api;
- ```

  ```
-
- ============================================================
- WEBSOCKET EVENTS
- ============================================================
-
- The system listens to these WebSocket events:
-
- Booking Events:
- - booking:new - New booking created
- - booking:confirmed - Booking confirmed by staff
- - booking:seated - Customer seated
- - booking:completed - Booking completed
- - booking:cancelled - Booking cancelled
- - booking:rejected - Booking rejected
-
- Table Events:
- - table:updated - Table information updated
- - table:status-changed - Table status changed (available/occupied/etc)
-
- These events automatically update Redux state when received.
-
- ============================================================
- REAL-TIME UPDATES
- ============================================================
-
- Real-time updates work automatically through:
-
- 1.  WebSocket events trigger Redux actions
- 2.  Redux state updates
- 3.  Components subscribed to Redux state re-render
-
- Example of a component that updates in real-time:
- ```jsx

  ```
- import { useSelector } from 'react-redux';
-
- function BookingList() {
- const bookings = useSelector(state => state.booking.customerBookings);
-
- // This component automatically updates when:
- // 1. User creates/cancels a booking (via API call)
- // 2. Server sends WebSocket event about booking change
-
- return (
-     <div>
-       {bookings.map(booking => (
-         <BookingCard key={booking._id} booking={booking} />
-       ))}
-     </div>
- );
- }
- ```

  ```
-
- ============================================================
- ERROR HANDLING
- ============================================================
-
- The API hooks automatically handle errors. Access via:
-
- ```jsx

  ```
- const { error, loading } = useBookingAPI();
-
- useEffect(() => {
- if (error) {
-     // Display error to user
-     console.error('API Error:', error);
- }
- }, [error]);
- ```

  ```
-
- Or in try-catch:
- ```jsx

  ```
- try {
- await createBooking({ ... });
- } catch (error) {
- console.error('Error:', error.message);
- // Show error to user
- }
- ```

  ```
-
- ============================================================
- CUSTOMIZATION
- ============================================================
-
- Colors and Styling:
- The components use Tailwind CSS classes. Customize by:
- 1.  Modifying tailwind.config.js for theme colors
- 2.  Adding custom CSS classes to components
- 3.  Passing custom className props
-
- Example:
- ```jsx

  ```
- <BookingCard
- booking={booking}
- className="custom-booking-card"
- />
- ```

  ```
-
- API Endpoints:
- If your backend API differs from expected, update URLs in
- useBookingAndTableAPI.js
-
- ============================================================
- TESTING
- ============================================================
-
- Test the integration:
-
- 1.  Test Booking Creation:
- - Go to /booking (customer)
- - Select date, time, guests, table
- - Submit form
- - Check if booking appears in "My Bookings"
-
- 2.  Test Admin Table Management:
- - Go to /admin/tables (admin)
- - Add a new table
- - Edit table details
- - Delete table
-
- 3.  Test Cashier Dashboard:
- - Go to /cashier/bookings (cashier)
- - Confirm pending bookings
- - Assign tables
- - Mark customers as seated
-
- 4.  Test Real-time Updates:
- - Open two browser windows (one as customer, one as cashier)
- - Create booking in customer view
- - Confirm in cashier view
- - Verify updates appear in real-time
-
- ============================================================
- TROUBLESHOOTING
- ============================================================
-
- Issue: Redux store not connected
- Solution: Ensure Provider is wrapping your App in main.jsx
-
- Issue: WebSocket not connecting
- Solution: Check API URL in socketService.js matches your backend
-
- Issue: API calls failing
- Solution: Verify axios.js has correct base URL and auth headers
-
- Issue: Pages not loading
- Solution: Check routes are properly added to your Routes component
-
- Issue: Styling not applying
- Solution: Ensure Tailwind CSS is configured and post-CSS is running
-
- ============================================================
- SUPPORT & DOCUMENTATION
- ============================================================
-
- For more detailed information, see:
- - Backend: server/modules/tableBooking/README.md
- - API Reference: server/modules/tableBooking/API_REFERENCE.md
- - Redux: redux/slices/bookingSlice.js
- - Components: components/tableBooking/index.js
- \*/

export const IntegrationGuide = {};
