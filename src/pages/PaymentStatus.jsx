import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API } from '../utils/api';

export default function PaymentStatus() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const [status, setStatus] = useState('Verifying payment...');
  useEffect(() => {
    if (!orderId) { setStatus('No order found'); return; }
    fetch(`${API}/orders/${orderId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('eskraft-token')}` } })
      .then(r=>r.json()).then(d=> {
        if(d.success) setStatus(d.data.paymentStatus === 'SUCCESS' ? 'Payment Successful!' : d.data.status);
        else setStatus('Order not found');
      }).catch(()=> setStatus('Could not verify'));
  }, [orderId]);
  return (
    <div className="container section text-center">
      <h1 className="text-4xl font-black mb-4">{status}</h1>
      <p className="text-gray mb-6">Order: {orderId}</p>
      <Link to="/account" className="btn">View Orders</Link>
    </div>
  );
}
