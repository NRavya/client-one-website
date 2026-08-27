import React, { useState } from 'react';
import InfoPage from '../components/InfoPage';
import { Package } from 'lucide-react';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [submittedId, setSubmittedId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim()) setSubmittedId(orderId.trim());
  };

  return (
    <InfoPage
      title="Track Order"
      subtitle="Enter your order ID (from your confirmation message) to see the latest status."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-sm" style={{ maxWidth: '480px' }}>
        <input
          type="text"
          value={orderId}
          onChange={(e) => { setOrderId(e.target.value); setSubmittedId(null); }}
          placeholder="e.g. ESK-12345"
          className="input w-full"
        />
        <button type="submit" className="btn">TRACK MY ORDER</button>
      </form>

      {submittedId && (
        <div className="mt-8" style={{ maxWidth: '480px', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '2rem' }}>
          <div className="flex items-center gap-sm" style={{ marginBottom: '1rem', color: 'var(--color-wood-dark)' }}>
            <Package size={24} />
            <span className="font-bold text-lg">Order {submittedId}</span>
          </div>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <li className="flex items-center gap-sm"><span className="badge badge-new">✓</span> Order confirmed</li>
            <li className="flex items-center gap-sm"><span className="badge badge-limited">✓</span> In production</li>
            <li className="flex items-center gap-sm"><span className="badge" style={{ opacity: 0.4 }}>•</span> Shipped</li>
            <li className="flex items-center gap-sm"><span className="badge" style={{ opacity: 0.4 }}>•</span> Delivered</li>
          </ol>
          <p className="text-sm text-gray mt-8" style={{ textTransform: 'none', fontWeight: 400 }}>
            Orders are usually shipped within 3–5 business days. You'll receive a WhatsApp update when it's on the way.
          </p>
        </div>
      )}
    </InfoPage>
  );
};

export default TrackOrder;
