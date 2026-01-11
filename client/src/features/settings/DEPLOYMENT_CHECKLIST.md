# Landing Settings Refactoring - Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality

- [ ] All new components follow established patterns
- [ ] Dark mode classes applied consistently
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] No console errors or warnings
- [ ] Accessibility features (labels, ARIA) present
- [ ] Comments added for complex logic

### ✅ API Integration

- [ ] All useSettings hooks properly imported
- [ ] saveSystemCategory calls using correct parameters
- [ ] Image upload handlers properly bound
- [ ] Error handling for failed API calls
- [ ] Loading states visible to user
- [ ] No API breaking changes

### ✅ State Management

- [ ] Landing state structure verified
- [ ] unsavedSections tracking works correctly
- [ ] Deep merge logic handles nested objects
- [ ] Redux reviews integration still working
- [ ] No state mutation issues
- [ ] Unique ID generation prevents collisions

### ✅ i18n & RTL

- [ ] All text fields have English + Arabic versions
- [ ] RTL layout classes applied where needed
- [ ] Translation keys properly imported
- [ ] Bilingual form labels working
- [ ] RTL input field ordering correct

### ✅ Dark Mode

- [ ] All inputs show properly in dark mode
- [ ] Colors have dark: variants
- [ ] Text contrast meets WCAG standards
- [ ] Icons visible in both light and dark
- [ ] Borders defined for dark mode
- [ ] No hardcoded colors

### ✅ Mobile Responsiveness

- [ ] Hamburger menu works on small screens
- [ ] Touch targets are at least 44x44px
- [ ] No horizontal scrolling on mobile
- [ ] Form inputs are tap-friendly
- [ ] Images scale appropriately
- [ ] Viewport meta tag present

---

## Step-by-Step Deployment

### Phase 1: Router Update (5 minutes)

**Location:** Find your router file (likely `src/routes` or `src/App.jsx`)

**Current Code:**

```jsx
import LandingSettings from "../features/settings/pages/LandingSettings";

<Route path="/settings/landing" element={<LandingSettings />} />;
```

**Updated Code:**

```jsx
import LandingSettingsRefactored from "../features/settings/pages/LandingSettingsRefactored";

<Route path="/settings/landing" element={<LandingSettingsRefactored />} />;
```

**Verification:**

```bash
✓ No import errors
✓ Router starts without issues
✓ Component loads at /settings/landing
```

---

### Phase 2: Browser Testing (30 minutes)

#### Desktop (1920x1080)

- [ ] Sidebar visible on left side
- [ ] All 8 sections clickable in sidebar
- [ ] Hero section loads and displays properly
- [ ] Service cards show with all fields
- [ ] Images upload without errors
- [ ] Save button works for each section
- [ ] Success message appears after save
- [ ] Unsaved indicator (orange dot) appears
- [ ] "Save All" button counts unsaved sections

#### Tablet (768x1024)

- [ ] Sidebar sidebar visible and functional
- [ ] Form inputs responsive (2-column layout)
- [ ] Images display at correct size
- [ ] Buttons are tap-friendly (44x44px minimum)
- [ ] No horizontal scrolling
- [ ] Touch interactions work smoothly

#### Mobile (375x667)

- [ ] Sidebar collapses to hamburger menu
- [ ] Hamburger menu opens/closes
- [ ] All sections accessible from mobile menu
- [ ] Form inputs stack vertically
- [ ] Images scale down appropriately
- [ ] Buttons full-width and tap-friendly
- [ ] No content cut off
- [ ] Keyboard appears properly for input fields

#### Dark Mode

- [ ] Toggle dark mode in settings
- [ ] All inputs visible in dark mode
- [ ] Text has sufficient contrast
- [ ] Icons visible in dark mode
- [ ] Backgrounds have dark: variants
- [ ] No white text on light backgrounds
- [ ] Borders visible in dark mode

#### Bilingual (English/Arabic)

- [ ] Switch language in settings
- [ ] Arabic forms display with RTL layout
- [ ] Field labels in correct language
- [ ] Buttons in correct language
- [ ] Form is right-aligned in Arabic
- [ ] English forms are left-aligned
- [ ] Back/next arrows flip for RTL

---

### Phase 3: Feature Testing (45 minutes)

#### Hero Section

- [ ] Title field accepts input and saves
- [ ] Subtitle field accepts input and saves
- [ ] Arabic title field works
- [ ] Arabic subtitle field works
- [ ] Image upload works
- [ ] Color picker opens and changes color
- [ ] Enable/disable toggle works
- [ ] Save button saves all changes
- [ ] Unsaved indicator shows

#### Services Section

- [ ] Add new service creates service card
- [ ] Unique ID prevents collisions
- [ ] Remove service deletes card
- [ ] Service title editable
- [ ] Service description editable
- [ ] Service image uploadable
- [ ] Reorder (up/down arrows) work
- [ ] Service navigate path field works
- [ ] Arabic service fields work
- [ ] Enable/disable per service works

#### About Section

- [ ] Title field accepts input
- [ ] Content/description field accepts input
- [ ] Arabic fields work
- [ ] Image upload works
- [ ] Enable/disable toggle works
- [ ] Save works for this section only

#### Testimonials/Reviews

- [ ] Reviews load from Redux store
- [ ] Can select/deselect reviews
- [ ] Selected reviews show orange highlight
- [ ] "Mode" toggle (all/selected) works
- [ ] Title fields (English/Arabic) work
- [ ] Section shows on landing page

#### Image Upload

- [ ] File picker opens
- [ ] Valid image files accepted
- [ ] Invalid files rejected
- [ ] Upload shows loading state
- [ ] Image URL appears in form
- [ ] Uploaded image displays in preview
- [ ] Error handling for failed uploads

