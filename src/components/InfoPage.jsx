import React from 'react';

const InfoPage = ({ title, subtitle, children }) => (
  <div className="container section" style={{ maxWidth: '800px' }}>
    <h1 className="text-4xl font-black mb-2">{title}</h1>
    {subtitle && (
      <p className="text-lg text-gray mb-8" style={{ textTransform: 'none', fontWeight: 400 }}>
        {subtitle}
      </p>
    )}
    {children}
  </div>
);

export default InfoPage;
