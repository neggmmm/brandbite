// src/features/settings/components/SettingsLayout.jsx
import { useState } from 'react';
import { settingsSections } from './SettingsNav';

export default function SettingsLayout({ children, activeSection, onSectionChange }) {
  const [activeTab, setActiveTab] = useState(activeSection);

  const handleTabClick = (sectionId) => {
    setActiveTab(sectionId);
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  // Group sections by category like in your image
  const categoryGroups = {
    'System': ['general'],
    'Services': ['services', 'notifications'],
    'Payments': ['payments'],
    'Website': ['website', 'branding'],
    'Integrations': ['integrations', 'advanced']
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your restaurant system and customize features
          </p>
        </div>

        {/* Top Navigation Bar */}
        <div className="px-6">
          <div className="flex space-x-8 overflow-x-auto pb-2 hide-scrollbar">
            {Object.entries(categoryGroups).map(([category, sectionIds]) => {
              // Find the active section in this category
              const activeInCategory = sectionIds.includes(activeTab);
              
              return (
                <div key={category} className="relative group">
                  <button
                    onClick={() => handleTabClick(sectionIds[0])}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-colors ${
                      activeInCategory
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                    {activeInCategory && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                    )}
                  </button>
                  
                  {/* Dropdown for sub-sections */}
                  {sectionIds.length > 1 && (
                    <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      {sectionIds.map((sectionId) => {
                        const section = settingsSections.find(s => s.id === sectionId);
                        if (!section) return null;
                        
                        return (
                          <button
                            key={sectionId}
                            onClick={() => handleTabClick(sectionId)}
                            className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              activeTab === sectionId
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span className="text-lg">{section.icon}</span>
                            <div>
                              <div className="font-medium">{section.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {section.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Settings</span>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {settingsSections.find(s => s.id === activeTab)?.label || 'General'}
            </span>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {children}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Helper function for category icons
function getCategoryIcon(category) {
  switch (category) {
    case 'System': return '';
    case 'Services': return '';
    case 'Payments': return '';
    case 'Website': return '';
    case 'Integrations': return '';
    default: return '📋';
  }
}