#### Save Functionality

- [ ] Individual section save works
- [ ] Save All saves multiple sections
- [ ] Unsaved sections cleared after save
- [ ] Success message appears
- [ ] Error handling for failed saves
- [ ] Unsaved sections reappear on error

#### API Integration

- [ ] saveSystemCategory receives correct data
- [ ] uploadLandingImage gets correct file
- [ ] Reviews fetched from Redux
- [ ] No extra API calls made
- [ ] Offline mode handled gracefully

---

### Phase 4: Data Verification (20 minutes)

#### Database Check

```bash
# Verify settings saved correctly
curl http://localhost/api/restaurants/{id}/system-settings
# Should show landing object with all sections
```

#### Data Integrity

- [ ] Hero data persists after page reload
- [ ] Service cards persist in correct order
- [ ] About section content preserved
- [ ] Testimonials selections saved
- [ ] All images still accessible
- [ ] No data loss on save

---

## Rollback Procedure

If issues arise after deployment:

### Quick Rollback (< 2 minutes)

```jsx
// In router file, change back to:
import LandingSettings from "../features/settings/pages/LandingSettings";

<Route path="/settings/landing" element={<LandingSettings />} />;
```

### Full Cleanup

```bash
# Delete new components (if complete rollback needed)
rm -rf src/features/settings/components/

# Restore from git if available
git checkout src/features/settings/pages/LandingSettings.jsx
```

---

## Post-Deployment Monitoring

### Watch For These Issues

#### Issue: "Section not loading"

- [ ] Check browser console for errors
- [ ] Verify component imports
- [ ] Check if useSettings hook is returning data
- [ ] Verify API is returning correct structure

#### Issue: "Unsaved changes not showing"

- [ ] Check handleLandingChange is being called
- [ ] Verify unsavedSections state is updating
- [ ] Check sidebar is receiving unsaved prop

#### Issue: "Save fails silently"

- [ ] Check API response in network tab
- [ ] Verify error handling in handleSaveSection
- [ ] Check if unsavedSections should remain

#### Issue: "Images not uploading"

- [ ] Verify file size is under limit
- [ ] Check file format is supported
- [ ] Verify handleUploadToTarget exists
- [ ] Check API endpoint is accessible

#### Issue: "Dark mode not working"

- [ ] Verify Tailwind dark mode is enabled in config
- [ ] Check all classes have dark: variant
- [ ] Verify ThemeContext is providing theme state
- [ ] Check CSS class is actually being applied

#### Issue: "Mobile menu stuck"

- [ ] Check isMobileOpen state is updating
- [ ] Verify onMobileClose handler exists
- [ ] Check menu z-index is high enough
- [ ] Verify click outside handler works

---

## Admin Training Checklist

Provide to admin users:

### Getting Started

- [ ] How to access Landing Settings page
- [ ] What the orange dot means (unsaved changes)
- [ ] How to switch between sections
- [ ] How to save individual sections
- [ ] How to save all at once

### For Each Section

- [ ] How to edit Hero banner
- [ ] How to manage Service cards
- [ ] How to edit About section
- [ ] How to manage Testimonials
- [ ] How to upload images
- [ ] How to enable/disable sections

### Mobile Menu

- [ ] How to open hamburger menu
- [ ] How sections are accessed on mobile
- [ ] How to save on mobile

### Troubleshooting

- [ ] What to do if save fails
- [ ] How to check if changes were saved
- [ ] How to clear unsaved changes
- [ ] Who to contact if issues

---

## Success Criteria

**Refactoring is successful when:**

- ✅ All 8 sections render and display data
- ✅ Each section saves independently
- ✅ Unsaved changes visible to user
- ✅ Mobile responsive and hamburger works
- ✅ Dark mode fully functional
- ✅ English/Arabic both work
- ✅ Image uploads successful
- ✅ No console errors
- ✅ No breaking API changes
- ✅ Admin reports positive UX improvement
- ✅ < 2 second load time
- ✅ < 5 seconds to save changes

---

## Performance Benchmarks

**Target Metrics:**

- Page load: < 2 seconds
- Component render: < 500ms
- Save operation: < 3 seconds
- Image upload: < 10 seconds
- Mobile menu open: < 300ms

**Monitor with:**

- React DevTools Profiler
- Browser Network tab
- Browser Performance tab
- Lighthouse scores

---

## Known Limitations (Phase 1)

These will be addressed in Phase 2-3:

- [ ] ContactLocationHoursSection not yet extracted
- [ ] TestimonialsSection not yet extracted
- [ ] InstagramSection not yet extracted
- [ ] FooterSEOSection not yet extracted
- [ ] Live preview not implemented
- [ ] Table booking settings incomplete
- [ ] No keyboard shortcuts
- [ ] No search/filter for long lists
- [ ] No bulk import for multiple services
- [ ] No undo/redo functionality

---

## Support Resources

### Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - Developer guide
- [QUICK_START.md](./QUICK_START.md) - Quick reference

### Testing

- Use browser DevTools for debugging
- Check Redux DevTools for state changes
- Use Network tab to monitor API calls
- Use Lighthouse for performance

### Contact

- Developer: See repository maintainers
- Issues: Create GitHub issue with screenshots
- Questions: Check documentation first

---

**Deployment Date:** ******\_\_\_******

**Deployed By:** ******\_\_\_******

**Approved By:** ******\_\_\_******

**Status:** [ ] Success [ ] Needs Adjustment [ ] Rollback

**Notes:**

---

---

**Last Updated:** January 10, 2026
**Version:** 1.0
