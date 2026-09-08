import { useEffect, useState } from 'react';
import { API } from '../utils/api';

// Single consistent API structure — matches server.js:
// app.use('/api/orders', orderRoutes) where orderRoutes has /admin/all, /admin/:id/status, /admin/:id
const ADMIN_ALL = `${API}/orders/admin/all`;
const adminStatusUrl = (orderNumber) => `${API}/orders/admin/${orderNumber}/status`;
const adminDeleteUrl = (orderNumber) => `${API}/orders/admin/${orderNumber}`;

const STATUS_COLOR={PENDING_PAYMENT:{bg:'#FFF3CD',c:'#856404'},PAID:{bg:'#D4EDDA',c:'#155724'},PROCESSING:{bg:'#CCE5FF',c:'#004085'},SHIPPED:{bg:'#D1ECF1',c:'#0C5460'},DELIVERED:{bg:'#D4EDDA',c:'#155724'},CANCELLED:{bg:'#F8D7DA',c:'#721C24'},FAILED:{bg:'#F8D7DA',c:'#721C24'},REFUNDED:{bg:'#E2E3E5',c:'#383D41'}};
const PAY_COLOR={PENDING:{bg:'#FFF3CD',c:'#856404'},SUCCESS:{bg:'#D4EDDA',c:'#155724'},FAILED:{bg:'#F8D7DA',c:'#721C24'},REFUNDED:{bg:'#E2E3E5',c:'#383D41'}};
const CUSTOM_STATUS_COLOR={pending:{bg:'#FFF3CD',c:'#856404'},reviewing:{bg:'#CCE5FF',c:'#004085'},approved:{bg:'#D4EDDA',c:'#155724'},shipped:{bg:'#D1ECF1',c:'#0C5460'},rejected:{bg:'#F8D7DA',c:'#721C24'}};
const PAGE_LIMIT = 20;

const ADMIN_TOKEN_KEY = 'eskraft-admin-token';
const ADMIN_USER_KEY = 'eskraft-admin-user';

