# Table Booking Frontend - Deployment & Setup Checklist

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] No console.log statements (remove debugging logs)
- [ ] No unused imports
- [ ] No unused variables
- [ ] All TypeScript/PropTypes errors resolved
- [ ] No ESLint warnings (if using ESLint)
- [ ] Code formatted with Prettier

### 2. Redux Setup

- [ ] Redux store includes bookingSlice
- [ ] Redux store includes tableSlice
- [ ] Redux Provider wraps entire app
- [ ] Redux DevTools only enabled in development

### 3. WebSocket Integration

- [ ] socketService.js is imported
- [ ] useWebSocketIntegration hook called in App.jsx
- [ ] WebSocket URL matches backend (check environment variables)
- [ ] Socket reconnection tested

### 4. API Configuration

- [ ] axios.js configured with correct base URL
- [ ] Authorization headers properly set
- [ ] API error handling working
- [ ] CORS configured on backend if needed

### 5. Environment Variables

Create .env file in client root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

For production:

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://yourdomain.com
REACT_APP_ENV=production
```

### 6. Dependencies Installed

```bash
npm install
# Verify these are installed:
# - @reduxjs/toolkit
# - react-redux
# - socket.io-client
# - lucide-react
# - axios (should exist)
# - tailwindcss (should exist)
```

### 7. Components Integration

- [ ] BookingComponents.jsx properly imported
- [ ] TableComponents.jsx properly imported
- [ ] All pages imported in routing
- [ ] Components tested in isolation

### 8. Routes Setup

- [ ] bookingRoutes imported in App.jsx or routing file
- [ ] All routes display without errors
- [ ] Role-based access control working
- [ ] Private routes redirecting properly
- [ ] 404 page handles non-existent routes

### 9. Styling & Responsive

- [ ] Tailwind CSS working (utility classes applying)
- [ ] Dark mode functional (if implemented)
- [ ] Responsive on mobile (test in DevTools)
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Icons displaying correctly

### 10. Functionality Testing

#### Customer Booking Flow

- [ ] Can navigate to booking page
- [ ] Can select date (minimum today, future dates allowed)
- [ ] Can select time
- [ ] Can select number of guests
- [ ] Can view available tables
- [ ] Can select a table
- [ ] Can submit booking form
- [ ] Gets success message
- [ ] Booking appears in "My Bookings" section
- [ ] Can cancel booking
- [ ] Gets confirmation on cancel

#### Admin Table Management

- [ ] Can navigate to admin tables page
- [ ] Can add new table
  - [ ] Table number is required
  - [ ] Capacity is required
  - [ ] Can set location (optional)
  - [ ] Can select shape
  - [ ] Can add features
- [ ] Table appears in floor plan after creation
- [ ] Can edit table details
- [ ] Can delete table with confirmation
- [ ] Filters work (by status, location)
- [ ] Statistics cards update correctly

#### Cashier Management

- [ ] Can navigate to cashier dashboard
- [ ] Can see today's bookings
- [ ] Can see upcoming bookings
- [ ] Can click booking to view details
- [ ] For pending bookings:
  - [ ] Can confirm and assign table
  - [ ] Can reject
- [ ] For confirmed bookings:
  - [ ] Can mark as seated
- [ ] For seated customers:
  - [ ] Can mark as completed
  - [ ] Can mark as no-show
- [ ] Statistics update correctly

#### Real-time Updates (WebSocket)

- [ ] Open app in two browser windows
- [ ] Create booking in customer window
- [ ] Verify it appears in cashier window without refresh
- [ ] Confirm booking in cashier window
- [ ] Verify it updates in customer window
- [ ] Mark as seated in cashier window
- [ ] Verify it updates in both windows

### 11. Error Handling

- [ ] Invalid form inputs show validation errors
- [ ] API errors display user-friendly messages
- [ ] Network disconnection handled gracefully
- [ ] WebSocket disconnection triggers reconnection
- [ ] Loading states display while fetching data
- [ ] Empty states show appropriate messages

### 12. Performance

- [ ] Page load time acceptable (<3 seconds)
- [ ] No memory leaks (test in DevTools)
- [ ] Smooth scrolling
- [ ] Modal opens/closes without lag
- [ ] No excessive re-renders (check React DevTools)

### 13. Accessibility

- [ ] Can navigate with keyboard (Tab, Enter)
- [ ] Form labels properly associated with inputs
- [ ] Color contrast meets accessibility standards
- [ ] Focus visible on all interactive elements
- [ ] Modals have proper focus management
- [ ] Error messages are clearly visible

### 14. Security

- [ ] API token properly sent in headers
- [ ] No sensitive data in localStorage (except token)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF tokens if using traditional sessions
- [ ] Input validation on frontend
- [ ] API validation on backend

### 15. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Installation Steps

### 1. Clone/Update Repository

```bash
cd client
git pull origin main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
# Copy example if available
cp .env.example .env

