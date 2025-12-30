# White-Label Landing Page System - Complete Implementation Guide

## Overview

This document outlines the complete white-label system that has been implemented, allowing admins to control every aspect of the landing page through the admin panel without any code changes.

## Architecture & Data Flow

### 1. Backend Flow

```
Admin Panel → POST /api/restaurant/system-settings/landing
↓
RestaurantController.updateSystemCategory()
↓
RestaurantService.updateSystemCategory(category, data)
↓
MongoDB: restaurant.systemSettings.landing = {...}
↓
Returns FULL restaurant document (with systemSettings included)
↓
Frontend receives: { success: true, data: { ...fullRestaurant } }
```

**Key Change:** Backend now returns the ENTIRE updated restaurant document, not just the landing category subset. This ensures the frontend can access:

- `data.systemSettings` (all system settings)
- `data.branding` (logo, colors)
- `data.restaurantName`
- `data.description`
- And all other root-level fields

### 2. Frontend Context Flow

```
Admin saves Landing settings via LandingSettings.jsx
↓
Calls: await saveSystemCategory('landing', { ...landingData })
↓
SettingContext.saveSystemCategory():
  1. Wraps payload: { landing: {...landingData} }
  2. POSTs to /api/restaurant/system-settings/landing
  3. Receives response with FULL restaurant doc
  4. Detects: if (responseData.systemSettings) → full doc detected
  5. Merges: setSettings(prev => ({ ...responseData, ... }))
↓
Local state updated immediately
↓
useSettings hook consumers (LandingPage) trigger re-render
↓
LandingPage reads from: settings.systemSettings.landing
```

**Key Change:** SettingContext now intelligently handles full restaurant responses and updates all state, not just settings subset.

### 3. Landing Page Consumption

```
LandingPage.jsx:
  - Reads: const landing = rawSettings?.systemSettings?.landing || {}
  - Extracts: hero, about, testimonials, contact, callUs, location, hours, footer, seo
  - Renders each section using admin-controlled data
  - No hardcoded fallbacks (uses admin values OR sensible defaults)
```

## Modified Files

### File: `server/src/modules/restaurant/restaurant.controller.js`

**Function:** `updateSystemCategory()`
**Change:** Return full restaurant document instead of just category data

```javascript
// OLD:
res.json({ success: true, data: updated.systemSettings[category] });

// NEW:
console.log("[updateSystemCategory] category:", category);
console.log(
  "[updateSystemCategory] updated doc has systemSettings:",
  !!updated.systemSettings
);
res.json({ success: true, data: updated });
```

**Why:** Frontend can extract all needed fields; more robust and resilient

---

### File: `client/src/context/SettingContext.jsx`

**Function:** `saveSystemCategory()`
**Changes:**

1. Wraps payload with category key
2. Detects full restaurant response
3. Merges entire response into state
4. Adds 5+ logging statements for debugging

```javascript
async saveSystemCategory(category, categoryPayload) {
  // 1. Wrap with category key
  const payload = { [category]: categoryPayload };

  // 2. Send request
  const res = await api.put(`/api/restaurant/system-settings/${category}`, payload);
  const responseData = res.data?.data;

  // 3. Detect full restaurant response
  if (responseData && responseData.systemSettings) {
    // Full restaurant doc - merge it all
    setSettings(prev => ({ ...responseData, branding: responseData.branding || prev.branding }));
  } else if (responseData) {
    // Partial response - use local payload as fallback
    const categoryData = { [category]: categoryPayload };
    setSettings(prev => ({ ...prev, systemSettings: { ...prev.systemSettings, ...categoryData } }));
  }
}
```

---

### File: `client/src/features/settings/pages/LandingSettings.jsx`

**Complete Rewrite** - Now a comprehensive admin form with:

#### State Structure

```javascript
const [landing, setLanding] = useState({
  hero: { title: "", titleAr: "", subtitle: "", subtitleAr: "" },
  about: { title: "", titleAr: "", content: "", contentAr: "" },
  testimonials: { items: [] },
  contact: { email: "", phone: "" },
  callUs: { number: "", numberAr: "", label: "", labelAr: "" },
  location: { address: "", addressAr: "", latitude: "", longitude: "" },
  hours: {
    monday: { open: "11:00", close: "22:00" },
    tuesday: { open: "11:00", close: "22:00" },
    wednesday: { open: "11:00", close: "22:00" },
    thursday: { open: "11:00", close: "22:00" },
    friday: { open: "11:00", close: "22:00" },
    saturday: { open: "10:00", close: "23:00" },
    sunday: { open: "10:00", close: "23:00" },
  },
  footer: { text: "" },
  seo: { title: "", description: "" },
});
```

