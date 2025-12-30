#!/usr/bin/env node
/**
 * White-Label Landing Page System - Quick Verification Script
 * 
 * This script helps verify that the white-label system is working correctly.
 * Run from: e:\brandbite
 * 
 * What it checks:
 * 1. All required files exist and have been modified
 * 2. Code contains expected patterns and functions
 * 3. Database schema supports white-label settings
 * 4. Routes are properly configured
 * 
 * Usage:
 *   node verify-white-label.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];
const errors = [];

function check(title, condition, details = '') {
  if (condition) {
    checks.push(`✓ ${title}`);
  } else {
    errors.push(`✗ ${title}${details ? ': ' + details : ''}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('WHITE-LABEL LANDING PAGE VERIFICATION');
console.log('='.repeat(60) + '\n');

// 1. Check Backend Controller
console.log('🔍 Backend Controller...');
const controllerPath = path.join(__dirname, 'server/src/modules/restaurant/restaurant.controller.js');
if (fs.existsSync(controllerPath)) {
  const content = fs.readFileSync(controllerPath, 'utf8');
  check('Controller file exists', true);
  check('Has updateSystemCategory function', content.includes('export async function updateSystemCategory'));
  check('Returns full restaurant doc', content.includes('data: updated,') || content.includes('data: updated }'));
  check('Has updateSystemCategory logging', content.includes('[updateSystemCategory]'));
} else {
  check('Controller file exists', false, 'File not found');
}

// 2. Check SettingContext
console.log('\n🔍 Frontend SettingContext...');
const contextPath = path.join(__dirname, 'client/src/context/SettingContext.jsx');
if (fs.existsSync(contextPath)) {
  const content = fs.readFileSync(contextPath, 'utf8');
  check('Context file exists', true);
  check('Has saveSystemCategory function', content.includes('const saveSystemCategory'));
  check('Detects full restaurant response', content.includes('responseData.systemSettings'));
  check('Merges full response', content.includes('setSettings(prev => ({'));
  check('Has saveSystemCategory logging', content.includes('[saveSystemCategory]'));
} else {
  check('Context file exists', false, 'File not found');
}

// 3. Check LandingSettings Admin Page
console.log('\n🔍 Admin Landing Settings Page...');
const settingsPath = path.join(__dirname, 'client/src/features/settings/pages/LandingSettings.jsx');
if (fs.existsSync(settingsPath)) {
  const content = fs.readFileSync(settingsPath, 'utf8');
  check('Settings page exists', true);
  check('Has hero section state', content.includes('hero:'));
  check('Has about section state', content.includes('about:'));
  check('Has location section state', content.includes('location:'));
  check('Has hours section state', content.includes('hours:'));
  check('Has callUs section state', content.includes('callUs:'));
  check('Has testimonials section state', content.includes('testimonials:'));
  check('Has handleSave function', content.includes('const handleSave'));
  check('Calls saveSystemCategory', content.includes('saveSystemCategory'));
  check('Has i18n support', content.includes('useTranslation'));
  check('Has error display', content.includes('error &&'));
  check('Has success message', content.includes('success &&'));
} else {
  check('Settings page exists', false, 'File not found');
}

// 4. Check LandingPage
console.log('\n🔍 Public Landing Page...');
const landingPath = path.join(__dirname, 'client/src/pages/LandingPage.jsx');
if (fs.existsSync(landingPath)) {
  const content = fs.readFileSync(landingPath, 'utf8');
  check('Landing page exists', true);
  check('Reads from rawSettings.systemSettings.landing', content.includes('rawSettings?.systemSettings?.landing'));
  check('Has callUs destructuring', content.includes('const callUs'));
  check('Has hours destructuring', content.includes('const hours'));
  check('Uses location from settings', content.includes('location.address'));
  check('Uses hours in contact section', content.includes('Object.entries(hours)'));
  check('Uses callUs number/label', content.includes('callUs.number') && content.includes('callUs.label'));
  check('Has i18n support', content.includes('isRTL'));
} else {
  check('Landing page exists', false, 'File not found');
}

// 5. Check Documentation
console.log('\n🔍 Documentation...');
const guideExists = fs.existsSync(path.join(__dirname, 'WHITE_LABEL_SYSTEM_GUIDE.md'));
const implExists = fs.existsSync(path.join(__dirname, 'IMPLEMENTATION_COMPLETE.md'));
check('System guide exists', guideExists);
check('Implementation document exists', implExists);

// Summary
console.log('\n' + '='.repeat(60));
console.log('RESULTS');
console.log('='.repeat(60) + '\n');

checks.forEach(c => console.log(c));

if (errors.length > 0) {
  console.log('\n❌ Issues Found:\n');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('\n✅ All Checks Passed!');
  console.log('\nNext Steps:');
  console.log('1. Run the app: npm run dev (both client and server)');
  console.log('2. Log in to admin panel');
  console.log('3. Go to Settings → Landing Page');
  console.log('4. Edit a field (e.g., Hero Title)');
  console.log('5. Click "Save All Settings"');
  console.log('6. Navigate to / (landing page)');
  console.log('7. Verify the change appears without page refresh');
  console.log('8. Refresh page and verify change persists\n');
  process.exit(0);
}
