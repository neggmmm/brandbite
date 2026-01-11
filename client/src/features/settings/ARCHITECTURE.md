# Landing Settings Architecture

## Component Hierarchy

```
LandingSettingsRefactored (Main Container)
│
├─ State Management
│  ├─ landing (form data)
│  ├─ activeSection (which section to show)
│  ├─ unsavedSections (tracking changes)
│  └─ sectionErrors (validation errors)
│
├─ Hooks
│  ├─ useSettings() → API integration
│  ├─ useTranslation() → i18n
│  └─ useDispatch/useSelector() → Redux
│
└─ UI Structure
   ├─ SettingsSidebar
   │  ├─ SECTIONS array (8 sections)
   │  ├─ Mobile menu toggle
   │  └─ Unsaved indicators
   │
   ├─ Main Content Area
   │  ├─ Header (sticky)
   │  │  ├─ Title + Description
   │  │  └─ Unsaved count badge
   │  │
   │  ├─ Alert Section
   │  │  ├─ Error messages
   │  │  └─ Success messages
   │  │
   │  ├─ renderSectionContent() → Renders Active Section
   │  │  ├─ case 'hero' → <HeroSection />
   │  │  ├─ case 'services' → <ServicesSection />
   │  │  ├─ case 'about' → <AboutSection />
   │  │  └─ ... more sections
   │  │
   │  └─ Action Buttons (sticky bottom)
   │     ├─ Save This Section
   │     └─ Save All (X)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interaction                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         Child Component (e.g., HeroSection)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ <input onChange={(e) => setLanding({...})} />           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              handleLandingChange()                               │
│  1. Update landing state                                        │
│  2. Mark section as unsaved                                    │
│  3. Trigger re-render                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Visual Feedback                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Orange dot appears next to section in sidebar            │  │
│  │ "Save All (1)" button updates                            │  │
│  │ Fields show updated values                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              User Clicks Save Button                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              handleSaveSection() or handleSaveAll()              │
│  1. Validate data (optional)                                   │
│  2. Call saveSystemCategory() API                              │
│  3. Show loading state                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   API Request                                    │
│  POST /api/restaurants/{id}/system-settings                    │
│  Body: { landing: {...} }                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   API Response                                   │
│  Success: Return updated data                                  │
│  Error: Return error message                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Handle Response                                     │
│  ✅ Success:                                                     │
│     - Clear unsavedSections                                    │
│     - Show success message                                     │
│     - Update state with returned data                          │
│                                                                 │
│  ❌ Error:                                                      │
│     - Show error message                                       │
│     - Keep unsaved flag                                        │
│     - Show section-specific error                              │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── features/
│   └── settings/
│       ├── pages/
│       │   ├── LandingSettings.jsx (DEPRECATED)
│       │   └── LandingSettingsRefactored.jsx ⭐ (NEW)
│       │
│       ├── components/
│       │   ├── SettingsSidebar.jsx ⭐
│       │   ├── HeroSection.jsx ⭐
│       │   ├── ServicesSection.jsx ⭐
│       │   ├── AboutSection.jsx ⭐
│       │   ├── ContactLocationHoursSection.jsx 📝
│       │   ├── TestimonialsSection.jsx 📝
│       │   ├── InstagramSection.jsx 📝
│       │   ├── FooterSEOSection.jsx 📝
│       │   ├── LivePreview.jsx 📝
│       │   └── TemplateSection.jsx 📋
│       │
│       ├── QUICK_START.md ⭐
│       ├── REFACTORING_GUIDE.md ⭐
│       └── IMPLEMENTATION_SUMMARY.md ⭐

Status Legend:
⭐ Complete & Ready
📝 Template Available
📋 Reference Only
```

## State Tree

