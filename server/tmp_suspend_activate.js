import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
if (!process.env.JWT_SECRET) dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('Missing JWT_SECRET');
  process.exit(1);
}
const token = jwt.sign({ id: '695ebe81841a3bcea729f0af', name: 'Platform Super Admin', role: 'super_admin', email: 'admin@platform.com' }, secret, { expiresIn: '1d' });
const api = axios.create({ baseURL: 'http://localhost:8000/api/supadmin', headers: { Authorization: `Bearer ${token}` } });

(async () => {
  try {
    console.log('Fetching restaurants...');
    const list = await api.get('/restaurants?page=1&limit=1');
    const first = list.data?.restaurants?.[0];
    if (!first) return console.error('No restaurants found');
    const id = first._id;
    console.log('First restaurant id:', id, 'name:', first.restaurantName || first.name || first.restaurantName);

    console.log('\n-> Calling SUSPEND');
    try {
      const r1 = await api.post(`/restaurants/${id}/suspend`);
      console.log('Suspend response:', r1.data);
    } catch (err) {
      console.error('Suspend error:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
    }

    console.log('\n-> Calling ACTIVATE');
    try {
      const r2 = await api.post(`/restaurants/${id}/activate`);
      console.log('Activate response:', r2.data);
    } catch (err) {
      console.error('Activate error:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
    }

  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();