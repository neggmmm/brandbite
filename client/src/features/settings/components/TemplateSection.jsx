/**
 * TEMPLATE: Section Component
 * 
 * This is a template for creating new landing settings sections.
 * Copy this file and customize for your section.
 * 
 * Usage:
 * 1. Copy this file: cp TemplateSection.jsx YourSection.jsx
 * 2. Replace "Template" with your section name
 * 3. Customize the UI and fields
 * 4. Import in LandingSettingsRefactored.jsx
 * 5. Add case in renderSectionContent()
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function TemplateSection({ 
  landing, 
  setLanding, 
  handleUploadToTarget, 
  isRTL 
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Header with title and enabled toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Section Title
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Description of what this section does
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
          <input 
            type="checkbox" 
            checked={landing.template?.enabled !== false} 
            onChange={(e) => setLanding(l => ({
              ...l, 
              template: {
                ...l.template, 
                enabled: e.target.checked
              }
            }))} 
            className="w-4 h-4"
          />
          <span className="text-gray-700 dark:text-gray-300">Enabled</span>
        </label>
      </div>

      {/* Main content area */}
      <div className="space-y-4">
        {/* English fields section */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title (English)
            </label>
            <input
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter title"
              value={landing.template?.title || ''}
              onChange={(e) => setLanding(l => ({ 
                ...l, 
                template: { 
                  ...l.template, 
                  title: e.target.value 
                } 
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content (English)
            </label>
            <textarea
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter content"
              rows="4"
              value={landing.template?.content || ''}
              onChange={(e) => setLanding(l => ({ 
                ...l, 
                template: { 
                  ...l.template, 
                  content: e.target.value 
                } 
              }))}
            />
          </div>
        </div>

        {/* Arabic fields section */}
        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              العنوان (عربي)
            </label>
            <input
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل العنوان"
              value={landing.template?.titleAr || ''}
              onChange={(e) => setLanding(l => ({ 
                ...l, 
                template: { 
                  ...l.template, 
                  titleAr: e.target.value 
                } 
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المحتوى (عربي)
            </label>
            <textarea
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل المحتوى"
              rows="4"
              value={landing.template?.contentAr || ''}
              onChange={(e) => setLanding(l => ({ 
                ...l, 
                template: { 
                  ...l.template, 
                  contentAr: e.target.value 
                } 
              }))}
            />
          </div>
        </div>

        {/* Image upload section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*" 
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await handleUploadToTarget(f, 'landing.template.image');
                }} 
                className="text-sm w-full"
              />
            </div>
            {landing.template?.image && (
              <img src={landing.template.image} alt="template" className="h-16 object-contain rounded border border-gray-300 dark:border-gray-600" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * STYLING NOTES:
 * 
 * Common Classes Used:
 * - Container: bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
 * - Input: p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600
 * - Label: text-sm font-medium text-gray-700 dark:text-gray-300
 * - Button: px-4 py-2 rounded-lg font-medium transition-colors
 * - Mobile responsive: grid-cols-1 sm:grid-cols-2 gap-3
 * 
 * Remember:
 * - Always include 'dark:' variants for dark mode
 * - Use 'sm:' breakpoint for responsive design
 * - Focus states: focus:ring-2 focus:ring-blue-500 focus:border-transparent
 * - Add descriptions in gray color for better UX
 */

/**
 * STATE STRUCTURE NOTES:
 * 
 * Add to initial state in LandingSettingsRefactored:
 * template: { 
 *   title: '', 
 *   titleAr: '', 
 *   content: '', 
 *   contentAr: '', 
 *   image: '', 
 *   enabled: true 
 * }
 * 
 * Also add to reset button and deepMerge function!
 */

/**
 * INTEGRATION CHECKLIST:
 * 
 * [] Create component file from this template
 * [] Update initial state in LandingSettingsRefactored
 * [] Import component in LandingSettingsRefactored
 * [] Add case to renderSectionContent() switch
 * [] Add section to SECTIONS array in SettingsSidebar
 * [] Test section inputs
 * [] Test image upload
 * [] Test dark mode
 * [] Test RTL (Arabic)
 * [] Test save functionality
 */
