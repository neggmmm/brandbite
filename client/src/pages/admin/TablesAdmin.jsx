import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function TablesAdmin() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", capacity: 2, location: "" });

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/tables?restaurantId=");
      setTables(res.data || res.data?.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const create = async () => {
    try {
      await api.post("/api/tables", form);
      setForm({ name: "", capacity: 2, location: "" });
      fetchTables();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Tables</h3>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <input placeholder="Name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className="input" />
        <input type="number" placeholder="Capacity" value={form.capacity} onChange={e => setForm(f=>({...f,capacity: Number(e.target.value)}))} className="input" />
        <input placeholder="Location" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} className="input" />
        <button onClick={create} className="btn btn-primary mt-2">Create</button>
      </div>
      <div>
        {loading ? <div>Loading...</div> : (
          <ul className="space-y-2">
            {tables.map(t => <li key={t._id} className="p-2 border rounded">{t.name} — capacity {t.capacity} — {t.location}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
