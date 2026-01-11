import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('Missing JWT_SECRET');
  process.exit(1);
}

const token = jwt.sign({ id: '695ebe81841a3bcea729f0af', name: 'Platform Super Admin', role: 'super_admin', email: 'admin@platform.com' }, secret, { expiresIn: '1d' });

(async () => {
  try {
    const timestamp = Date.now();
    const payload = {
      name: `API Test Rest ${timestamp}`,
      contactEmail: `apitest${timestamp}@brandbite.test`,
      contactPhone: '+10000000001',
      contactName: 'Node Tester',
      address: '123 Node Ave',
      subscriptionPlan: 'trial',
      slug: `api-test-rest-${timestamp}`,
      settings: { timezone: 'UTC', currency: 'USD', language: 'en' }
    };
    console.log('POST payload:', JSON.stringify(payload, null, 2));

    const res = await axios.post('http://localhost:8000/api/supadmin/restaurants', payload, { headers: { Authorization: `Bearer ${token}` } });
    console.log('SUCCESS - Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('ERROR STATUS', err.response.status, JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('ERROR', err.message);
    }
  }
})();
