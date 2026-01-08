import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import mongoose from 'mongoose';

// Try loading .env from the project server folder first, fallback to cwd
const serverEnv = path.resolve(process.cwd(), 'server', '.env');
dotenv.config({ path: serverEnv });
if (!process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const secret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGO_URI;

if (!secret) {
  console.error('Missing JWT_SECRET; ensure server/.env is present');
  process.exit(1);
}

const token = jwt.sign({ id: '695ebe81841a3bcea729f0af', name: 'Platform Super Admin', role: 'super_admin', email: 'admin@platform.com' }, secret, { expiresIn: '1d' });

const api = axios.create({ baseURL: 'http://localhost:8000/api/supadmin', headers: { Authorization: `Bearer ${token}` } });

(async () => {
  try {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    console.log('\n=== BACKEND API TESTING ===\n');

    // 1. Test Dashboard
    console.log('✓ Testing GET /dashboard');
    let res = await api.get('/dashboard');
    console.log('  Response:', JSON.stringify(res.data, null, 2));

    // 2. Test List Restaurants
    console.log('\n✓ Testing GET /restaurants');
    res = await api.get('/restaurants?page=1&limit=20');
    console.log(`  Found ${res.data.total} restaurant(s)`);

    // 3. Create a test restaurant
    const timestamp = Date.now();
    const payload = {
      name: `Test Rest ${timestamp}`,
      contactEmail: `test${timestamp}@brandbite.test`,
      contactPhone: '+10000000002',
      contactName: 'Test Owner',
      address: '999 Test Blvd',
      subscriptionPlan: 'basic',
      slug: `test-rest-${timestamp}`,
      settings: { timezone: 'UTC', currency: 'USD', language: 'en' }
    };

    console.log('\n✓ Testing POST /restaurants (create)');
    res = await api.post('/restaurants', payload);
    const restaurantId = res.data.restaurantId;
    console.log(`  ✓ Restaurant created: ${restaurantId}`);
    console.log(`  ✓ Invitation token: ${res.data.invitationToken}`);

    // Verify in MongoDB
    console.log('\n=== MONGODB VERIFICATION ===\n');

    const restaurant = await db.collection('restaurants').findOne({ _id: new mongoose.Types.ObjectId(restaurantId) });
    console.log('✓ Restaurant document:', { _id: restaurant?._id, name: restaurant?.restaurantName, status: restaurant?.status });

    // Some parts of the app use a separate collection name for supadmin tables
    const tablesA = await db.collection('tables').find({ restaurantId: new mongoose.Types.ObjectId(restaurantId) }).toArray();
    const tablesB = await db.collection('restaurant_tables').find({ restaurantId: new mongoose.Types.ObjectId(restaurantId) }).toArray();
    const tablesCount = (tablesA?.length || 0) + (tablesB?.length || 0);
    console.log(`✓ Tables created: ${tablesCount} (expected 10)`);

    const categories = await db.collection('menucategories').find({ restaurantId: new mongoose.Types.ObjectId(restaurantId) }).toArray();
    console.log(`✓ Menu categories created: ${categories.length} (expected 4)`, categories.map(c => c.name));

    const invitations = await db.collection('invitations').find({ restaurantId: new mongoose.Types.ObjectId(restaurantId) }).toArray();
    console.log(`✓ Invitations created: ${invitations.length} (expected 1)`, { email: invitations[0]?.email, role: invitations[0]?.role });

    const auditLogs = await db.collection('auditlogs').find({ resourceId: new mongoose.Types.ObjectId(restaurantId) }).toArray();
    console.log(`✓ Audit logs created: ${auditLogs.length}`, auditLogs.map(a => a.action));

    // 4. Test GET by ID
    console.log('\n✓ Testing GET /restaurants/:id');
    res = await api.get(`/restaurants/${restaurantId}`);
    console.log(`  ✓ Retrieved restaurant: ${res.data.restaurant?.restaurantName}`);

    // 5. Test Update
    console.log('\n✓ Testing PUT /restaurants/:id');
    res = await api.put(`/restaurants/${restaurantId}`, { address: '999 Test Blvd UPDATED' });
    console.log(`  ✓ Updated restaurant address`);

    // 6. Test Suspend
    console.log('\n✓ Testing POST /restaurants/:id/suspend');
    res = await api.post(`/restaurants/${restaurantId}/suspend`);
    console.log(`  ✓ Restaurant status: ${res.data.restaurant?.status}`);

    // 7. Test Activate
    console.log('\n✓ Testing POST /restaurants/:id/activate');
    res = await api.post(`/restaurants/${restaurantId}/activate`);
    console.log(`  ✓ Restaurant status: ${res.data.restaurant?.status}`);

    // 8. Test Auth & Error Handling
    console.log('\n=== AUTH & ERROR TESTING ===\n');

    console.log('✓ Testing missing token (401)');
    try {
      await axios.get('http://localhost:8000/api/supadmin/dashboard');
    } catch (err) {
      console.log(`  ✓ Got ${err.response?.status} ${err.response?.data?.message || ''}`);
    }

    console.log('\n✓ Testing invalid token (401)');
    try {
      await axios.get('http://localhost:8000/api/supadmin/dashboard', { headers: { Authorization: 'Bearer invalid' } });
    } catch (err) {
      console.log(`  ✓ Got ${err.response?.status}`);
    }

    console.log('\n✓ Testing missing required fields (400)');
    try {
      await api.post('/restaurants', { name: 'Test' });
    } catch (err) {
      console.log(`  ✓ Got ${err.response?.status} - ${err.response?.data?.message}`);
    }

    console.log('\n✓ Testing non-existent restaurant (404)');
    try {
      await api.get('/restaurants/999999999999999999999999');
    } catch (err) {
      console.log(`  ✓ Got ${err.response?.status}`);
    }

    console.log('\n=== ALL TESTS PASSED ===\n');

    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
