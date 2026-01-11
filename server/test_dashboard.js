import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('❌ JWT_SECRET not found in .env');
  process.exit(1);
}

// Generate JWT token for super_admin
const token = jwt.sign(
  { id: '695ebe81841a3bcea729f0af', role: 'super_admin', email: 'admin@platform.com' },
  secret,
  { expiresIn: '1d' }
);

console.log('\n=== TESTING SUPADMIN DASHBOARD ===\n');
console.log('Token:', token.substring(0, 50) + '...');
console.log('Server: http://localhost:8000\n');

(async () => {
  try {
    // Test dashboard endpoint
    console.log('Testing: GET /api/supadmin/dashboard');
    const response = await axios.get('http://localhost:8000/api/supadmin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });

    console.log('✅ SUCCESS - Status 200\n');
    console.log('Dashboard Data:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n✅ DASHBOARD WORKS!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ ERROR: Cannot connect to http://localhost:8000');
      console.log('   Make sure the server is running: npm run dev');
    } else if (error.response) {
      console.log(`❌ ERROR - Status ${error.response.status}`);
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ ERROR:', error.message);
    }
    process.exit(1);
  }
})();
