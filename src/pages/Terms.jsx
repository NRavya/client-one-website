import React from 'react';

const Terms = () => {
  return (
    <div className="container section">
      <h1 className="section-title mb-8">Terms & Conditions</h1>
      
      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.6' }}>
        <section>
          <h2 className="font-bold text-lg mb-2">1. General</h2>
          <p>By accessing or using the ESKraft website (www.eskraft.com), you agree to comply with these Terms and Conditions. If you do not agree, please do not use our site.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">2. Orders & Products</h2>
          <p>All products are laser-cut and hand-assembled, with designs created by ESKraft (some AI-generated). Products are primarily decorative.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">3. Pricing & Payment</h2>
          <p>All prices are in INR and may vary based on availability and discounts. We accept all forms of payment, including online payments, UPI, <strong>NO CASH ON DELIVERY</strong>.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">4. Shipping & Delivery</h2>
          <p>ESKraft delivers across India via DTDC or personally near Chennai. Delivery timelines vary by location, and shipping charges apply for orders ₹200 to ₹750 and <strong>FREE DELIVERY</strong> above ₹750. ESKraft is responsible for personally delivered parcels; for DTDC deliveries, the courier is responsible once the parcel is dispatched. You will get a notification regarding the delivery type.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">5. Intellectual Property</h2>
          <p>All designs and content on this website are the property of ESKraft. Customers may not copy, reproduce, or use our drawings or designs without permission.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">6. User Conduct</h2>
          <p>Users agree not to misuse the website, or infringe on ESKraft’s intellectual property rights.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">7. Limitation of Liability</h2>
          <p>ESKraft is not liable for any indirect, incidental, or consequential damages arising from the use of our website or products. We make reasonable efforts to ensure product quality but cannot guarantee that use will be free from issues.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">8. Changes to Terms</h2>
          <p>ESKraft may update these Terms and Conditions at any time. Continued use of the website constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2">9. Governing Law</h2>
          <p>These Terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in Chennai, Tamil Nadu.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
