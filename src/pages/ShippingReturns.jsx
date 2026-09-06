import React from 'react';
import InfoPage from '../components/InfoPage';

const ShippingReturns = () => (
  <InfoPage
    title="Shipping & Returns"
    subtitle="Everything you need to know about getting your order and sending it back."
  >
    <div className="flex flex-col gap-md">
      <section>
        <h2 className="text-2xl font-black mb-2">Shipping Policy</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li>We deliver all across India, using National Courier services (eg: DTDC etc..) for most locations. For areas near Chennai, we may deliver personally. Once your order is shipped via National Courier services, you will be notified through WhatsApp.</li>
          <li>Orders typically take 2-3 business days to process.</li>
          <li>Once online payment has been received from Cashfree Merchant, product(s) will be packed and shipped either through DTDC or by ESKraft.</li>
          <li><strong>Shipping rate applies as follows:</strong></li>
          <li>1. Shipping rate applies to products ranging from ₹200 - ₹750.</li>
          <li>2. Orders above ₹750 have <strong>FREE DELIVERY</strong>.</li>
          <li>ESKraft is responsible for parcels we deliver personally. For shipments via National Courier services, the courier company is responsible once delivery is notified.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-black mb-2">Returns</h2>
        <div style={{ background: '#FFF3CD', border: '1px solid #E6C87A', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#664D00', textTransform: 'none' }}>⚠️ A 15% refund charge will be applicable on returns. Proper proof of damage to the product is required for processing a return.</p>
        </div>
        <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>We accept returns within 7 days of delivery for unused items in original packaging.</li>
          <li>Refunds are issued to the original payment method.</li>
          <li>Customized / personalized pieces can only be returned if they arrive damaged or defective.</li>
          <li>To start a return, message us with your order ID and a photo of the item.</li>
        </ul>
      </section>
    </div>
  </InfoPage>
);

export default ShippingReturns;
