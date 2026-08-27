import { useEffect, useState } from 'react';

const API = '/api';

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('eskraft-token'));
  const [user, setUser] = useState(() => { try{ return JSON.parse(localStorage.getItem('eskraft-user'))}catch{return null}});
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // login form (reuse admin credentials)
  const [email, setEmail] = useState('admin@eskraft.in');
  const [password, setPassword] = useState('Admin@123');

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const q = new URLSearchParams({ page, limit: 20, ...(status && { status }), ...(search && { search }) }).toString();
      const res = await fetch(`${API}/admin/orders?${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      // controller returns {orders, total} or array (backwards compat)
      if (Array.isArray(data.data)) { setOrders(data.data); setTotal(data.data.length); }
      else { setOrders(data.data.orders); setTotal(data.data.total); }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchOrders(); }, [token, status, page]);

  const handleLogin = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      if (data.data.user.role !== 'ADMIN' && data.data.user.role !== 'SUPER_ADMIN') throw new Error('Not an admin account');
      localStorage.setItem('eskraft-token', data.data.token);
      localStorage.setItem('eskraft-user', JSON.stringify(data.data.user));
      setToken(data.data.token); setUser(data.data.user);
    } catch(e){ setError(e.message); }
  };

  const updateStatus = async (orderNumber, newStatus) => {
    try {
      const res = await fetch(`${API}/admin/orders/${orderNumber}/status`, { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ status: newStatus }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      fetchOrders();
    } catch(e){ alert(e.message); }
  };

  if (!token || !user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="container section" style={{maxWidth:480}}>
        <h1 className="text-3xl font-black mb-2">ADMIN LOGIN</h1>
        <p className="text-sm text-gray mb-6" style={{textTransform:'none'}}>Sign in with admin credentials to view all orders from the database.</p>
        {error && <div style={{background:'#F8D7DA',color:'#721C24',padding:'0.75rem',borderRadius:8,marginBottom:12}}>{error}</div>}
        <form onSubmit={handleLogin} className="flex flex-col gap-sm">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@eskraft.in" style={{padding:'0.8rem',border:'1px solid #ddd',borderRadius:8}} />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin@123" style={{padding:'0.8rem',border:'1px solid #ddd',borderRadius:8}} />
          <button className="btn">SIGN IN AS ADMIN</button>
        </form>
        <p className="text-xs text-gray mt-4" style={{textTransform:'none'}}>Seeded admin: <b>admin@eskraft.in / Admin@123</b></p>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">ORDERS — DATABASE VIEW</h1>
        <button className="btn btn-outline" onClick={()=>{localStorage.removeItem('eskraft-token');localStorage.removeItem('eskraft-user');setToken(null);setUser(null);}}>Sign out</button>
      </div>

      <div className="flex gap-sm mb-4" style={{flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchOrders()} placeholder="Search order # or customer" style={{padding:'0.6rem',border:'1px solid #ddd',borderRadius:8, flex:1, minWidth:200}} />
        <select value={status} onChange={e=>setStatus(e.target.value)} style={{padding:'0.6rem',border:'1px solid #ddd',borderRadius:8}}>
          <option value="">All statuses</option>
          <option>PENDING_PAYMENT</option><option>PAID</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
        </select>
        <button className="btn" onClick={()=>{setPage(1);fetchOrders();}}>Search</button>
      </div>

      {loading ? <p>Loading...</p> : error ? <p style={{color:'crimson'}}>{error}</p> : orders.length===0 ? <p>No orders yet. Place an order from Cart (with customer@test.com) then refresh.</p> : (
        <>
        <p className="text-sm text-gray mb-2">{total} order(s) — page {page}</p>
        <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.9rem'}}>
          <thead><tr style={{textAlign:'left',borderBottom:'2px solid #111'}}>
            <th style={{padding:8}}>Order #</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
          {orders.map(o=>(
            <tr key={o.id} style={{borderBottom:'1px solid #eee'}}>
              <td style={{padding:8,fontWeight:700}}>{o.orderNumber}</td>
              <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              <td>{o.customer?.name}<br/><span className="text-xs text-gray">{o.customer?.email} {o.customer?.phone}</span></td>
              <td>{o.items?.map(i=>`${i.product?.name||i.productId} ×${i.quantity} (₹${i.unitPrice})`).join(', ')}</td>
              <td>₹{o.total} <span className="text-xs"> (ship ₹{o.shippingFee})</span></td>
              <td><span style={{padding:'2px 8px',borderRadius:12,background:'#eee',fontSize:'0.75rem'}}>{o.status}</span></td>
              <td>
                <select defaultValue={o.status} onChange={e=>updateStatus(o.orderNumber, e.target.value)} style={{padding:4,border:'1px solid #ddd',borderRadius:6}}>
                  <option>PENDING_PAYMENT</option><option>PAID</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
                </select>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        </div>
        <div className="flex gap-sm mt-4">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="btn btn-outline">Prev</button>
          <button onClick={()=>setPage(p=>p+1)} className="btn btn-outline">Next</button>
        </div>
        </>
      )}

      <div style={{marginTop:32,padding:16,background:'#F5F3ED',borderRadius:12}}>
        <h3 className="font-bold mb-2">Other easy ways to see orders:</h3>
        <ol style={{fontSize:'0.85rem',display:'flex',flexDirection:'column',gap:6, textTransform:'none'}}>
          <li><b>1. This page</b> → <code>/admin</code> (log in as admin) — easiest for client, includes customer name/phone/email, items, qty, price, subtotal/total, status, date.</li>
          <li><b>2. API directly:</b> <code>GET /api/admin/orders</code> with <code>Authorization: Bearer &lt;admin token&gt;</code> — returns JSON.</li>
          <li><b>3. Prisma Studio:</b> <code>cd backend &amp;&amp; npx prisma studio</code> → opens <code>http://localhost:5555</code> GUI for all tables.</li>
          <li><b>4. Neon Dashboard:</b> SQL Editor at your Neon project → <code>SELECT * FROM "Order" ORDER BY "createdAt" DESC;</code></li>
        </ol>
      </div>
    </div>
  );
}
