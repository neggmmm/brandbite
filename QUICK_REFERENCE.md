# Quick Reference - White-Label Landing Page System

## Admin Tasks

### To Update Landing Page Content:

1. Go to: **Admin Panel** → **Settings** → **Landing Page**
2. Edit any of these sections:
   - Hero Section (title, subtitle)
   - About Section (title, content)
   - Location & Address
   - Opening Hours (each day)
   - Contact Information
   - Call Us Number (hotline)
   - Testimonials (add/edit/remove)
   - Footer Text
   - SEO Settings
3. Click **"Save All Settings"**
4. ✅ Changes appear on landing page immediately

### Bilingual (EN/AR) Support:

- Every text field has English AND Arabic versions
- Change language on landing page and both versions display correctly
- Addresses and labels support both languages

## Developer Tasks

### Files Modified:

| File                                                     | Purpose                                   |
| -------------------------------------------------------- | ----------------------------------------- |
| `server/src/modules/restaurant/restaurant.controller.js` | Returns full restaurant doc on save       |
| `client/src/context/SettingContext.jsx`                  | Handles full doc responses, updates state |
| `client/src/features/settings/pages/LandingSettings.jsx` | Admin UI for all settings                 |
| `client/src/pages/LandingPage.jsx`                       | Consumes all settings from context        |

### To Debug:

1. Open browser **DevTools** → **Console**
2. Look for logs starting with:
   - `[updateSystemCategory]` (backend)
   - `[saveSystemCategory]` (frontend context)
3. Check **Network tab** for response structure
4. See `WHITE_LABEL_SYSTEM_GUIDE.md` for detailed debugging

### To Test:

Run verification script:

```bash
node verify-white-label.js
```

Quick manual test:

1. Admin saves a setting
2. Check console for logs
3. Navigate to landing page
4. Verify change appears without refresh
5. Refresh page and verify persistence

## Data Structure

### What Admins Can Control:

```javascript
systemSettings.landing = {
  hero: { title, titleAr, subtitle, subtitleAr },
  about: { title, titleAr, content, contentAr },
  contact: { email, phone },
  callUs: { number, numberAr, label, labelAr },
  location: { address, addressAr, latitude, longitude },
  hours: {
    monday: { open, close },
    tuesday: { open, close },
    // ... etc for each day
  },
  testimonials: [
    { name, content, rating },
    // ... can add many
  ],
  footer: { text },
  seo: { title, description },
};
```

### What Gets Displayed:

- Public Landing Page (/) shows all settings
- SEO uses title and description
- Browser title updates from seo.title
- Testimonials appear with ratings

## Common Issues & Solutions

### Issue: Settings save shows success but don't appear on landing page

**Solution:**

1. Check console for `[updateSystemCategory]` logs
2. Verify response includes `data.systemSettings.landing`
3. Check SettingContext logs for `[saveSystemCategory]`
4. Verify `responseData.systemSettings` is detected as `true`
5. Manual state check in React DevTools

### Issue: Changes appear on landing but don't persist after refresh

**Solution:**

1. Check MongoDB that data is actually saved
2. Verify `GET /api/restaurant` endpoint returns landing settings
3. Check that SettingContext loads settings on app mount
4. Check browser's Network tab for GET request after refresh

### Issue: Bilingual text shows same language for both

**Solution:**

1. Verify both English and Arabic fields are filled in admin
2. Check that `i18n.language` is correctly set
3. Verify `isRTL` flag is correct on landing page
4. Check component uses: `isRTL ? (fieldAr || field) : (field || fieldAr)`

## Monitoring

### Key Metrics:

- ✅ Settings load time: Should be < 100ms
- ✅ State update latency: Should be instant (< 50ms)
- ✅ Landing page re-render: Should be < 300ms
- ✅ Database update: Check MongoDB operation time

### Health Checks:

- Admin settings page loads without errors
- Landing page renders all sections
- Console shows no error messages
- Network responses all 200-status
- Settings persist across page refreshes

## Useful Commands

```bash
# Run verification script
node verify-white-label.js

# Check if files were modified
git status

# See recent changes
git diff client/src/features/settings/pages/LandingSettings.jsx

# Monitor backend logs
tail -f server/logs/app.log | grep updateSystemCategory

# Check database
db.restaurants.findOne({}, { systemSettings: 1 })
```

## Files for Reference

- **Complete Guide:** `WHITE_LABEL_SYSTEM_GUIDE.md`
- **Implementation Status:** `IMPLEMENTATION_COMPLETE.md`
- **This Quick Reference:** `QUICK_REFERENCE.md`

## Support

For detailed information, see:

- Data flow diagram: `WHITE_LABEL_SYSTEM_GUIDE.md` → Data Flow Diagram
- Testing checklist: `WHITE_LABEL_SYSTEM_GUIDE.md` → Testing Checklist
- Debugging guide: `WHITE_LABEL_SYSTEM_GUIDE.md` → Debugging Guide

---

**Last Updated:** 2024  
**Status:** ✅ Production Ready
