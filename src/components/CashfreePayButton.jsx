import React from 'react';

export default function CashfreePayButton({ compact = false }) {
  return (
    <a href="https://payments.cashfree.com/forms/eskraft" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'inline-block', width: compact ? 'auto' : '100%' }}>
      <div style={{ background: '#fdfdfd', border: '1px solid black', borderRadius: '15px', display: 'flex', padding: '10px', width: compact ? 'fit-content' : '100%', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <img src="https://cashfree-checkoutcartimages-prod.cashfree.com/logonewlauvkd8iq2cg_prod.png" alt="logo" style={{ width: '40px', height: '40px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Arial', color: '#000000', marginBottom: '5px', fontSize: '14px', fontWeight: 700 }}>Pay Now</div>
          <div style={{ fontFamily: 'Arial', color: '#000000', fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Powered By Cashfree</span>
            <img src="https://cashfreelogo.cashfree.com/cashfreepayments/logosvgs/Group_4355.svg" alt="logo" style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />
          </div>
        </div>
      </div>
    </a>
  );
}