#### Sections

1. **Hero Section** - Title + Subtitle (EN/AR)
2. **About Section** - Title + Content (EN/AR)
3. **Location & Address** - Street address + Lat/Long (EN/AR)
4. **Opening Hours** - Mon-Sun with open/close times
5. **Contact Information** - Email + Phone display
6. **Call Us Number** - Hotline number + Label (EN/AR)
7. **Testimonials** - Add/remove customer reviews with ratings
8. **Footer** - Copyright text
9. **SEO Settings** - Page title + Meta description

#### Key Methods

- `handleSave()` - Calls saveSystemCategory('landing', landing)
- `handleHourChange(day, field, value)` - Updates specific day/time
- `handleTestimonialAdd()` - Adds new testimonial
- `handleTestimonialRemove(idx)` - Removes testimonial
- `handleTestimonialChange(idx, key, value)` - Updates testimonial field
- Real-time success/error message display

---

### File: `client/src/pages/LandingPage.jsx`

**Key Changes:**

#### 1. Added callUs and hours destructuring

```javascript
const callUs = landing?.callUs || {};
const hours = landing?.hours || {};
```

#### 2. Updated contact/location card rendering

```javascript
{
  icon: Phone,
  title: callUs.label || callUs.labelAr || t("call_us"),
  content: isRTL
    ? (callUs.numberAr || callUs.number || contact.phone || settings.phone)
    : (callUs.number || contact.phone || settings.phone),
  ...
}
```

#### 3. Updated opening hours display

```javascript
{
  icon: Clock,
  title: t("opening_hours"),
  content: hours && Object.keys(hours).length > 0
    ? Object.entries(hours)
        .map(([day, times]) =>
          `${day.charAt(0).toUpperCase() + day.slice(1)}: ${times.open} - ${times.close}`
        )
        .join('\n')
    : "Mon-Fri: 11AM - 10PM\nSat-Sun: 10AM - 11PM",
  ...
}
```

#### 4. Updated location address with i18n support

```javascript
{
  icon: MapPin,
  title: t("location"),
  content: isRTL
    ? (location.addressAr || location.address || settings.address)
    : (location.address || settings.address),
  ...
}
```

**Result:** All contact info, location, hours, and call-us number now controlled by admin without any code changes.

---

## Database Schema

### Restaurant Document Structure

```javascript
{
  _id: ObjectId,
  restaurantName: String,
  branding: {
    logo: String,
    colors: { primary: String, secondary: String, ... },
    ...
  },
  address: String,
  phone: String,
  description: String,

  // System Settings - All white-label content
  systemSettings: {
    landing: {
      hero: {
        title: String,
        titleAr: String,
        subtitle: String,
        subtitleAr: String,
      },
      about: {
        title: String,
        titleAr: String,
        content: String,
        contentAr: String,
      },
      testimonials: {
        items: [
          {
            name: String,
            content: String,
            rating: Number (1-5),
          }
        ],
      },
      contact: {
        email: String,
        phone: String,
      },
      callUs: {
        number: String,
        numberAr: String,
        label: String,
        labelAr: String,
      },
      location: {
        address: String,
        addressAr: String,
        latitude: Number,
        longitude: Number,
      },
      hours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        // ... etc for each day
      },
      footer: {
        text: String,
      },
      seo: {
        title: String,
        description: String,
      },
      // Other sections can be added here
    },
  },
}
```

---

## End-to-End Testing Checklist

### Phase 1: Admin Settings Save

- [ ] Navigate to Admin Panel → Settings → Landing Page
- [ ] Edit Hero title (English version)
- [ ] Edit Hero title (Arabic version)
- [ ] Edit About content section
- [ ] Change opening hours (e.g., Monday: 12:00 - 23:00)
- [ ] Edit location address
- [ ] Edit call-us number and label
- [ ] Add a new testimonial with name, content, and rating
- [ ] Click "Save All Settings"
- [ ] Verify: Success message appears
- [ ] **Backend check:** POST should receive full restaurant doc response

### Phase 2: Immediate UI Update (Without Refresh)

- [ ] Navigate to Landing Page (/)
- [ ] Verify: Hero title shows YOUR edited text (not default)
- [ ] Verify: About section shows YOUR edited content
- [ ] Verify: Opening hours show YOUR edited times (e.g., Mon: 12:00 - 23:00)
- [ ] Verify: Location address shows YOUR edited address
- [ ] Verify: Call Us number shows YOUR edited number
- [ ] Verify: Testimonials section includes YOUR new testimonial
- [ ] **Critical:** All changes visible WITHOUT refreshing page