export default function Admin(){
  const [tab,setTab]=useState('orders'); // orders | custom
  // Admin session is stored separately from the customer session
  // (eskraft-token / eskraft-user) so the two auth flows never mix.
  const [token,setToken]=useState(()=>localStorage.getItem(ADMIN_TOKEN_KEY));
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem(ADMIN_USER_KEY))}catch{return null}});
  const [orders,setOrders]=useState([]);const [total,setTotal]=useState(0);const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('');const [status,setStatus]=useState('');const [search,setSearch]=useState('');const [page,setPage]=useState(1);const [newOnly,setNewOnly]=useState(false);const [newCount,setNewCount]=useState(0);const [selected,setSelected]=useState(null);
  const [customOrders,setCustomOrders]=useState(()=>{try{return JSON.parse(localStorage.getItem('eskraft-custom-orders')||'[]')}catch{return []}});
  const [customFilter,setCustomFilter]=useState('');
  const updateCustomStatus=(id,s)=>{const n=customOrders.map(c=>c.id===id?{...c,status:s}:c);setCustomOrders(n);localStorage.setItem('eskraft-custom-orders',JSON.stringify(n))};
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');
  const [deletingId,setDeletingId]=useState(null);
  const [viewImg,setViewImg]=useState(null); // lightbox for custom-order reference image
  const deleteCustomOrder=(id)=>{ if(!confirm('Delete this custom request?')) return; const n=customOrders.filter(c=>c.id!==id); setCustomOrders(n); localStorage.setItem('eskraft-custom-orders',JSON.stringify(n)); };

  const parseJson = async (res) => {
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { throw new Error(text || `Server returned ${res.status} — backend not reachable`); }
    return data;
  };

  const fetchOrders=async(pageOverride)=>{
    if(!token) return;setLoading(true);setError('');
    try{
      const effective=newOnly?'PENDING_PAYMENT':status;
      const activePage = pageOverride ?? page;
      const q=new URLSearchParams({page:activePage,limit:PAGE_LIMIT,...(effective&&{status:effective}),...(search&&{search})}).toString();
      const res=await fetch(`${ADMIN_ALL}?${q}`,{headers:{Authorization:`Bearer ${token}`}});
      const data=await parseJson(res);
      if(!res.ok || !data.success) throw new Error(data.error?.message || `Request failed (${res.status})`);
      // Backend returns { orders, total, page, limit } — real DB rows, never fake
      if(Array.isArray(data.data)){setOrders(data.data);setTotal(data.data.length)} else {setOrders(data.data.orders ?? []);setTotal(data.data.total ?? 0)}
    }catch(e){setError(e.message)} finally{setLoading(false)}
  };

  const fetchNewCount = async ()=>{
    if(!token) return;
    try{
      const r=await fetch(`${ADMIN_ALL}?status=PENDING_PAYMENT&limit=1`,{headers:{Authorization:`Bearer ${token}`}});
      const d=await parseJson(r);
      if(r.ok && d.success) setNewCount(d.data.total ?? 0);
    }catch{/* keep old count, do not blank the UI */}
  };

  useEffect(()=>{fetchOrders()},[token,status,page,newOnly]);
  useEffect(()=>{
    if(!token) return;
    fetchNewCount();
    const id=setInterval(()=>{fetchNewCount();if(newOnly) fetchOrders()},15000);return()=>clearInterval(id);
  },[token,newOnly]);

  const handleSearch = ()=>{ setPage(1); fetchOrders(1); };

  const handleAdminLogout=()=>{localStorage.removeItem(ADMIN_TOKEN_KEY);localStorage.removeItem(ADMIN_USER_KEY);setToken(null);setUser(null)};

  const handleLogin=async e=>{
    e.preventDefault();setError('');setSuccess('');
    try{
      const r=await fetch(`${API}/auth/admin/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const d=await parseJson(r);
      if(!r.ok || !d.success) throw new Error(d.error?.message || `Login failed (${r.status})`);
      if(d.data.user.role!=='ADMIN'&&d.data.user.role!=='SUPER_ADMIN') throw new Error('Not an admin account');
      localStorage.setItem(ADMIN_TOKEN_KEY,d.data.token);localStorage.setItem(ADMIN_USER_KEY,JSON.stringify(d.data.user));setToken(d.data.token);setUser(d.data.user)
    }catch(e){setError(e.message)}
  };

  const updateStatus=async(orderNumber,newStatus)=>{
    setError('');setSuccess('');
    try{
      const r=await fetch(adminStatusUrl(orderNumber),{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({status:newStatus})});
      const d=await parseJson(r);
      if(!r.ok || !d.success) throw new Error(d.error?.message || `Failed (${r.status})`);
      if(selected&&selected.orderNumber===orderNumber) setSelected({...selected,status:newStatus});
      setSuccess(`Order ${orderNumber} moved to ${newStatus}.`);
      fetchOrders();
    }catch(e){setError(e.message)}
  };

  // Real DB delete — no localStorage. Backend deletes order + payments + items in a transaction and restores stock.
  const deleteOrder=async(orderNumber)=>{
    if(!confirm(`Delete order ${orderNumber}?\n\nThis will permanently delete the order, its payments & items from the database and restore stock.\nThis cannot be undone.`)) return;
    setDeletingId(orderNumber);setError('');setSuccess('');
    try{
      const r=await fetch(adminDeleteUrl(orderNumber),{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});
      const d=await parseJson(r);
      if(!r.ok || !d.success) throw new Error(d.error?.message || `Delete failed (${r.status})`);
      setOrders(prev=>prev.filter(o=>o.orderNumber!==orderNumber && o.id!==orderNumber));
      setTotal(t=>Math.max(0,t-1));
      if(selected && (selected.orderNumber===orderNumber || selected.id===orderNumber)) setSelected(null);
      setSuccess(`Order ${orderNumber} deleted from database.`);
      fetchNewCount();
      // Reload current page so pagination/total stay truthful (e.g. last item on page deleted)
      fetchOrders();
    }catch(e){setError(e.message)} finally{ setDeletingId(null) }
  };

  if(!token||!user||(user.role!=='ADMIN'&&user.role!=='SUPER_ADMIN')){
    return <div className="container section" style={{maxWidth:440}}><h1 className="text-3xl font-black mb-2">ADMIN LOGIN</h1><p className="text-sm text-gray mb-6" style={{textTransform:'none'}}>Sign in to view all orders. Separate admin link: <code>/admin</code></p>{error&&<div style={{background:'#F8D7DA',color:'#721C24',padding:'0.75rem',borderRadius:8,marginBottom:12,fontSize:'0.85rem'}}>{error}</div>}<form onSubmit={handleLogin} className="flex flex-col gap-sm"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{padding:'0.9rem',border:'1px solid #ddd',borderRadius:10}}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{padding:'0.9rem',border:'1px solid #ddd',borderRadius:10}}/><button className="btn" style={{padding:'1rem'}}>SIGN IN AS ADMIN</button></form></div>
  }
  return (
    <div style={{background:'#0F1115',minHeight:'100vh',fontFamily:'system-ui, sans-serif'}}>
      {/* Admin-only header - dark, industrial - clearly not customer shop */}
      <header style={{background:'#1A1D24',borderBottom:'1px solid #2A2E39',padding:'0.9rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}><span style={{background:'#FF3B30',color:'#fff',padding:'4px 10px',borderRadius:6,fontSize:'0.65rem',fontWeight:900,letterSpacing:'0.1em'}}>ADMIN</span><span style={{color:'#fff',fontWeight:900,letterSpacing:'0.06em',fontSize:'1rem'}}>ESKRAFT — BACK OFFICE</span><span style={{color:'#6B7280',fontSize:'0.75rem',marginLeft:8,borderLeft:'1px solid #2A2E39',paddingLeft:12}}>{user.email}</span></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}><a href="/" style={{color:'#9CA3AF',fontSize:'0.8rem',textDecoration:'none',border:'1px solid #2A2E39',padding:'6px 12px',borderRadius:999}}>← View Store</a><button onClick={()=>{handleAdminLogout()}} style={{background:'#2A2E39',color:'#fff',border:'none',padding:'6px 14px',borderRadius:999,fontSize:'0.8rem',cursor:'pointer'}}>Sign out</button></div>
      </header>
    <div className="container" style={{padding:'1.5rem 1rem',maxWidth:1200,margin:'0 auto'}}>
      {/* Tabs - distinct from orders cards */}
      <div style={{display:'flex',gap:8,marginBottom:'1.5rem',borderBottom:'2px solid #eee',paddingBottom:12}}>
        <button onClick={()=>setTab('orders')} style={{padding:'0.6rem 1.4rem',borderRadius:999,fontWeight:800,fontSize:'0.85rem',letterSpacing:'0.05em',border:'2px solid #111',background:tab==='orders'?'#111':'#fff',color:tab==='orders'?'#fff':'#111'}}>ORDERS</button>
        <button onClick={()=>setTab('custom')} style={{padding:'0.6rem 1.4rem',borderRadius:999,fontWeight:800,fontSize:'0.85rem',letterSpacing:'0.05em',border:'2px solid #6B4F3A',background:tab==='custom'?'#6B4F3A':'#fff',color:tab==='custom'?'#fff':'#6B4F3A'}}>CUSTOM ORDERS {customOrders.length>0&&`(${customOrders.length})`}</button>
      </div>
      {tab==='orders'&&<>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem',marginBottom:'1.5rem'}}>
        <div><h2 style={{fontFamily:'var(--font-heading)',fontWeight:900,fontSize:'1.4rem',letterSpacing:'0.04em'}}>ORDERS</h2><p style={{color:'#888',fontSize:'0.85rem'}}>{total} total · page {page} · <span style={{color:'crimson',fontWeight:700}}>{newCount} new</span></p></div>
        <div style={{display:'flex',gap:8}}><button onClick={()=>fetchOrders()} style={{background:'#fff',color:'#111',border:'1px solid #111',padding:'0.6rem 1.2rem',borderRadius:8,fontWeight:700}}>↻ Refresh</button><button onClick={()=>{handleAdminLogout()}} style={{background:'#fff',color:'#111',border:'1px solid #111',padding:'0.6rem 1.2rem',borderRadius:8,fontWeight:700}}>Sign out</button></div>
      </div>
      {success&&<div style={{background:'#D4EDDA',color:'#155724',padding:'0.75rem 1rem',borderRadius:8,marginBottom:12,fontSize:'0.85rem',fontWeight:700}}>{success}</div>}
      {error&&<div style={{background:'#F8D7DA',color:'#721C24',padding:'0.75rem 1rem',borderRadius:8,marginBottom:12,fontSize:'0.85rem',fontWeight:700}}>Error: {error}</div>}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:16}}>
        <button onClick={()=>{setNewOnly(!newOnly);setStatus('');setPage(1)}} className="btn" style={{background:newOnly?'#111':'#fff',color:newOnly?'#fff':'#111',border:'1px solid #111',borderRadius:999}}>New {newCount>0&&<span style={{background:'crimson',color:'#fff',borderRadius:999,padding:'2px 8px',fontSize:'0.7rem',marginLeft:6}}>{newCount}</span>}</button>
        <select value={status} onChange={e=>{setStatus(e.target.value);setNewOnly(false);setPage(1)}} style={{padding:'0.6rem 0.9rem',border:'1px solid #ddd',borderRadius:999,background:'#fff'}} disabled={newOnly}><option value="">All statuses</option><option>PENDING_PAYMENT</option><option>PAID</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select>
        <div style={{display:'flex',flex:1,minWidth:220,border:'1px solid #ddd',borderRadius:999,overflow:'hidden',background:'#fff'}}><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Search order # / customer" style={{flex:1,padding:'0.6rem 1rem',border:'none',outline:'none'}}/><button className="btn" onClick={handleSearch} style={{borderRadius:0}}>Search</button></div>
      </div>
      {loading?<p>Loading…</p>:error&&orders.length===0?<p style={{color:'crimson'}}>Could not load orders: {error}</p>:orders.length===0?<div style={{background:'#fff',border:'1px solid #eee',borderRadius:16,padding:'3rem',textAlign:'center',color:'#888'}}>No orders found in the database.</div>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
          {orders.map(o=>{
            const sc=STATUS_COLOR[o.status]||{bg:'#eee',c:'#333'};
            const pc=PAY_COLOR[o.paymentStatus]||{bg:'#eee',c:'#333'};
            return <div key={o.id} onClick={()=>setSelected(o)} style={{background:'#fff',border:'1px solid #eee',borderRadius:16,padding:'1.1rem',cursor:'pointer',borderLeft:o.status==='PENDING_PAYMENT'?'4px solid crimson':'1px solid #eee',boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,gap:8}}><span style={{fontWeight:800,fontSize:'0.9rem'}}>{o.orderNumber}</span><span style={{background:sc.bg,color:sc.c,padding:'3px 10px',borderRadius:999,fontSize:'0.65rem',fontWeight:800,letterSpacing:'0.05em'}}>{o.status}</span></div>
              <div style={{marginBottom:8}}><span style={{background:pc.bg,color:pc.c,padding:'2px 8px',borderRadius:999,fontSize:'0.65rem',fontWeight:800}}>PAY: {o.paymentStatus || 'PENDING'}</span></div>
              <p style={{fontSize:'0.8rem',color:'#666'}}>📅 {new Date(o.createdAt).toLocaleString('en-IN')}</p>
              <p style={{fontWeight:700,margin:'6px 0 2px',fontSize:'0.95rem'}}>👤 {o.customer?.name || '—'}</p><p style={{fontSize:'0.8rem',color:'#888'}}>✉️ {o.customer?.email || '—'}</p><p style={{fontSize:'0.8rem',color:'#888'}}>📞 {o.customer?.phone || '—'}</p>
              <p style={{fontSize:'0.8rem',color:'#444',marginTop:8,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={(o.items||[]).map(i=>`${i.product_name||i.product?.product_name} ×${i.quantity}`).join(', ')}>🛍️ {(o.items||[]).map(i=>`${i.product_code||i.product?.product_code||''} · ${i.product_name||i.product?.product_name||i.product?.name} ×${i.quantity}`).join(', ') || 'No items'}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}><span style={{fontWeight:900}}>₹{o.total}</span><span style={{fontSize:'0.7rem',color:'#888'}}>ship ₹{o.shippingFee}</span></div>
              <div onClick={e=>e.stopPropagation()} style={{marginTop:10,display:'flex',gap:8}}>
                <select value={o.status} onChange={e=>updateStatus(o.orderNumber,e.target.value)} style={{flex:1,padding:'0.5rem',border:'1px solid #ddd',borderRadius:8,fontSize:'0.8rem'}}><option>PENDING_PAYMENT</option><option>PAID</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select>
                <button onClick={()=>deleteOrder(o.orderNumber)} disabled={deletingId===o.orderNumber} title="Permanently delete order from database" style={{background:deletingId===o.orderNumber?'#ccc':'#fff',color:'#B91C1C',border:'1px solid #FECACA',padding:'0 0.75rem',borderRadius:8,fontSize:'0.75rem',fontWeight:800,whiteSpace:'nowrap',cursor:deletingId===o.orderNumber?'not-allowed':'pointer',minWidth:72}}>{deletingId===o.orderNumber?'…':'🗑 Delete'}</button>
              </div>
            </div>
          })}
        </div>
      )}
      <div style={{display:'flex',gap:8,marginTop:18}}><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{background:'#fff',color:'#111',border:'1px solid #111',padding:'0.6rem 1.2rem',borderRadius:8,fontWeight:700,opacity:page<=1?0.5:1}}>Prev</button><button onClick={()=>setPage(p=>p+1)} style={{background:'#fff',color:'#111',border:'1px solid #111',padding:'0.6rem 1.2rem',borderRadius:8,fontWeight:700}}>Next</button></div>
      </>}
      {tab==='custom'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem',marginBottom:'1.2rem'}}>
            <div><h2 style={{fontFamily:'var(--font-heading)',fontWeight:900,fontSize:'1.4rem',color:'#6B4F3A'}}>CUSTOM ORDERS</h2><p style={{color:'#888',fontSize:'0.85rem'}}>{customOrders.length} requests · handcrafted inquiries</p></div>
            <div style={{display:'flex',gap:8}}><select value={customFilter} onChange={e=>setCustomFilter(e.target.value)} style={{padding:'0.6rem 1rem',border:'1px solid #D6CBB8',borderRadius:999,background:'#FFFDF8',fontSize:'0.85rem'}}><option value="">All types</option><option>Custom Keychain</option><option>Frame - 9x12 inches</option><option>Frame - 15x20 inches</option><option>Frame - 18x24 inches</option><option>Phone Stand</option><option>Something Else</option></select><button onClick={()=>{handleAdminLogout()}} style={{background:'#fff',color:'#111',border:'1px solid #111',padding:'0.6rem 1.2rem',borderRadius:8,fontWeight:700}}>Sign out</button></div>
          </div>
          {customOrders.filter(c=>!customFilter||c.type===customFilter).length===0?(
            <div style={{background:'#FFFDF8',border:'1px dashed #D6CBB8',borderRadius:16,padding:'3rem',textAlign:'center'}}>
              <p style={{fontSize:'1.1rem',fontWeight:700,color:'#6B4F3A'}}>No custom requests yet</p><p style={{fontSize:'0.85rem',color:'#999',marginTop:6}}>Requests from /custom-orders will appear here (stored in localStorage).</p>
              <button onClick={()=>{const demo=[{id:'CR-001',name:'Demo Customer',contact:'98765 43210',type:'Frame - 9x12 inches',details:'Engrave family photo with names',refs:0,createdAt:new Date().toISOString(),status:'pending'}];localStorage.setItem('eskraft-custom-orders',JSON.stringify(demo));setCustomOrders(demo)}} className="btn" style={{marginTop:14,background:'#6B4F3A',color:'#fff'}}>Load demo request</button>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {customOrders.filter(c=>!customFilter||c.type===customFilter).map(c=>{
                const sc=CUSTOM_STATUS_COLOR[c.status]||CUSTOM_STATUS_COLOR.pending;
                const imgs = Array.isArray(c.images) ? c.images : [];
                return <div key={c.id} style={{background:'#FFFEFB',border:'1px solid #EDE8E0',borderRadius:16,padding:'1.1rem 1.25rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}>
                    <div style={{minWidth:200,flex:1}}>
                      <p style={{fontWeight:800,fontSize:'0.95rem'}}>{c.name} <span style={{fontWeight:400,fontSize:'0.7rem',color:'#B8A999'}}>· {c.id}</span></p>
                      <p style={{fontSize:'0.78rem',color:'#888'}}>{c.contact} · {new Date(c.createdAt).toLocaleString('en-IN')}</p>
                      {(c.accountEmail || c.userId) && (
                        <p style={{fontSize:'0.72rem',color:'#6B4F3A',marginTop:4}}>Account: {c.accountEmail || c.userId}{c.accountPhone ? ` · ${c.accountPhone}` : ''}</p>
                      )}
                      <p style={{display:'inline-block',fontSize:'0.75rem',fontWeight:700,background:'#FFF6E8',border:'1px solid #F0D9B5',padding:'3px 10px',borderRadius:999,marginTop:8}}>{c.type}</p>
                      <p style={{fontSize:'0.88rem',color:'#444',marginTop:8,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{c.details||'—'}</p>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <select value={c.status} onChange={e=>updateCustomStatus(c.id,e.target.value)} style={{padding:'0.45rem 0.7rem',border:'1px solid #ddd',borderRadius:999,fontSize:'0.72rem',fontWeight:800,background:sc.bg,color:sc.c}}><option value="pending">PENDING</option><option value="reviewing">REVIEWING</option><option value="approved">APPROVED</option><option value="shipped">SHIPPED</option><option value="rejected">REJECTED</option></select>
                      <button onClick={()=>deleteCustomOrder(c.id)} title="Delete custom request" style={{background:'#fff',color:'#B91C1C',border:'1px solid #FECACA',borderRadius:8,fontSize:'0.72rem',fontWeight:800,padding:'0.45rem 0.7rem',cursor:'pointer'}}>🗑</button>
                    </div>
                  </div>
                  <div style={{marginTop:10,borderTop:'1px solid #F0EBE3',paddingTop:10}}>
                    <p style={{fontSize:'0.7rem',fontWeight:800,letterSpacing:'0.08em',color:'#8B6A4A',marginBottom:8}}>REFERENCE IMAGES ({imgs.length || c.refs || 0}) — click to enlarge</p>
                    {imgs.length>0?(
                      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                        {imgs.map((src,i)=>(
                          <img key={i} src={src} alt={`Reference ${i+1} for ${c.id}`} onClick={()=>setViewImg({src,label:`${c.id} · ${c.name} · image ${i+1}/${imgs.length}`})}
                            style={{width:96,height:96,objectFit:'cover',borderRadius:10,border:'1px solid #EDE8E0',cursor:'zoom-in',background:'#fff'}} />
                        ))}
                      </div>
                    ):(
                      <p style={{fontSize:'0.8rem',color:'#999'}}>{c.refs>0?'⚠️ This request was submitted before image saving was enabled — the customer attached '+c.refs+' image(s) but the files were not stored. Ask the customer on '+c.contact+'.':'No reference images attached.'}</p>
                    )}
                  </div>
                </div>
              })}
            </div>
          )}
        </div>
      )}
    </div>
    {viewImg&&<div onClick={()=>setViewImg(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16,flexDirection:'column',gap:10}}><img src={viewImg.src} alt={viewImg.label} style={{maxWidth:'92vw',maxHeight:'82vh',borderRadius:12,objectFit:'contain',background:'#fff'}} /><p style={{color:'#fff',fontSize:'0.8rem'}}>{viewImg.label} · click anywhere to close</p></div>}
    {selected&&<div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}><div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:'1.5rem',maxWidth:520,width:'100%',maxHeight:'85vh',overflow:'auto'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><h3 style={{fontWeight:900}}>{selected.orderNumber}</h3><button onClick={()=>setSelected(null)} style={{fontSize:'1.3rem'}}>×</button></div><p style={{fontSize:'0.85rem',color:'#666'}}>{new Date(selected.createdAt).toLocaleString('en-IN')} · {selected.status} · PAY: {selected.paymentStatus}</p><p style={{marginTop:8,fontWeight:700}}>{selected.customer?.name}</p><p style={{fontSize:'0.85rem',color:'#666'}}>{selected.customer?.email} · {selected.customer?.phone}</p><div style={{marginTop:14,borderTop:'1px solid #eee',paddingTop:12}}>{selected.items?.map(it=><div key={it.id} style={{display:'flex',justifyContent:'space-between',gap:8,padding:'6px 0',borderBottom:'1px solid #f5f5f5',fontSize:'0.9rem'}}><span><b style={{color:'#111'}}>{it.product_code||it.product?.product_code||''}</b> · {it.product_name||it.product?.product_name} ×{it.quantity} <span style={{color:'#888',fontSize:'0.75rem'}}>₹{it.unitPrice} each</span></span><span>₹{it.subtotal}</span></div>)}<div style={{display:'flex',justifyContent:'space-between',marginTop:10}}><span>Subtotal</span><span>₹{selected.subtotal}</span></div><div style={{display:'flex',justifyContent:'space-between'}}><span>Shipping</span><span>₹{selected.shippingFee}</span></div><div style={{display:'flex',justifyContent:'space-between',fontWeight:900,marginTop:6,borderTop:'1px solid #111',paddingTop:6}}><span>Total</span><span>₹{selected.total}</span></div></div><div style={{marginTop:16,display:'flex',gap:8,justifyContent:'flex-end',borderTop:'1px solid #FEE2E2',paddingTop:12}}><button onClick={()=>deleteOrder(selected.orderNumber)} disabled={deletingId===selected.orderNumber} style={{background:deletingId===selected.orderNumber?'#FCA5A5':'#DC2626',color:'#fff',border:'none',padding:'0.6rem 1.1rem',borderRadius:8,fontWeight:800,fontSize:'0.85rem',cursor:deletingId===selected.orderNumber?'not-allowed':'pointer'}}>{deletingId===selected.orderNumber?'Deleting…':'🗑 Delete Order'}</button><button onClick={()=>setSelected(null)} style={{background:'#fff',color:'#111',border:'1px solid #ddd',padding:'0.6rem 1.1rem',borderRadius:8,fontWeight:700,fontSize:'0.85rem'}}>Close</button></div></div></div>}
    </div>
  )
}
