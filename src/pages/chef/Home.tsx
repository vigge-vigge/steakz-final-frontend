import React, { useState } from 'react';

const ChefHome: React.FC = () => {
  const [shiftActive, setShiftActive] = useState(false);
  const [orders, setOrders] = useState({ queued: 0, inProgress: 0, completed: 0 });
  const [mealsPrepared, setMealsPrepared] = useState(0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Kitchen Dashboard</h1>
        <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>{orders.queued}</div>
            <div style={{ color: '#555', fontWeight: 500, marginTop: 8 }}>Pending</div>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>{orders.inProgress}</div>
            <div style={{ color: '#555', fontWeight: 500, marginTop: 8 }}>Preparing</div>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>{orders.completed}</div>
            <div style={{ color: '#555', fontWeight: 500, marginTop: 8 }}>Low Stock</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <button style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 600, fontSize: 16, cursor: shiftActive ? 'not-allowed' : 'pointer', opacity: shiftActive ? 0.5 : 1 }} disabled={shiftActive} onClick={() => setShiftActive(true)}>Start Shift</button>
          <button style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 600, fontSize: 16, cursor: !shiftActive ? 'not-allowed' : 'pointer', opacity: !shiftActive ? 0.5 : 1 }} disabled={!shiftActive} onClick={() => setShiftActive(false)}>End Shift</button>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 8, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Total meals prepared today</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb', marginTop: 8 }}>{mealsPrepared}</div>
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <button style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 600, fontSize: 16 }}>📋 Orders</button>
          <button style={{ flex: 1, background: '#f3f4f6', color: '#888', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 600, fontSize: 16 }}>🍖 Inventory</button>
          <button style={{ flex: 1, background: '#f3f4f6', color: '#888', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 600, fontSize: 16 }}>🍽️ Menu</button>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Pending Orders (0)</h2>
            <div style={{ border: '1px dashed #d1d5db', borderRadius: 8, padding: 32, textAlign: 'center', color: '#888' }}>
              No pending orders
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Preparing (0)</h2>
            <div style={{ border: '1px dashed #d1d5db', borderRadius: 8, padding: 32, textAlign: 'center', color: '#888' }}>
              No orders being prepared
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefHome;
export {};