### Phase 3: Persistence Check (After Refresh)

- [ ] Refresh the landing page (F5 or Ctrl+Shift+R to clear cache)
- [ ] Verify: Hero title still shows YOUR edited text
- [ ] Verify: All other settings still persisted from Phase 2
- [ ] **Critical:** Data persists in database and re-fetches correctly

### Phase 4: Bilingual (i18n) Testing

- [ ] Go back to admin settings
- [ ] Edit Arabic versions (titleAr, subtitleAr, contentAr, addressAr, etc.)
- [ ] Save settings
- [ ] Switch landing page language to Arabic (change i18n language)
- [ ] Verify: Arabic content displays correctly
- [ ] Verify: RTL layout applied
- [ ] Switch back to English
- [ ] Verify: English content displays, LTR layout

### Phase 5: Edge Cases

- [ ] Save with empty fields (should allow/preserve)
- [ ] Save with very long text (should not break UI)
- [ ] Add multiple testimonials (verify all display)
- [ ] Edit hour with edge times (00:00, 23:59)
- [ ] Test with coordinates outside normal range
- [ ] Verify footer text renders correctly

### Phase 6: Admin Route Protection

- [ ] Without logging in, try accessing `/admin/settings/landing`
- [ ] Should redirect to login
- [ ] Verify admin-only access controls work

---

## Debugging Guide

### Issue: Settings save shows success but changes don't appear on landing page

**Step 1: Check Backend Response**

```javascript
// In browser DevTools Console:
// Make a save and look at Network tab → find the PUT request
// Response should look like:
{
  "success": true,
  "data": {
    "_id": "...",
    "restaurantName": "...",
    "systemSettings": {
      "landing": {
        "hero": { ... },
        "about": { ... },
        // etc
      }
    }
  }
}
```

If `data` field is missing or incomplete, backend controller needs fixing.

**Step 2: Check SettingContext Logs**

```javascript
// In browser DevTools Console:
// Look for logs with [saveSystemCategory] prefix
// Should see:
// [saveSystemCategory] Wrapping payload with category key
// [saveSystemCategory] Response data has systemSettings: true
// [saveSystemCategory] Updated settings state
```

If logs show `systemSettings: false`, backend is not returning full doc.

**Step 3: Check Frontend State**

```javascript
// In React DevTools (install extension):
// Find SettingContext provider
// Inspect state.settings
// Should have systemSettings.landing with all your edited values
```

**Step 4: Check useSettings Hook**

```javascript
// In LandingPage, add console log:
const { settings, rawSettings } = useSettings();
useEffect(() => {
  console.log(
    "[LandingPage] rawSettings.systemSettings.landing:",
    rawSettings?.systemSettings?.landing
  );
}, [rawSettings]);
```

Should show your edited values immediately after save.

---

## Rollback Plan

If issues arise during testing:

### Rollback Backend (restaurant.controller.js)

```javascript
// Change this back:
res.json({ success: true, data: updated.systemSettings[category] });
// From:
res.json({ success: true, data: updated });
```

### Rollback Context (SettingContext.jsx)

Revert the `saveSystemCategory` function to simpler version that only updates the category subset.

### Rollback LandingPage (LandingPage.jsx)

Remove callUs and hours handling, revert to hardcoded values.

---

## Future Enhancements

1. **Image Upload for Hero/About** - Add image field to hero/about sections
2. **Dynamic Services** - Make action cards fully admin-configurable
3. **Instagram Feed Integration** - Pull live Instagram posts
4. **Promotional Banner** - Admin-controlled banner for specials/announcements
5. **Multi-language Full Support** - Ensure all sections support EN/AR seamlessly
6. **Landing Page Preview** - Preview changes before saving
7. **Version History** - Track changes to landing content over time
8. **Draft/Publish** - Save drafts before publishing to live site

---

## Key Learnings

1. **Backend Response Design:** Always return complete data objects, not subsets. Easier for frontend to handle.

2. **State Management:** When updating nested state objects (like systemSettings.landing), merge the entire response to ensure consistency.

3. **i18n Handling:** Store both EN and AR versions of text fields. Use `isRTL` flag to determine which to display.

4. **Admin UI Design:** Group related fields in sections. Provide immediate feedback (success/error messages).

5. **No Hardcoded Values:** Replace all hardcoded UI text with admin-controlled values. Use sensible defaults, not placeholders.

---

## Contact & Questions

For issues or questions about the white-label system:

1. Check the debugging guide above
2. Review the code changes in each modified file
3. Check browser console for error messages
4. Verify database contains expected data structure
