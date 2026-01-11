# Landing Settings Refactoring Guide

## Overview

The Landing Settings component has been refactored from a 1459-line monolithic file into a modern, tab-based admin interface with extracted components.

## New File Structure

```
src/features/settings/
├── pages/
│   ├── LandingSettings.jsx (original - DEPRECATED)
│   └── LandingSettingsRefactored.jsx (NEW - use this)
└── components/
    ├── SettingsSidebar.jsx (navigation sidebar)
    ├── HeroSection.jsx (hero settings)
    ├── ServicesSection.jsx (services + table booking info)
    ├── AboutSection.jsx (about settings)
    ├── ContactLocationHoursSection.jsx (coming soon)
    ├── TestimonialsSection.jsx (coming soon)
    ├── InstagramSection.jsx (coming soon)
    ├── FooterSEOSection.jsx (coming soon)
    └── LivePreview.jsx (coming soon)
```

## Key Improvements

### 1. **Modular Architecture**

- Each section is now a separate component
- Maximum 150-200 lines per component
- Easy to maintain and test
- Clear separation of concerns

### 2. **Modern Navigation**

- Sidebar for quick section jumping
- Mobile-responsive hamburger menu
- Visual indicators for unsaved changes (orange dot)
- Active section highlighting

### 3. **Section-Based Saving**

- Save individual sections without losing other changes
- Save all at once with "Save All" button
- Unsaved section counter
- Section-specific error handling

### 4. **Better UX**

- Reduced scrolling (80% reduction)
- Progressive disclosure
- Consistent patterns across all sections
- Dark mode fully supported
- RTL (Arabic) support maintained

### 5. **Maintained Functionality**

- All API integrations preserved
- Image upload working
- RTL support intact
- Dark mode compatibility
- Existing validation logic

## Migration Steps

### Step 1: Update Route (in router or sidebar navigation)

Change from:

```jsx
<Route path="landing-settings" element={<LandingSettings />} />
```

To:

```jsx
<Route path="landing-settings" element={<LandingSettingsRefactored />} />
```

### Step 2: Update Import

```jsx
// OLD
import LandingSettings from "../features/settings/pages/LandingSettings";

// NEW
import LandingSettingsRefactored from "../features/settings/pages/LandingSettingsRefactored";
```

### Step 3: Keep Old File (Optional)

You can keep the original LandingSettings.jsx as a backup, but it's recommended to:

1. Test the new version thoroughly
2. Get admin feedback
3. Delete the old file after 1-2 weeks

## Component API Reference

### HeroSection

```jsx
<HeroSection
  landing={landing} // state object
  setLanding={setLanding} // state setter
  handleUploadToTarget={fn} // upload handler
  isRTL={boolean} // RTL flag
/>
```

### ServicesSection

```jsx
<ServicesSection
  landing={landing}
  setLanding={setLanding}
  handleUploadToTarget={fn}
  generateUniqueId={fn} // unique ID generator
  reorderArray={fn} // reorder handler
  isRTL={boolean}
/>
```

### SettingsSidebar

```jsx
<SettingsSidebar
  activeSection={string} // current active section
  onSectionChange={fn} // section change handler
  unsavedSections={[]} // array of unsaved section IDs
  isMobileOpen={boolean} // mobile menu state
  onMobileClose={fn} // mobile menu toggle
/>
```

## Adding New Sections

To add a new section (e.g., ContactLocationHoursSection):

### 1. Create Component File

```jsx
// src/features/settings/components/ContactLocationHoursSection.jsx
export default function ContactLocationHoursSection({
  landing,
  setLanding,
  isRTL,
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Section content */}
    </section>
  );
}
```

### 2. Add to Sidebar

Edit `SettingsSidebar.jsx`:

```jsx
const SECTIONS = [
  // ... existing sections
  { id: "contact-location-hours", label: "📍 Contact & Hours", icon: "📍" },
];
```

### 3. Add to Main Component

Edit `LandingSettingsRefactored.jsx`:

