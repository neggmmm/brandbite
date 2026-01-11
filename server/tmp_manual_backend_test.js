import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
if (!process.env.JWT_SECRET) dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const secret = process.env.JWT_SECRET;
const token = jwt.sign({ id: '695ebe81841a3bcea729f0af', role: 'super_admin', email: 'admin@platform.com' }, secret, { expiresIn: '1d' });

const api = axios.create({ 
  baseURL: 'http://localhost:8000/api/supadmin',
  headers: { Authorization: `Bearer ${token}` },
  timeout: 5000
});

console.log('\n=== BACKEND API TESTING ===\n');

(async () => {
  try {
    // TEST 1: GET /dashboard
    console.log('TEST 1: GET /api/supadmin/dashboard');
    try {
      const res = await api.get('/dashboard');
      console.log('✅ STATUS 200 - Success');
      console.log(`   Response: totalRestaurants=${res.data.totalRestaurants}, activeRestaurants=${res.data.activeRestaurants}`);
    } catch (err) {
      console.log(`❌ ERROR: ${err.code || err.message}`);
      if (err.response) {
        console.log(`   STATUS ${err.response.status} - ${err.response.data?.message || ''}`);
      } else {
        console.log(`   ${err.message}`);
      }
    }

    // TEST 2: GET /restaurants
    console.log('\nTEST 2: GET /api/supadmin/restaurants');
    try {
      const res = await api.get('/restaurants?page=1&limit=5');
      console.log('✅ STATUS 200 - Success');
      console.log(`   Found ${res.data.total} restaurant(s)`);
      if (res.data.restaurants?.length > 0) {
        console.log(`   First: ${res.data.restaurants[0].restaurantName || res.data.restaurants[0].name}`);
      }
    } catch (err) {
      console.log(`❌ STATUS ${err.response?.status} - ${err.response?.data?.message || err.message}`);
    }

    // TEST 3: POST /restaurants
    console.log('\nTEST 3: POST /api/supadmin/restaurants');
    try {
      const timestamp = Date.now();
      const res = await api.post('/restaurants', {
        name: `Manual Test ${timestamp}`,
        contactEmail: `manual${timestamp}@test.local`,
        contactPhone: '+1234567890',
        contactName: 'Test User',
        address: '123 Test St',
        subscriptionPlan: 'trial',
        slug: `manual-test-${timestamp}`,
        settings: { timezone: 'UTC', currency: 'USD', language: 'en' }
      });
      console.log('✅ STATUS 201 - Success');
      console.log(`   restaurantId: ${res.data.restaurantId}`);
      console.log(`   invitationToken: ${res.data.invitationToken}`);
    } catch (err) {
      console.log(`❌ STATUS ${err.response?.status} - ${err.response?.data?.message || err.message}`);
    }

    console.log('\n=== SUMMARY ===');
    console.log('All endpoints tested. Review results above.');
    console.log('✅ = Working | ❌ = Failed\n');

  } catch (err) {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
  }
})();
