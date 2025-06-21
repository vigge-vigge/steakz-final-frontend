import React, { useState } from 'react';
import '../pages/styles/Home.css';

const initialOrders = [
  { id: 1, dish: 'Entrecôte', table: 3, status: 'Väntar' },
  { id: 2, dish: 'Oxfilé', table: 1, status: 'Tillagas' },
];

const Köksvy: React.FC = () => {
  const [orders, setOrders] = useState(initialOrders);

  const handleReady = (id: number) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Klar' } : o));
  };

  return (
    <div className="container">
      <h1>Köksvy</h1>
      <table style={{ width: '100%', marginTop: 24 }}>
        <thead>
          <tr>
            <th>Order-ID</th>
            <th>Rätt</th>
            <th>Bord</th>
            <th>Status</th>
            <th>Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.dish}</td>
              <td>{order.table}</td>
              <td>{order.status}</td>
              <td>
                {order.status !== 'Klar' && (
                  <button onClick={() => handleReady(order.id)}>Markera som klar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Köksvy;
