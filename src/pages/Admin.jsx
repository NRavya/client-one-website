import { useEffect, useState } from 'react';
const API='/api';
const STATUS_COLOR={PENDING_PAYMENT:{bg:'#FFF3CD',c:'#856404'},PAID:{bg:'#D4EDDA',c:'#155724'},PROCESSING:{bg:'#CCE5FF',c:'#004085'},SHIPPED:{bg:'#D1ECF1',c:'#0C5460'},DELIVERED:{bg:'#D4EDDA',c:'#155724'},CANCELLED:{bg:'#F8D7DA',c:'#721C24'},FAILED:{bg:'#F8D7DA',c:'#721C24'},REFUNDED:{bg:'#E2E3E5',c:'#383D41'}};
const CUSTOM_STATUS_COLOR={pending:{bg:'#FFF3CD',c:'#856404'},reviewing:{bg:'#CCE5FF',c:'#004085'},approved:{bg:'#D4EDDA',c:'#155724'},shipped:{bg:'#D1ECF1',c:'#0C5460'},rejected:{bg:'#F8D7DA',c:'#721C24'}};
export default function Admin(){
  const [tab,setTab]=useState('orders'); // orders | custom
  const [token,setToken]=useState(()=>localStorage.getItem('eskraft-token'));
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('eskraft-user'))}catch{return null}});
  const [orders,setOrders]=useState([]);const [total,setTotal]=useState(0);const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [status,setStatus]=useState('');const [search,setSearch]=useState('');const [page,setPage]=useState(1);const [newOnly,setNewOnly]=useState(false);const [newCount,setNewCount]=useState(0);const [selected,setSelected]=useState(null);
  const [customOrders,setCustomOrders]=useState(()=>{try{return JSON.parse(localStorage.getItem('eskraft-custom-orders')||'[]')}catch{return []}});
  const [customFilter,setCustomFilter]=useState('');
  const updateCustomStatus=(id,s)=>{const n=customOrders.map(c=>c.id===id?{...c,status:s}:c);setCustomOrders(n);localStorage.setItem('eskraft-custom-orders',JSON.stringify(n))};
  const [email,setEmail]=useState('admin@eskraft.in');const [password,setPassword]=useState('Admin@123');
  const fetchOrders=async()=>{
    if(!token) return;setLoading(true);setError('');
    try{
      const effective=newOnly?'PENDING_PAYMENT':status;
      const q=new URLSearchParams({page,limit:20,...(effective&&{status:effective}),...(search&&{search})}).toString();
      const res=await fetch(`${API}/admin/orders?${q}`,{headers:{Authorization:`Bearer ${token}`}});
      const data=await res.json();if(!data.success) throw new Error(data.error?.message);
      if(Array.isArray(data.data)){setOrders(data.data);setTotal(data.data.length)} else {setOrders(data.data.orders);setTotal(data.data.total)}
    }catch(e){setError(e.message)} finally{setLoading(false)}
  };
  useEffect(()=>{fetchOrders()},[token,status,page,newOnly]);
  useEffect(()=>{
    if(!token) return;
    const fn=async()=>{try{const r=await fetch(`${API}/admin/orders?status=PENDING_PAYMENT&limit=1`,{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(d.success) setNewCount(d.data.total??0)}catch{}};
    fn();const id=setInterval(()=>{fn();if(newOnly) fetchOrders()},15000);return()=>clearInterval(id);
  },[token,newOnly]);
  const handleLogin=async e=>{
    e.preventDefault();setError('');
    try{const r=await fetch(`${API}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!d.success) throw new Error(d.error?.message);if(d.data.user.role!=='ADMIN'&&d.data.user.role!=='SUPER_ADMIN') throw new Error('Not an admin account');localStorage.setItem('eskraft-token',d.data.token);localStorage.setItem('eskraft-user',JSON.stringify(d.data.user));setToken(d.data.token);setUser(d.data.user)}catch(e){setError(e.message)}
  };
  const updateStatus=async(orderNumber,newStatus)=>{
    try{const r=await fetch(`${API}/admin/orders/${orderNumber}/status`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({status:newStatus})});const d=await r.json();if(!d.success) throw new Error(d.error?.message);if(selected&&selected.orderNumber===orderNumber) setSelected({...selected,status:newStatus});fetchOrders()}catch(e){alert(e.message)}
  };
  if(!token||!user||(user.role!=='ADMIN'&&user.role!=='SUPER_ADMIN')){
    return <div className="container section" style={{maxWidth:440}}><h1 className="text-3xl font-black mb-2">ADMIN LOGIN</h1><p className="text-sm text-gray mb-6" style={{textTransform:'none'}}>Sign in to view all orders. Separate admin link: <code>/admin</code></p>{error&&<div style={{background:'#F8D7DA',color:'#721C24',padding:'0.75rem',borderRadius:8,marginBottom:12,fontSize:'0.85rem'}}>{error}</div>}<form onSubmit={handleLogin} className="flex flex-col gap-sm"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{padding:'0.9rem',border:'1px solid #ddd',borderRadius:10}}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{padding:'0.9rem',border:'1px solid #ddd',borderRadius:10}}/><button className="btn" style={{padding:'1rem'}}>SIGN IN AS ADMIN</button></form></div>
  }
  return (
    <div style={{background:'#0F1115',minHeight:'100vh',fontFamily:'system-ui, sans-serif'}}>
      {/* Admin-only header - dark, industrial - clearly not customer shop */}
      <header style={{background:'#1A1D24',borderBottom:'1px solid #2A2E39',padding:'0.9rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}><span style={{background:'#FF3B30',color:'#fff',padding:'4px 10px',borderRadius:6,fontSize:'0.65rem',fontWeight:900,letterSpacing:'0.1em'}}>ADMIN</span><span style={{color:'#fff',fontWeight:900,letterSpacing:'0.06em',fontSize:'1rem'}}>ESKRAFT — BACK OFFICE</span><span style={{color:'#6B7280',fontSize:'0.75rem',marginLeft:8,borderLeft:'1px solid #2A2E39',paddingLeft:12}}>{user.email}</span></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}><a href="/" style={{color:'#9CA3AF',fontSize:'0.8rem',textDecoration:'none',border:'1px solid #2A2E39',padding:'6px 12px',borderRadius:999}}>← View Store</a><button onClick={()=>{localStorage.removeItem('eskraft-token');localStorage.removeItem('eskraft-user');setToken(null);setUser(null)}} style={{background:'#2A2E39',color:'#fff',border:'none',padding:'6px 14px',borderRadius:999,fontSize:'0.8rem',cursor:'pointer'}}>Sign out</button></div>
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
        <div style={{display:'flex',gap:8}}><button onClick={fetchOrders} style={{background:'#fff',color:'#111',border:'1px solid #111',padding:'0.6rem 1.2rem',borderRadius:8,fontWeight:700}}>↻ Refresh</button><button onClick={()=>{localStorage.removeItem('eskraft-token');localStorage.removeItem('eskraft-user');setToken(null);setUser(null)}} style={{background:'#fff',color:'#111',border:'1px solid #111',padding:'0.6rem 1.2rem',borderRadius:8,fontWeight:700}}>Sign out</button></div>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:16}}>
        <button onClick={()=>{setNewOnly(!newOnly);setStatus('');setPage(1)}} className="btn" style={{background:newOnly?'#111':'#fff',color:newOnly?'#fff':'#111',border:'1px solid #111',borderRadius:999}}>New {newCount>0&&<span style={{background:'crimson',color:'#fff',borderRadius:999,padding:'2px 8px',fontSize:'0.7rem',marginLeft:6}}>{newCount}</span>}</button>
        <select value={status} onChange={e=>{setStatus(e.target.value);setNewOnly(false);setPage(1)}} style={{padding:'0.6rem 0.9rem',border:'1px solid #ddd',borderRadius:999,background:'#fff'}} disabled={newOnly}><option value="">All statuses</option><option>PENDING_PAYMENT</option><option>PAID</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select>
        <div style={{display:'flex',flex:1,minWidth:220,border:'1px solid #ddd',borderRadius:999,overflow:'hidden',background:'#fff'}}><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchOrders()} placeholder="Search order # / customer" style={{flex:1,padding:'0.6rem 1rem',border:'none',outline:'none'}}/><button className="btn" onClick={()=>{setPage(1);fetchOrders()}} style={{borderRadius:0}}>Search</button></div>
      </div>
      {loading?<p>Loading…</p>:error?<p style={{color:'crimson'}}>{error}</p>:orders.length===0?<div style={{background:'#fff',border:'1px solid #eee',borderRadius:16,padding:'3rem',textAlign:'center',color:'#888'}}>No orders found.</div>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
          {orders.map(o=>{
            const sc=STATUS_COLOR[o.status]||{bg:'#eee',c:'#333'};
            return <div key={o.id} onClick={()=>setSelected(o)} style={{background:'#fff',border:'1px solid #eee',borderRadius:16,padding:'1.1rem',cursor:'pointer',borderLeft:o.status==='PENDING_PAYMENT'?'4px solid crimson':'1px solid #eee',boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><span style={{fontWeight:800,fontSize:'0.9rem'}}>{o.orderNumber}</span><span style={{background:sc.bg,color:sc.c,padding:'3px 10px',borderRadius:999,fontSize:'0.65rem',fontWeight:800,letterSpacing:'0.05em'}}>{o.status}</span></div>
              <p style={{fontSize:'0.8rem',color:'#666'}}>{new Date(o.createdAt).toLocaleString('en-IN')}</p>
              <p style={{fontWeight:700,margin:'6px 0 2px',fontSize:'0.95rem'}}>{o.customer?.name}</p><p style={{fontSize:'0.8rem',color:'#888'}}>{o.customer?.email} {o.customer?.phone&&`· ${o.customer.phone}`}</p>
              <p style={{fontSize:'0.8rem',color:'#444',marginTop:8,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{o.items?.map(i=>`${i.product_code||i.product?.product_code||''} · ${i.product_name||i.product?.product_name||i.product?.name} ×${i.quantity}`).join(', ')}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}><span style={{fontWeight:900}}>₹{o.total}</span><span style={{fontSize:'0.7rem',color:'#888'}}>ship ₹{o.shippingFee}</span></div>
              <div onClick={e=>e.stopPropagation()} style={{marginTop:10}}><select value={o.status} onChange={e=>updateStatus(o.orderNumber,e.target.value)} style={{width:'100%',padding:'0.5rem',border:'1px solid #ddd',borderRadius:8,fontSize:'0.8rem'}}><option>PENDING_PAYMENT</option><option>PAID</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select></div>
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
            <div style={{display:'flex',gap:8}}><select value={customFilter} onChange={e=>setCustomFilter(e.target.value)} style={{padding:'0.6rem 1rem',border:'1px solid #D6CBB8',borderRadius:999,background:'#FFFDF8',fontSize:'0.85rem'}}><option value="">All types</option><option>Custom Keychain</option><option>Frame - 9x12 inches</option><option>Frame - 15x20 inches</option><option>Frame - 18x24 inches</option><option>Phone Stand</option><option>Something Else</option></select><button onClick={()=>{localStorage.removeItem('eskraft-token');localStorage.removeItem('eskraft-user');setToken(null);setUser(null)}} style={{background:'#fff',color:'#111',border:'1px solid #111',padding:'0.6rem 1.2rem',borderRadius:8,fontWeight:700}}>Sign out</button></div>
          </div>
          {customOrders.filter(c=>!customFilter||c.type===customFilter).length===0?(
            <div style={{background:'#FFFDF8',border:'1px dashed #D6CBB8',borderRadius:16,padding:'3rem',textAlign:'center'}}>
              <p style={{fontSize:'1.1rem',fontWeight:700,color:'#6B4F3A'}}>No custom requests yet</p><p style={{fontSize:'0.85rem',color:'#999',marginTop:6}}>Requests from /custom-orders will appear here (stored in localStorage).</p>
              <button onClick={()=>{const demo=[{id:'CR-001',name:'Demo Customer',contact:'98765 43210',type:'Frame - 9x12 inches',details:'Engrave family photo with names',refs:0,createdAt:new Date().toISOString(),status:'pending'}];localStorage.setItem('eskraft-custom-orders',JSON.stringify(demo));setCustomOrders(demo)}} className="btn" style={{marginTop:14,background:'#6B4F3A',color:'#fff'}}>Load demo request</button>
            </div>
          ):(
            <div style={{background:'#fff',border:'1px solid #EDE8E0',borderRadius:16,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr 2fr 110px 130px',gap:0,background:'#6B4F3A',color:'#fff',padding:'0.9rem 1.2rem',fontSize:'0.7rem',fontWeight:800,letterSpacing:'0.08em'}}><span>CUSTOMER</span><span>TYPE</span><span>DETAILS</span><span>DATE</span><span>STATUS</span></div>
              {customOrders.filter(c=>!customFilter||c.type===customFilter).map(c=>{
                const sc=CUSTOM_STATUS_COLOR[c.status]||CUSTOM_STATUS_COLOR.pending;
                return <div key={c.id} style={{display:'grid',gridTemplateColumns:'1.2fr 1fr 2fr 110px 130px',gap:'1rem',padding:'1rem 1.2rem',borderTop:'1px solid #F0EBE3',alignItems:'center',background:'#FFFEFB'}}>
                  <div><p style={{fontWeight:800,fontSize:'0.9rem'}}>{c.name}</p><p style={{fontSize:'0.75rem',color:'#888'}}>{c.contact}</p><p style={{fontSize:'0.65rem',color:'#B8A999',marginTop:2}}>{c.id}</p></div>
                  <span style={{fontSize:'0.8rem',fontWeight:700,background:'#FFF6E8',border:'1px solid #F0D9B5',padding:'4px 10px',borderRadius:999,textAlign:'center'}}>{c.type}</span>
                  <p style={{fontSize:'0.82rem',color:'#444',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={c.details}>{c.details||'—'}{c.refs?` · ${c.refs} image(s)`:''}</p>
                  <span style={{fontSize:'0.75rem',color:'#888'}}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                  <select value={c.status} onChange={e=>updateCustomStatus(c.id,e.target.value)} style={{padding:'0.45rem',border:'1px solid #ddd',borderRadius:999,fontSize:'0.72rem',fontWeight:800,background:sc.bg,color:sc.c,textAlign:'center'}}><option value="pending">PENDING</option><option value="reviewing">REVIEWING</option><option value="approved">APPROVED</option><option value="shipped">SHIPPED</option><option value="rejected">REJECTED</option></select>
                </div>
              })}
            </div>
          )}
        </div>
      )}
    </div>
    {selected&&<div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}><div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:'1.5rem',maxWidth:520,width:'100%',maxHeight:'85vh',overflow:'auto'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><h3 style={{fontWeight:900}}>{selected.orderNumber}</h3><button onClick={()=>setSelected(null)} style={{fontSize:'1.3rem'}}>×</button></div><p style={{fontSize:'0.85rem',color:'#666'}}>{new Date(selected.createdAt).toLocaleString('en-IN')} · {selected.status}</p><p style={{marginTop:8,fontWeight:700}}>{selected.customer?.name}</p><p style={{fontSize:'0.85rem',color:'#666'}}>{selected.customer?.email} · {selected.customer?.phone}</p><div style={{marginTop:14,borderTop:'1px solid #eee',paddingTop:12}}>{selected.items?.map(it=><div key={it.id} style={{display:'flex',justifyContent:'space-between',gap:8,padding:'6px 0',borderBottom:'1px solid #f5f5f5',fontSize:'0.9rem'}}><span><b style={{color:'#111'}}>{it.product_code||it.product?.product_code||''}</b> · {it.product_name||it.product?.product_name} ×{it.quantity} <span style={{color:'#888',fontSize:'0.75rem'}}>₹{it.unitPrice} each</span></span><span>₹{it.subtotal}</span></div>)}<div style={{display:'flex',justifyContent:'space-between',marginTop:10}}><span>Subtotal</span><span>₹{selected.subtotal}</span></div><div style={{display:'flex',justifyContent:'space-between'}}><span>Shipping</span><span>₹{selected.shippingFee}</span></div><div style={{display:'flex',justifyContent:'space-between',fontWeight:900,marginTop:6,borderTop:'1px solid #111',paddingTop:6}}><span>Total</span><span>₹{selected.total}</span></div></div></div></div>}
    </div>
  )
}
