import React from 'react';
import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CashierLayout: React.FC = () => {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== 'CASHIER') return <div className="p-8 text-center">Unauthorized</div>;
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CashierLayout;