# Edit .env with correct values
nano .env
```

### 4. Verify Backend is Running

```bash
# Backend should be running on configured URL
# Test: curl http://localhost:5000/api/health
```

### 5. Start Development Server

```bash
npm run dev
# or
npm start
```

### 6. Test Main Functionality

- Navigate to http://localhost:3000
- Test customer booking: http://localhost:3000/booking
- Test admin: http://localhost:3000/admin/tables
- Test cashier: http://localhost:3000/cashier/bookings

---

## Troubleshooting

### Issue: Redux not initialized

**Solution:**

```jsx
// app.jsx
import { Provider } from "react-redux";
import store from "./redux/store";

<Provider store={store}>
  <App />
</Provider>;
```

### Issue: WebSocket not connecting

**Solution:**

1. Check `REACT_APP_SOCKET_URL` in .env
2. Verify backend WebSocket is running
3. Check browser console for connection errors
4. Verify CORS is configured on backend

### Issue: API calls failing

**Solution:**

1. Check `REACT_APP_API_URL` in .env
2. Verify backend API is running
3. Check axios.js has correct headers
4. Check network tab in DevTools for request/response

### Issue: Styles not applying

**Solution:**

1. Verify Tailwind CSS build is running
2. Check PostCSS is configured
3. Run `npm run build:css` if available
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Pages not loading

**Solution:**

1. Check routes are in Routes component
2. Verify component paths are correct
3. Check browser console for import errors
4. Test with simpler routes first

### Issue: Real-time updates not working

**Solution:**

1. Verify WebSocket connection (check DevTools Network tab)
2. Check socket listeners are setup correctly
3. Verify Redux actions are dispatched
4. Check Redux DevTools for state updates

---

## Build & Deploy

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Test Production Build Locally

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
# vercel.json should be configured
vercel
# or
vercel --prod
```

### Deploy to Other Services

1. Follow service-specific documentation
2. Set environment variables on hosting platform
3. Ensure Node.js version compatible
4. Run build command
5. Set start command to `npm run preview` or `npm start`

---

## Performance Optimization

### Bundle Size

```bash
npm run build
# Check dist/ folder size
# Should be < 500KB gzipped for main bundle
```

### Code Splitting

```jsx
// For large pages, use React.lazy
const AdminTableManagementPage = React.lazy(() =>
  import("./pages/AdminTableManagementPage")
);
```

### Image Optimization

- Use WebP format where possible
- Optimize image sizes
- Use lazy loading for images

### Caching

- Set appropriate cache headers on CDN
- Use service worker for offline support
- Cache static assets

---

## Monitoring & Logging

### Development Logging

```jsx
// Enable debug logs
const DEBUG = true;

if (DEBUG) {
  console.log("Booking created:", booking);
}
```

### Production Logging (Optional)

```jsx
// Use service like Sentry for error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV,
});
```

### WebSocket Debugging

```jsx
// In socketService.js
const DEBUG_SOCKET = process.env.REACT_APP_ENV === "development";

if (DEBUG_SOCKET) {
  console.log("WebSocket event:", event, data);
}
```

---

## Maintenance

### Regular Tasks

- [ ] Update dependencies monthly: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Monitor error logs in production
- [ ] Check page load performance
- [ ] Test critical user flows monthly

### Quarterly Tasks

- [ ] Review and update documentation
- [ ] Refactor legacy code
- [ ] Optimize performance bottlenecks
- [ ] Update browser support list

### Yearly Tasks

- [ ] Major dependency updates
- [ ] Architecture review
- [ ] User feedback analysis
- [ ] Feature planning

---

## Support & Documentation References

- **Frontend Guide:** `/docs/FRONTEND_INTEGRATION_GUIDE.md`
- **Quick Reference:** `/docs/QUICK_REFERENCE.md`
- **Implementation Summary:** `/docs/FRONTEND_IMPLEMENTATION_SUMMARY.md`
- **Backend Documentation:** `../server/modules/tableBooking/README.md`
- **Backend API Reference:** `../server/modules/tableBooking/API_REFERENCE.md`

---

## Success Indicators

Your deployment is successful if:

✅ All three user roles can access their respective pages
✅ Customers can create and manage bookings
✅ Admins can manage tables
✅ Cashiers can manage daily operations
✅ Real-time updates work (WebSocket events visible)
✅ All forms validate input correctly
✅ Error messages display user-friendly text
✅ Pages load within 3 seconds
✅ Mobile responsive layout works
✅ No console errors or warnings

---

## Contact & Issues

For issues or questions:

1. Check troubleshooting section above
2. Review documentation files
3. Check browser console for error messages
4. Review Redux DevTools for state issues
5. Check Network tab for API issues

---

**Last Updated:** 2024
**Status:** Ready for Production
