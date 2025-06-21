import React, { useEffect, useState, useContext } from 'react';
import { getOrders } from '../../services/api';
import { Payment, OrderWithDetails } from '../../types';
import ReceiptList from '../../components/common/ReceiptList';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useShift } from '../../hooks/useShift';
import { AuthContext } from '../../context/AuthContext';

const CashierReceipts: React.FC = () => {
  const { settings, t } = useSettings();
  const { isDarkMode } = useTheme();
  const { isActive: shiftActive } = useShift();
  const { user } = useContext(AuthContext);
  const [receipts, setReceipts] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [emailModal, setEmailModal] = useState<{ show: boolean; receipt: Payment | null; order: OrderWithDetails | null }>({
    show: false,
    receipt: null,
    order: null
  });
  const [emailAddress, setEmailAddress] = useState('');

  useEffect(() => {
    console.log('CashierReceipts mounted, user:', user);
    loadReceipts();
    
    // Refresh receipts every 10 seconds to keep data up to date
    const interval = setInterval(loadReceipts, 10000);
    
    // Listen for order placed events to immediately refresh
    const handleOrderPlaced = () => {
      console.log('Order placed event received, refreshing receipts...');
      loadReceipts();
    };
    
    window.addEventListener('orderPlaced', handleOrderPlaced);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('orderPlaced', handleOrderPlaced);
    };
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Loading all orders...');
      const response = await getOrders({});
      console.log('All orders response:', response.data);
      
      setOrders(response.data);
      
      // Flatten all payments from orders (including previous orders)
      const allReceipts = response.data
        .map((order: OrderWithDetails) => order.payment)
        .filter((p): p is Payment => !!p);
      
      console.log('Extracted receipts:', allReceipts);
      setReceipts(allReceipts);
      
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setMessage(`Error loading receipts: ${error?.response?.data?.message || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = (receipt: Payment) => {
    // Find the associated order
    const order = orders.find(o => o.payment?.id === receipt.id);
    if (!order) {
      setMessage('Order data not found for reprint');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Generate receipt HTML for printing
    const receiptHTML = generateReceiptHTML(receipt, order);
    
    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
      setMessage('Receipt sent to printer');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Unable to open print window');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEmail = async (receipt: Payment) => {
    // Find the associated order
    const order = orders.find(o => o.payment?.id === receipt.id);
    if (!order) {
      setMessage('Order data not found for email');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setEmailModal({ show: true, receipt, order });
  };

  const handleSendEmail = async () => {
    if (!emailModal.receipt || !emailAddress.trim()) {
      setMessage('Please enter a valid email address');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const emailData = {
        to: emailAddress.trim(),
        subject: `Receipt #${emailModal.receipt.id}`,
        body: generateEmailContent(emailModal.receipt, emailModal.order!)
      };
      
      console.log('Sending email with data:', emailData);
      setMessage('Email sent successfully!');
      setEmailModal({ show: false, receipt: null, order: null });
      setEmailAddress('');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error: any) {
      console.error('Error sending email:', error);
      setMessage(`Failed to send email: ${error?.response?.data?.message || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const generateReceiptHTML = (receipt: Payment, order: OrderWithDetails) => {
    const now = new Date();
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${receipt.id}</title>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 20px; max-width: 300px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-section { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
          .total { font-weight: bold; border-top: 2px solid #000; padding-top: 5px; }
          .footer { text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>RESTAURANT RECEIPT</h2>
          <p>Receipt #${receipt.id}</p>
          <p>Order #${order.id}</p>
          <p>${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
          <p>Customer: ${order.customer?.username || 'N/A'}</p>
        </div>
        
        <div class="items">
          ${order.items.map(item => `
            <div class="item">
              <span>${item.menuItem.name} x${item.quantity}</span>
              <span>$${item.subtotal.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="total-section">
          <div class="item total">
            <span>TOTAL:</span>
            <span>$${receipt.amount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Payment Method: ${receipt.method.replace('_', ' ')}</p>
          <p>Status: ${receipt.status}</p>
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
  };

  const generateEmailContent = (receipt: Payment, order: OrderWithDetails) => {
    return `
Dear ${order.customer?.username || 'Customer'},

Thank you for your order! Here are your receipt details:

Receipt #${receipt.id}
Order #${order.id}
Date: ${new Date(receipt.createdAt).toLocaleDateString()}
Time: ${new Date(receipt.createdAt).toLocaleTimeString()}

Order Items:
${order.items.map(item => `- ${item.menuItem.name} x${item.quantity} = $${item.subtotal.toFixed(2)}`).join('\n')}

Total Amount: $${receipt.amount.toFixed(2)}
Payment Method: ${receipt.method.replace('_', ' ')}
Status: ${receipt.status}

Thank you for choosing our restaurant!

Best regards,
Restaurant Management Team
    `.trim();
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.id.toString().includes(searchTerm) || 
                         receipt.orderId.toString().includes(searchTerm);
    const matchesMethod = methodFilter === 'ALL' || receipt.method === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || receipt.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const getTotalRevenue = () => {
    return filteredReceipts
      .filter(r => r.status === 'COMPLETED')
      .reduce((total, receipt) => total + receipt.amount, 0);
  };

  const getMethodStats = () => {
    const stats = { CASH: 0, CREDIT_CARD: 0, DEBIT_CARD: 0, MOBILE_PAYMENT: 0 };
    filteredReceipts
      .filter(r => r.status === 'COMPLETED')
      .forEach(receipt => {
        stats[receipt.method] += receipt.amount;
      });
    return stats;
  };

  const methodStats = getMethodStats();

  return (
    <div className="receipts-page">
      <div className="receipts-container">
        {/* Header */}
        <div className="receipts-header">
          <h1>Receipts & Payment</h1>
          <p>View and manage payment receipts. Search by receipt or order ID.</p>
          
          {!shiftActive && (
            <div className="shift-warning">
              <p><strong>Shift: Inactive</strong></p>
            </div>
          )}
        </div>

        {message && (
          <div className="message-alert">
            {message}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon revenue">
              <span>💰</span>
            </div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">${getTotalRevenue().toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon receipts">
              <span>📄</span>
            </div>
            <div className="stat-content">
              <h3>Total Receipts</h3>
              <p className="stat-value">{receipts.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon payments">
              <span>✅</span>
            </div>
            <div className="stat-content">
              <h3>Completed Payments</h3>
              <p className="stat-value">{receipts.filter(r => r.status === 'COMPLETED').length}</p>
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="payment-breakdown">
          <h3>Payment Method Breakdown</h3>
          <div className="payment-grid">
            <div className="payment-method">
              <div className="payment-amount">${methodStats.CASH.toFixed(2)}</div>
              <div className="payment-label">Cash</div>
            </div>
            <div className="payment-method">
              <div className="payment-amount">${methodStats.CREDIT_CARD.toFixed(2)}</div>
              <div className="payment-label">Credit Card</div>
            </div>
            <div className="payment-method">
              <div className="payment-amount">${methodStats.DEBIT_CARD.toFixed(2)}</div>
              <div className="payment-label">Debit Card</div>
            </div>
            <div className="payment-method">
              <div className="payment-amount">${methodStats.MOBILE_PAYMENT.toFixed(2)}</div>
              <div className="payment-label">Mobile Payment</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-section">
          <div className="search-grid">
            <div className="search-field">
              <label>Search Receipts</label>
              <input
                type="text"
                placeholder="Search by receipt or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-field">
              <label>Payment Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="MOBILE_PAYMENT">Mobile Payment</option>
              </select>
            </div>

            <div className="filter-field">
              <label>Payment Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="refresh-container">
              <button onClick={loadReceipts} className="refresh-btn">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Receipts List */}
        <div className="receipts-list">
          <div className="receipts-list-header">
            <h3>Receipts ({filteredReceipts.length})</h3>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading receipts...</p>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="empty-state">
              <p>No receipts found</p>
              <p className="empty-subtitle">Receipts will appear here after orders are completed</p>
            </div>
          ) : (
            <ReceiptList
              receipts={filteredReceipts}
              onReprint={handleReprint}
              onEmail={(receipt) => setEmailModal({ show: true, receipt, order: orders.find(o => o.payment?.id === receipt.id) || null })}
            />
          )}
        </div>

        {/* Email Modal */}
        {emailModal.show && emailModal.receipt && emailModal.order && (
          <div className="email-modal-overlay">
            <div className="email-modal">
              <div className="email-modal-header">
                <h3>Email Receipt</h3>
                <button 
                  onClick={() => setEmailModal({ show: false, receipt: null, order: null })}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              
              <div className="email-modal-content">
                <div className="receipt-preview">
                  <h4>Receipt #{emailModal.receipt.id}</h4>
                  <p><strong>Order:</strong> #{emailModal.order.id}</p>
                  <p><strong>Amount:</strong> ${emailModal.receipt.amount.toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> {emailModal.receipt.method.replace('_', ' ')}</p>
                  <p><strong>Status:</strong> {emailModal.receipt.status}</p>
                </div>
                
                <div className="email-input-section">
                  <label>Email Address:</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="customer@example.com"
                    className="email-input"
                  />
                </div>
              </div>
              
              <div className="email-modal-actions">
                <button 
                  onClick={() => setEmailModal({ show: false, receipt: null, order: null })}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendEmail}
                  className="send-btn"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>        )}
      </div>
    </div>
  );
};

export default CashierReceipts;
