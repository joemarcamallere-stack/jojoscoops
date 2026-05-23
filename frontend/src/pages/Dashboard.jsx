import React from 'react';

export default function Dashboard() {
  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '30px' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3>Revenue</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff4d8d', marginTop: '10px' }}>PHP 0.00</p>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3>Pending Orders</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff4d8d', marginTop: '10px' }}>0</p>
        </div>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3>Registered Staff</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff4d8d', marginTop: '10px' }}>0</p>
        </div>
      </div>
    </div>
  );
}
