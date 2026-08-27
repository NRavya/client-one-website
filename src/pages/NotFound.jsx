import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container section text-center flex flex-col items-center gap-md">
    <h1 className="text-7xl font-black">404</h1>
    <p className="text-lg text-gray" style={{ textTransform: 'none', fontWeight: 400 }}>
      This page got lost in the workshop. Let's get you back.
    </p>
    <Link to="/" className="btn">BACK TO HOME</Link>
  </div>
);

export default NotFound;