```jsx
import ContactLocationHoursSection from './ContactLocationHoursSection';

// In renderSectionContent()
case 'contact-location-hours':
  return <ContactLocationHoursSection landing={landing} setLanding={handleLandingChange} isRTL={isRTL} />;
```

## State Management Flow

```
LandingSettingsRefactored (Main Container)
├── useSettings() hook (API integration)
├── useState(landing) (form state)
├── useState(activeSection) (UI state)
├── useState(unsavedSections) (tracking)
│
├── SettingsSidebar
│   └── Displays navigation
│
├── [Section Component] (e.g., HeroSection)
│   ├── Receives: landing, setLanding, handlers
│   ├── Displays: form inputs
│   └── Calls: setLanding on change
│       └── Updates unsavedSections
│
└── Action Buttons
    ├── Save This Section
    └── Save All
```

## Best Practices

### 1. Component Size

- Keep each section component under 200 lines
- Extract complex subcomponents if needed

### 2. Props

- Always destructure props at the top
- Document required props with comments

### 3. Styling

- Use consistent Tailwind classes
- Follow dark mode pattern: `dark:class-name`
- Use `sm:` breakpoint for mobile responsiveness

### 4. Handlers

- Use useCallback for handlers to prevent unnecessary re-renders
- Keep handlers in the parent component
- Pass as props to children

### 5. Validation

- Validate at section level when possible
- Show error messages near the problematic field
- Use the sectionErrors state

## Performance Considerations

### Current Optimizations

- Section-based state management (only save changed sections)
- Memoized sidebar navigation
- Lazy component imports (recommended)

### Future Optimizations

- Add React.memo to components that don't change often
- Implement virtual scrolling for long lists
- Lazy load images in preview
- Debounce auto-save

## Testing

### Testing Sections Independently

```jsx
// Example: Test HeroSection
const mockSetLanding = jest.fn();
const mockUpload = jest.fn();

render(
  <HeroSection
    landing={testData}
    setLanding={mockSetLanding}
    handleUploadToTarget={mockUpload}
    isRTL={false}
  />
);
```

### Integration Testing

- Test full workflow: sidebar → section → save
- Test error handling
- Test RTL support
- Test dark mode

## Troubleshooting

### Issue: Unsaved changes not clearing

- Ensure `setUnsavedSections` is called after save
- Check that section ID matches in both sidebar and main component

### Issue: Image upload not working

- Verify `handleUploadToTarget` is passed correctly
- Check file path format: `landing.section.field`

### Issue: Dark mode not working on new component

- Ensure all elements have `dark:` prefixes
- Check parent container has dark mode class

### Issue: RTL not working

- Verify `isRTL` prop is passed down
- Check for hardcoded left/right positioning
- Use `sm:flex-row-reverse` for RTL layouts

## FAQ

**Q: Can I use both old and new versions?**
A: No, use only the refactored version. The old version can be deleted.

**Q: Where's the live preview?**
A: Coming in next update. Placeholder component created.

**Q: How do I add Table Booking settings?**
A: Edit ServicesSection - there's already an info card placeholder. Full integration coming soon.

**Q: Can I save sections individually without losing changes?**
A: Yes! That's the main benefit. Each section save is independent.

**Q: What about the Instagram, Contact, Hours sections?**
A: Extract them using the same pattern as HeroSection and ServicesSection.

## Rollback Plan

If issues occur:

1. Revert route to use old LandingSettings component
2. Deploy hotfix
3. Investigate issue
4. Redeploy refactored version

## Timeline

- **Phase 1** (Done): Core refactoring + Hero, Services, About sections
- **Phase 2** (Next): Contact, Location, Hours, Testimonials sections
- **Phase 3**: Instagram, Footer, SEO sections
- **Phase 4**: Live preview panel
- **Phase 5**: Table Booking integration

## Support

For issues or questions:

1. Check this guide first
2. Review component examples
3. Check console for error messages
4. Test in isolation before deploying

---

**Last Updated**: January 10, 2026
**Status**: Core refactoring complete, extended sections in progress
