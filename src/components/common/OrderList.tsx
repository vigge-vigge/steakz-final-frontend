import React from 'react';
import { OrderWithDetails } from '../../types';

interface OrderListProps {
  orders: OrderWithDetails[];
  onSelect?: (order: OrderWithDetails) => void;
  onDeliver?: (order: OrderWithDetails) => void;
  onCancel?: (order: OrderWithDetails) => void;
  onGenerateReceipt?: (order: OrderWithDetails) => void;
  onMarkReady?: (order: OrderWithDetails) => void;
  onStartPreparing?: (order: OrderWithDetails) => void;
  userRole?: string;
}

const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  onSelect, 
  onDeliver, 
  onCancel, 
  onGenerateReceipt, 
  onMarkReady, 
  onStartPreparing, 
  userRole 
}) => (
  <div className="space-y-2">
    {orders.map(order => (
      <div
        key={order.id}
        className="border p-2 rounded cursor-pointer hover:bg-gray-100"
        onClick={() => onSelect && onSelect(order)}
      >
        <div className="font-semibold">Order #{order.id} - {order.status}</div>
        <div>Total: ${order.totalAmount.toFixed(2)}</div>
        <div>Customer: {order.customer?.username || 'N/A'}</div>
        <div>Created: {new Date(order.createdAt).toLocaleString()}</div>        {/* Action buttons for orders */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          {/* Chef Actions */}
          {userRole === 'CHEF' && order.status === 'PENDING' && onStartPreparing && (
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={e => {
                e.stopPropagation();
                onStartPreparing(order);
              }}
            >
              Start Cooking
            </button>
          )}
          
          {userRole === 'CHEF' && order.status === 'PREPARING' && onMarkReady && (
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={e => {
                e.stopPropagation();
                onMarkReady(order);
              }}
            >
              Mark as Ready
            </button>
          )}
          
          {/* Cashier Actions */}
          {userRole === 'CASHIER' && (order.status === 'READY' || order.status === 'PENDING') && onDeliver && (
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={e => {
                e.stopPropagation();
                onDeliver(order);
              }}
            >
              Confirm Delivery
            </button>
          )}
          
          {/* Cancel button for multiple roles */}
          {(userRole === 'CASHIER' || userRole === 'CHEF') && 
           ['PENDING', 'PREPARING', 'READY'].includes(order.status) && onCancel && (
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={e => {
                e.stopPropagation();
                onCancel(order);
              }}
            >
              Cancel Order
            </button>
          )}
          
          {/* Receipt generation for delivered orders */}
          {order.status === 'DELIVERED' && onGenerateReceipt && (
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={e => {
                e.stopPropagation();
                onGenerateReceipt(order);
              }}
            >
              Generate Receipt
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default OrderList;
