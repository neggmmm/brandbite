# Quick Testing Guide

## ✅ Integration Complete - Ready to Test!

---

## 🚀 Start Testing Now

### Step 1: Open Landing Settings

```
URL: http://localhost:5174/admin/settings/landing
Or navigate from admin dashboard → Settings → Landing Page
```

### Step 2: You Should See

```
┌─────────────────────────────────────────────────────┐
│                  LANDING SETTINGS                   │
├──────────────────┬──────────────────────────────────┤
│                  │                                  │
│  SIDEBAR         │  HERO SECTION (default)         │
│  ───────         │  ───────────────────────────    │
│                  │                                  │
│ 🔤 Hero          │ Title: [_________________]      │
│ 🛠 Services      │ Subtitle: [_________________]   │
│ 📖 About         │ Image: [Upload Button]          │
│ 🍽️ Tables ← NEW │ Color: [Color Picker]           │
│ 📞 Contact       │ Enable: [✓ Toggle]              │
│ 📍 Location      │                                  │
│ ⭐ Reviews       │ [Save Hero] [Save All (0)]      │
│ 📱 Instagram     │                                  │
│ 📄 Footer        │                                  │
│                  │                                  │
└──────────────────┴──────────────────────────────────┘
```

---

## 🧪 Test Table Booking Section

### 1. Click on Table Booking

```
Click: 🍽️ Table Booking in sidebar
```

### 2. You Should See

```
┌──────────────────────────────────────────────────┐
│  🍽️ Table Booking Section                       │
│  Configure how table booking is displayed        │
│                                                  │
│  [ ✓ Enable Section ]                            │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ ✓ Display on Landing Page               │   │
│  │ Show table booking on your landing page │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ENGLISH                                         │
│  ─────────                                       │
│  Section Title: [Book a Table_________]         │
│  Description: [Reserve a table.........]        │
│  Button Text: [Book Now_______]                 │
│                                                  │
│  العربية (ARABIC)                              │
│  ──────────────────                              │
│  عنوان: [احجز طاولة_________]                   │
│  الوصف: [احجز طاولة في مطعمنا.....]            │
│  نص الزر: [احجز الآن_______]                   │
│                                                  │
│  ℹ️  Table Booking Settings                      │
│     These settings control the table booking ... │
│                                                  │
│  ✓ Manage Tables                                 │
│    [Go to Tables Admin →]                        │
│                                                  │
│  [Save Table Booking] [Save All (0)]            │
└──────────────────────────────────────────────────┘
```

### 3. Try These Actions

#### Edit English Title

```
Click: Section Title field
Clear: Current text
Type: "Reserve Your Table"
Result: Field updates, nothing saved yet
```

#### Toggle Enable

```
Click: "Enable Section" checkbox
Result: Toggle switches on/off
```

#### Save Section

```
Click: "Save Table Booking" button
Expected:
  ✅ Button shows "Saving..."
  ✅ Success message appears
  ✅ Orange dot disappears from sidebar
  ✅ Button re-enables after 3 seconds
```

---

## 📋 Full Test Checklist

### Navigation Tests

- [ ] Click "🍽️ Table Booking" - section appears
- [ ] Click "🔤 Hero" - section changes
- [ ] Click "🛠 Services" - section changes
- [ ] Orange dot appears when editing
- [ ] Orange dot disappears after saving

### Table Booking Tests

- [ ] All form fields visible
- [ ] English and Arabic fields present
- [ ] Enable/disable toggle works
- [ ] Show on landing page toggle works
- [ ] Can edit each field
- [ ] Can save successfully

### Save Functionality Tests

- [ ] Save individual section works
- [ ] Success message appears
- [ ] Unsaved indicator clears
- [ ] Data persists after page refresh
- [ ] No API errors in console

### Dark Mode Tests

- [ ] Toggle dark mode in settings
- [ ] All text visible in dark mode
- [ ] Buttons visible in dark mode
- [ ] Good contrast maintained
- [ ] Dark mode persists

