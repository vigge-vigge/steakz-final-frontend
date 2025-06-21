import React from 'react';
import { Payment } from '../../types';

interface ReceiptListProps {
  receipts: Payment[];
  onReprint?: (receipt: Payment) => void;
  onEmail?: (receipt: Payment) => void;
}

const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, onReprint, onEmail }) => (
  <div style={{ display: 'grid', gap: '16px' }}>
    {receipts.map(receipt => (
      <div key={receipt.id} style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              Receipt #{receipt.id}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Order #{receipt.orderId}
            </div>
          </div>
          <span style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: receipt.status === 'COMPLETED' ? '#d1fae5' : '#fee2e2',
            color: receipt.status === 'COMPLETED' ? '#065f46' : '#991b1b'
          }}>
            {receipt.status}
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Amount</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>${receipt.amount.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Method</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{receipt.method.replace('_', ' ')}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Date</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{new Date(receipt.createdAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Time</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{new Date(receipt.createdAt).toLocaleTimeString()}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onReprint && onReprint(receipt)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Reprint
            </div>
          </button>
          
          <button
            onClick={() => onEmail && onEmail(receipt)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </div>
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default ReceiptList;
