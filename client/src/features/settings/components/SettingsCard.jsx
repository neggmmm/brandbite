// src/features/settings/components/SettingsCard.jsx
export default function SettingsCard({ 
  title, 
  description, 
  icon, 
  children,
  hasError = false,
  isRequired = false
}) {
  return (
    <div className={`rounded-lg border transition-all duration-200 ${
      hasError 
        ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10 hover:border-red-400 dark:hover:border-red-600' 
        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`p-2 rounded-lg ${
                hasError 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              }`}>
                <span className="text-lg">{icon}</span>
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {title}
                </h3>
                {isRequired && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                    Required
                  </span>
                )}
              </div>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}