```
landing: {
  hero: {
    title: string
    titleAr: string
    subtitle: string
    subtitleAr: string
    image: string
    bgColor: string
    textColor: string
    enabled: boolean
  },
  services: {
    enabled: boolean
    items: [
      {
        id: string (unique)
        title: string
        titleAr: string
        description: string
        descriptionAr: string
        image: string
        navigate: string (path)
        enabled: boolean
      }
    ]
  },
  about: {
    title: string
    titleAr: string
    content: string
    contentAr: string
    image: string
    enabled: boolean
  },
  testimonials: {
    title: string
    titleAr: string
    items: []
    featuredIds: [string]
    mode: 'all' | 'selected'
    enabled: boolean
  },
  contact: {
    email: string
    phone: string
    enabled: boolean
  },
  callUs: {
    number: string
    numberAr: string
    label: string
    labelAr: string
    enabled: boolean
  },
  location: {
    address: string
    addressAr: string
    latitude: string
    longitude: string
    enabled: boolean
  },
  hours: {
    [day: string]: {
      open: string (HH:mm)
      close: string (HH:mm)
      enabled: boolean
    }
  },
  footer: {
    text: string
    enabled: boolean
  },
  seo: {
    title: string
    description: string
    enabled: boolean
  },
  instagram: {
    enabled: boolean
    posts: [...]
  }
}

activeSection: string (current active section ID)

unsavedSections: string[] (IDs of sections with unsaved changes)

sectionErrors: {
  [sectionId]: string (error message)
}

saving: boolean (API request in progress)

error: string | null (general error message)

success: string | null (success message)

mobileMenuOpen: boolean (mobile menu state)
```

## Component Props Interface

### HeroSection

```jsx
Props: {
  landing: Object (state)
  setLanding: Function (state setter)
  handleUploadToTarget: Function (file, targetPath) => Promise<url>
  isRTL: Boolean
}
```

### ServicesSection

```jsx
Props: {
  landing: Object
  setLanding: Function
  handleUploadToTarget: Function
  generateUniqueId: Function () => string
  reorderArray: Function (path, fromIdx, toIdx) => void
  isRTL: Boolean
}
```

### SettingsSidebar

```jsx
Props: {
  activeSection: string
  onSectionChange: Function (sectionId) => void
  unsavedSections: string[]
  isMobileOpen: Boolean
  onMobileClose: Function (state?) => void
}
```

## API Integration Points

### 1. useSettings Hook

```jsx
const {
  rawSettings, // Loaded settings
  saveSystemCategory, // Save handler
  loading, // Loading state
  isOnline, // Online status
  uploadLandingImage, // Image upload
  importInstagramPosts, // Instagram import
} = useSettings();
```

### 2. saveSystemCategory API

```jsx
await saveSystemCategory('landing', {
  hero: {...},
  services: {...},
  about: {...},
  // ... all sections
})
```

### 3. uploadLandingImage API

```jsx
const result = await uploadLandingImage(file, {
  target: "landing.hero.image", // e.g.
});
// Returns: { url: string, restaurant: Object }
```

## Responsive Breakpoints

```
Mobile (< 640px)
├─ Full width sidebar hidden
├─ Hamburger menu visible
├─ Single column layout
└─ Touch-optimized buttons

Tablet (640px - 1024px)
├─ Sidebar visible
├─ 2-column input grid
├─ Optimized spacing
└─ Responsive images

Desktop (> 1024px)
├─ Sidebar always visible
├─ 2-column input grid
├─ Optimal spacing
└─ Full featured interface
```

## Dark Mode Implementation

```
Element Styling Pattern:
┌────────────────────────────────────────────┐
│ className="                                │
│   bg-white dark:bg-gray-800                │
│   text-gray-900 dark:text-white            │
│   border-gray-200 dark:border-gray-700     │
│   hover:bg-gray-50 dark:hover:bg-gray-700  │
│ "                                          │
└────────────────────────────────────────────┘

Maintained throughout all components for consistency.
```

## Performance Considerations

```
Current Optimizations:
├─ Section-based state (no full page re-render)
├─ Memoized sidebar navigation
├─ Lazy component imports (recommended)
└─ Efficient event handlers

Future Optimizations:
├─ React.memo for non-changing components
├─ useMemo for expensive calculations
├─ useCallback for stable handler references
├─ Virtual scrolling for long lists
├─ Debounced auto-save
└─ Image lazy loading
```

---

**This architecture ensures:**

- ✅ Modularity and reusability
- ✅ Maintainability and clarity
- ✅ Scalability for future features
- ✅ Performance optimization possibilities
- ✅ Clear data flow and state management
- ✅ Backward compatibility

Last Updated: January 10, 2026