### Mobile Tests (Use F12 DevTools)

- [ ] Resize to 375px width
- [ ] Hamburger menu appears
- [ ] Click hamburger - menu opens
- [ ] Click section - form appears
- [ ] Can edit on mobile
- [ ] Save works on mobile

### Language Tests (RTL)

- [ ] Change language to Arabic
- [ ] Interface flips to RTL
- [ ] Arabic text displays correctly
- [ ] Layout is mirrored
- [ ] All fields work in Arabic

---

## ❌ Troubleshooting

### Issue: Page shows "Coming Soon"

**Solution:** Make sure you clicked correct section in sidebar

### Issue: Form fields empty

**Solution:** This is normal on first load - settings might not be saved yet

### Issue: Save button disabled

**Solution:** Click the form to make changes first - button enables when unsaved changes exist

### Issue: Dark mode not working

**Solution:** Check if dark mode is enabled in your browser settings

### Issue: Text appears cut off

**Solution:** Try full-screen view or check zoom level (Ctrl+0)

---

## 🎯 What to Verify

### Component Integration

✅ TableBookingSection component loaded  
✅ Props properly passed from parent  
✅ State updates work correctly  
✅ No console errors

### Sidebar Navigation

✅ 9 sections visible (including Table Booking)  
✅ Orange dots appear on unsaved sections  
✅ Can click any section  
✅ Active section highlighted

### Save Functionality

✅ Individual section save works  
✅ Save All button works  
✅ API calls successful  
✅ Data persists after refresh

### UI/UX

✅ Dark mode supported  
✅ Mobile responsive  
✅ English/Arabic working  
✅ Error messages clear  
✅ Success messages appear

---

## 📸 Screenshots to Verify

### Desktop View - Table Booking Section

```
Should show:
- Full form with all fields
- Two-column layout (English/Arabic)
- Buttons and toggles
- Links to Tables Admin
```

### Mobile View - Table Booking

```
Should show:
- Single column layout
- Touch-friendly buttons
- Hamburger menu works
- Fields accessible without scroll
```

### Dark Mode - Table Booking

```
Should show:
- Dark background
- Light text
- Good contrast
- All elements visible
```

---

## ✅ Success Criteria

Your integration is successful when:

- [ ] Dev server running without errors
- [ ] Can navigate to `/admin/settings/landing`
- [ ] See sidebar with 9 sections
- [ ] Can click "🍽️ Table Booking"
- [ ] Form displays correctly
- [ ] Can edit fields
- [ ] Can save section
- [ ] Success message appears
- [ ] Changes persist after refresh
- [ ] No console errors
- [ ] Works in dark mode
- [ ] Works on mobile
- [ ] Works in Arabic

---

## 🚀 Next Steps

### If All Tests Pass ✅

1. Great! Integration is working
2. Try editing and saving different sections
3. Check that data appears on landing page
4. Deploy to production when ready

### If Issues Found ❌

1. Check browser console for errors
2. Verify all files were created
3. Check import paths
4. Verify state structure
5. See TROUBLESHOOTING section

---

## 💾 Save & Verify Data

### Check Data Saved

```javascript
// Open browser DevTools Console (F12)
// Check localStorage or IndexedDB for saved data
localStorage.getItem("restaurant-settings");
```

### API Response

```javascript
// In Network tab (F12)
// Look for POST to /api/restaurants/{id}/system-settings
// Response should include tableBooking data
```

---

## 📞 Quick Reference

**Dev Server:** http://localhost:5174/  
**Landing Settings:** http://localhost:5174/admin/settings/landing  
**Tables Admin:** http://localhost:5174/admin/tables

**Key Files:**

- TableBookingSection: `src/features/settings/components/`
- App Router: `src/App.jsx`
- LandingSettings: `src/features/settings/pages/LandingSettingsRefactored.jsx`

---

## 🎉 You're All Set!

Everything is integrated and ready to test. Start with the quick steps above and work through the checklist. All should work smoothly!

**Happy testing! 🚀**
