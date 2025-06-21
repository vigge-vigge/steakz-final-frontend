import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getAllUsers, updateStaffMember, getBranches, updateUser, createStaffMember, createUser, createBranch, updateCurrentUser } from '../services/api';
import api from '../services/api';
import AdminCard from '../components/admin/AdminCard';
import '../components/admin/AdminCard.css';

// --- Account Settings Form ---
const AccountSettingsForm: React.FC<{ user: any; onUpdate: (data: any) => void }> = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    name: user?.username || '',
    email: user?.email || '',
    password: '',
  });
  const [role, setRole] = useState(user?.role || '');
  const [branchId, setBranchId] = useState(user?.branchId ? String(user.branchId) : '');
  const [branches, setBranches] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getBranches().then(res => setBranches(res.data || res)).catch(() => setBranches([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatePayload: any = {
        username: form.name,
        email: form.email,
      };
      if (form.password) updatePayload.password = form.password;
      if (role) updatePayload.role = role;
      if ((role === 'BRANCH_MANAGER' || role === 'CHEF' || role === 'CASHIER') && branchId) {
        updatePayload.branchId = Number(branchId);
      } else if (role === 'ADMIN' || role === 'GENERAL_MANAGER') {
        updatePayload.branchId = null;
      }
      Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);
      const updated = await updateUser(user.id, updatePayload);
      setMsg('Profile updated successfully!');
      onUpdate(updated);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Name</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>New Password (optional)</label>
          <input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Leave blank to keep current password" 
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select 
            value={role} 
            onChange={e => { 
              setRole(e.target.value); 
              if (e.target.value !== 'BRANCH_MANAGER' && e.target.value !== 'CHEF' && e.target.value !== 'CASHIER') {
                setBranchId('');
              }
            }} 
            required
          >
            <option value="ADMIN">Admin</option>
            <option value="GENERAL_MANAGER">General Manager</option>
            <option value="BRANCH_MANAGER">Branch Manager</option>
            <option value="CHEF">Chef</option>
            <option value="CASHIER">Cashier</option>
          </select>
        </div>
        {(role === 'BRANCH_MANAGER' || role === 'CHEF' || role === 'CASHIER') && (
          <div className="form-group">
            <label>Branch</label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)} required>
              <option value="">Select branch</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          type="submit" 
          disabled={saving}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {msg && (
          <span style={{ 
            color: msg.includes('successfully') ? '#10b981' : '#ef4444',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {msg}
          </span>
        )}
      </div>
    </form>
  );
};

// --- Manage Roles ---
const ManageRoles: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [newRole, setNewRole] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: '', branchId: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  // Branch creation state
  const [branchForm, setBranchForm] = useState({ name: '', address: '', phone: '', managerId: '' });
  const [branchCreating, setBranchCreating] = useState(false);
  const [branchCreateError, setBranchCreateError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, branchesRes] = await Promise.all([
        getAllUsers(1, 100),
        getBranches()
      ]);
      setUsers(usersRes.users);
      setBranches(branchesRes.data || branchesRes);
    } catch (err: any) {
      setMsg('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number, role: string, branchId?: number) => {
    setEditing(id);
    setNewRole(role);
    setSelectedBranch(branchId ? String(branchId) : '');
  };

  const handleSave = async (id: number) => {
    try {
      const updatePayload: any = { role: newRole };
      if (["BRANCH_MANAGER","CHEF","CASHIER"].includes(newRole) && selectedBranch) {
        updatePayload.branchId = Number(selectedBranch);
      } else {
        updatePayload.branchId = null;
      }

      if (["ADMIN","GENERAL_MANAGER"].includes(newRole)) {
        await updateUser(id, updatePayload);
      } else {
        await updateStaffMember(id, updatePayload);
      }
      
      setUsers(us => us.map(u => u.id === id ? { ...u, ...updatePayload } : u));
      setMsg('Role updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Update failed');
    }
    setEditing(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers(us => us.filter(u => u.id !== id));
      setMsg('User deleted successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || 'Delete failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const payload: any = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      };
      if ((["BRANCH_MANAGER","CHEF","CASHIER"].includes(newUser.role)) && newUser.branchId) {
        payload.branchId = Number(newUser.branchId);
      }
      
      if (["CHEF","CASHIER","BRANCH_MANAGER"].includes(newUser.role)) {
        await createStaffMember(payload);
      } else {
        await createUser(payload);
      }
      
      await loadData(); // Reload data to get the actual created user
      setNewUser({ username: '', email: '', password: '', role: '', branchId: '' });
      setMsg('User created successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || err?.message || 'Error creating user');
    } finally {
      setCreating(false);
    }
  };

  // Branch creation handler
  const handleBranchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchCreating(true);
    setBranchCreateError('');
    try {
      if (!branchForm.name) {
        setBranchCreateError('Branch name is required');
        setBranchCreating(false);
        return;
      }
      await createBranch({
        name: branchForm.name,
        address: branchForm.address,
        phone: branchForm.phone,
      });
      setBranchForm({ name: '', address: '', phone: '', managerId: '' });
      await loadData();
      setMsg('Branch created successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setBranchCreateError(err?.response?.data?.error || err?.message || 'Error creating branch');
    } finally {
      setBranchCreating(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>;
  }

  return (
    <div>
      {msg && (
        <div style={{ 
          background: msg.includes('successfully') ? '#f0fdf4' : '#fef2f2',
          color: msg.includes('successfully') ? '#16a34a' : '#dc2626',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: `1px solid ${msg.includes('successfully') ? '#bbf7d0' : '#fecaca'}`
        }}>
          {msg}
        </div>
      )}

      {/* Create New User */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Create New User
        </h3>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              className="form-input" 
              placeholder="Username" 
              value={newUser.username} 
              onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
              required 
            />
            <input 
              className="form-input" 
              placeholder="Email" 
              type="email" 
              value={newUser.email} 
              onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
              required 
            />
            <input 
              className="form-input" 
              placeholder="Password" 
              type="password" 
              value={newUser.password} 
              onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
              required 
            />
            <select 
              className="form-input" 
              value={newUser.role} 
              onChange={e => setNewUser({ ...newUser, role: e.target.value, branchId: '' })} 
              required
            >
              <option value="">Select role</option>
              <option value="ADMIN">Admin</option>
              <option value="GENERAL_MANAGER">General Manager</option>
              <option value="BRANCH_MANAGER">Branch Manager</option>
              <option value="CHEF">Chef</option>
              <option value="CASHIER">Cashier</option>
            </select>
            {(newUser.role === 'BRANCH_MANAGER' || newUser.role === 'CHEF' || newUser.role === 'CASHIER') && (
              <select 
                className="form-input" 
                value={newUser.branchId} 
                onChange={e => setNewUser({ ...newUser, branchId: e.target.value })} 
                required
              >
                <option value="">Select branch</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              type="submit" 
              disabled={creating}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.7 : 1
              }}
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
            {createError && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                {createError}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Create New Branch */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Create New Branch
        </h3>
        <form onSubmit={handleBranchCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <input
              className="form-input"
              placeholder="Branch Name"
              value={branchForm.name}
              onChange={e => setBranchForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="form-input"
              placeholder="Address"
              value={branchForm.address}
              onChange={e => setBranchForm(f => ({ ...f, address: e.target.value }))}
            />
            <input
              className="form-input"
              placeholder="Phone"
              value={branchForm.phone}
              onChange={e => setBranchForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={branchCreating}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                cursor: branchCreating ? 'not-allowed' : 'pointer',
                opacity: branchCreating ? 0.7 : 1
              }}
            >
              {branchCreating ? 'Creating...' : 'Create Branch'}
            </button>
            {branchCreateError && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                {branchCreateError}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Branch</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{u.username}</td>
                <td style={{ padding: '1rem', color: '#6b7280' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  {editing === u.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <select 
                        value={newRole} 
                        onChange={e => { 
                          setNewRole(e.target.value); 
                          if (!["BRANCH_MANAGER","CHEF","CASHIER"].includes(e.target.value)) {
                            setSelectedBranch('');
                          }
                        }} 
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="GENERAL_MANAGER">General Manager</option>
                        <option value="BRANCH_MANAGER">Branch Manager</option>
                        <option value="CHEF">Chef</option>
                        <option value="CASHIER">Cashier</option>
                        <option value="CUSTOMER">Customer</option>
                      </select>
                      {["BRANCH_MANAGER","CHEF","CASHIER"].includes(newRole) && (
                        <select 
                          value={selectedBranch} 
                          onChange={e => setSelectedBranch(e.target.value)} 
                          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        >
                          <option value="">Select branch</option>
                          {branches.map((b: any) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <span style={{
                      background: '#ede9fe',
                      color: '#7c3aed',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {u.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem', color: '#6b7280' }}>{u.branch?.name || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  {editing === u.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleSave(u.id)}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditing(null)}
                        style={{
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleEdit(u.id, u.role, u.branchId)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- System Preferences ---
const SystemPreferences: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const [tax, setTax] = useState('12');
  const [discount, setDiscount] = useState('5');
  const [timezone, setTimezone] = useState('UTC');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Here you would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMsg('Preferences saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Tax Rate (%)</label>
          <input 
            type="number" 
            step="0.01" 
            value={tax} 
            onChange={e => setTax(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Default Discount (%)</label>
          <input 
            type="number" 
            step="0.01" 
            value={discount} 
            onChange={e => setDiscount(e.target.value)} 
          />
        </div>        <div className="form-group">
          <label>Currency</label>
          <select 
            value={settings.currency} 
            onChange={e => setSettings({ ...settings, currency: e.target.value })}
          >
            <option value="EUR">EUR - Euro</option>
            <option value="USD">USD - US Dollar</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="SEK">SEK - Swedish Krona</option>
            <option value="CHF">CHF - Swiss Franc</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>
        <div className="form-group">
          <label>Timezone</label>
          <select value={timezone} onChange={e => setTimezone(e.target.value)}>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">GMT</option>
            <option value="Europe/Stockholm">CET</option>
          </select>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          type="submit" 
          disabled={saving}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        {msg && (
          <span style={{ 
            color: msg.includes('successfully') ? '#10b981' : '#ef4444',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {msg}
          </span>
        )}
      </div>
    </form>
  );
};

// --- Data Export ---
const DataExport: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportType, setExportType] = useState('orders');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleExport = async () => {
    setDownloading(true);
    setProgress(0);
    setStatus('Preparing export...');
    setError('');
    setFileUrl('');

    try {
      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        setStatus(i === 100 ? 'Export complete!' : `Exporting ${exportType}... ${i}%`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Simulate file URL
      setFileUrl(`data:text/csv;charset=utf-8,${encodeURIComponent('Sample,Data,Export\n1,2,3\n4,5,6')}`);
    } catch (err: any) {
      setError('Export failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Export Type</label>
          <select value={exportType} onChange={e => setExportType(e.target.value)}>
            <option value="orders">Orders</option>
            <option value="users">Users</option>
            <option value="menu">Menu Items</option>
            <option value="inventory">Inventory</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input 
            type="date" 
            value={dateRange.start} 
            onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))} 
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input 
            type="date" 
            value={dateRange.end} 
            onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))} 
          />
        </div>
      </div>
      
      <button 
        onClick={handleExport} 
        disabled={downloading}
        style={{
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          fontWeight: '600',
          cursor: downloading ? 'not-allowed' : 'pointer',
          opacity: downloading ? 0.7 : 1,
          marginBottom: '1rem'
        }}
      >
        {downloading ? 'Exporting...' : 'Export Data'}
      </button>
      
      {progress > 0 && progress < 100 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            width: '100%', 
            background: '#e5e7eb', 
            borderRadius: '4px', 
            height: '8px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                background: '#3b82f6', 
                height: '100%', 
                width: `${progress}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}
      
      {status && (
        <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          {status}
        </div>
      )}
      
      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}
      
      {fileUrl && (
        <a 
          href={fileUrl} 
          download={`${exportType}-export.csv`}
          style={{
            display: 'inline-block',
            background: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: '600'
          }}
        >
          📥 Download CSV
        </a>
      )}
    </div>
  );
};

// --- Cashier Settings ---
const CashierSettings: React.FC<{ user: any }> = ({ user }) => {
  const { settings, setSettings } = useSettings();
  const [sound, setSound] = useState(() => localStorage.getItem('orderSound') !== 'false');
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const val = localStorage.getItem('orderAutoRefresh');
    return val ? val === 'true' : true;
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return localStorage.getItem('orderRefreshInterval') || '10';
  });
  const [profile, setProfile] = useState({
    name: user?.username || '',
    email: user?.email || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Sound toggle
  const handleSound = (v: boolean) => {
    setSound(v);
    localStorage.setItem('orderSound', v.toString());
  };
  // Auto-refresh toggle
  const handleAutoRefresh = (v: boolean) => {
    setAutoRefresh(v);
    localStorage.setItem('orderAutoRefresh', v.toString());
  };
  // Refresh interval
  const handleInterval = (v: string) => {
    setRefreshInterval(v);
    localStorage.setItem('orderRefreshInterval', v);
  };
  // Display mode
  const handleTheme = (theme: 'light' | 'dark') => {
    setSettings(s => ({ ...s, theme }));
  };
  // Profile update
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        username: profile.name,
        email: profile.email,
      };      if (profile.password) payload.password = profile.password;
      await updateCurrentUser(payload);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Cashier Settings</h1>
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Order Notifications</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <input type="checkbox" checked={sound} onChange={e => handleSound(e.target.checked)} />
          Play sound for new orders
        </label>
      </div>
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Order Queue Display</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <input type="checkbox" checked={autoRefresh} onChange={e => handleAutoRefresh(e.target.checked)} />
          Auto-refresh order queue
        </label>
        {autoRefresh && (
          <div style={{ marginLeft: 24, marginBottom: 12 }}>
            <label>
              Refresh interval (seconds):
              <input type="number" min={5} max={60} step={1} value={refreshInterval} onChange={e => handleInterval(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
            </label>
          </div>
        )}
      </div>
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Display Mode</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="radio" name="theme" checked={settings.theme === 'light'} onChange={() => handleTheme('light')} /> Light
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="radio" name="theme" checked={settings.theme === 'dark'} onChange={() => handleTheme('dark')} /> Dark
        </label>
      </div>
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Personal Info</h2>
        <form onSubmit={handleProfileSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
            <input name="name" value={profile.name} onChange={handleProfileChange} placeholder="Name" required />
            <input name="email" type="email" value={profile.email} onChange={handleProfileChange} placeholder="Email" required />
            <input name="password" type="password" value={profile.password} onChange={handleProfileChange} placeholder="New Password (optional)" />
          </div>
          <button type="submit" disabled={saving} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {msg && <span style={{ marginLeft: 16, color: msg.includes('updated') ? '#10b981' : '#ef4444', fontWeight: 500 }}>{msg}</span>}
        </form>
      </div>
    </div>  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ChefSettings: React.FC<{ user: any }> = ({ user }) => {
  const { settings, setSettings } = useSettings();
  const [sound, setSound] = useState(() => localStorage.getItem('orderSound') !== 'false');
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const val = localStorage.getItem('orderAutoRefresh');
    return val ? val === 'true' : true;
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return localStorage.getItem('orderRefreshInterval') || '10';
  });
  const [profile, setProfile] = useState({
    name: user?.username || '',
    email: user?.email || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSound = (v: boolean) => {
    setSound(v);
    localStorage.setItem('orderSound', v.toString());
  };

  const handleAutoRefresh = (v: boolean) => {
    setAutoRefresh(v);
    localStorage.setItem('orderAutoRefresh', v.toString());
  };

  const handleInterval = (v: string) => {
    setRefreshInterval(v);
    localStorage.setItem('orderRefreshInterval', v);
  };

  const handleTheme = (theme: 'light' | 'dark') => {
    setSettings(s => ({ ...s, theme }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        username: profile.name,
        email: profile.email,
      };
      if (profile.password) payload.password = profile.password;
      await updateCurrentUser(payload);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Chef Settings</h1>
      
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Order Notifications</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <input type="checkbox" checked={sound} onChange={e => handleSound(e.target.checked)} />
          Play sound for new orders
        </label>
      </div>

      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Order Queue Display</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <input type="checkbox" checked={autoRefresh} onChange={e => handleAutoRefresh(e.target.checked)} />
          Auto-refresh order queue
        </label>
        {autoRefresh && (
          <div style={{ marginLeft: 24, marginBottom: 12 }}>
            <label>
              Refresh interval (seconds):
              <input type="number" min={5} max={60} step={1} value={refreshInterval} onChange={e => handleInterval(e.target.value)} style={{ marginLeft: 8, width: 60 }} />
            </label>
          </div>
        )}
      </div>

      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Display Mode</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <input type="radio" name="theme" checked={settings.theme === 'light'} onChange={() => handleTheme('light')} /> Light
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="radio" name="theme" checked={settings.theme === 'dark'} onChange={() => handleTheme('dark')} /> Dark
        </label>
      </div>

      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16 }}>Personal Info</h2>
        <form onSubmit={handleProfileSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
            <input name="name" value={profile.name} onChange={handleProfileChange} placeholder="Name" required />
            <input name="email" type="email" value={profile.email} onChange={handleProfileChange} placeholder="Email" required />
            <input name="password" type="password" value={profile.password} onChange={handleProfileChange} placeholder="New Password (optional)" />
          </div>
          <button type="submit" disabled={saving} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {msg && <span style={{ marginLeft: 16, color: msg.includes('updated') ? '#10b981' : '#ef4444', fontWeight: 500 }}>{msg}</span>}
        </form>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#6b7280' }}>You must be logged in to view settings.</p>
      </div>
    );
  }  if (user.role === 'CASHIER') {
    return <CashierSettings user={user} />;
  }
  
  if (user.role === 'CHEF') {
    return <ChefSettings user={user} />;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
          Settings
        </h1>
        <p style={{ color: '#6b7280' }}>Manage your account, users, and system preferences</p>
      </div>

      {/* Account Settings */}
      <AdminCard title="Account Settings" icon="👤" color="blue">
        <AccountSettingsForm user={user} onUpdate={() => {}} />
      </AdminCard>      {/* User Management - Admin only */}
      {(user.role === 'ADMIN' || user.role === 'GENERAL_MANAGER') && (
        <AdminCard title="User Management" icon="👥" color="green">
          <ManageRoles />
        </AdminCard>
      )}

      {/* System Preferences */}
      <AdminCard title="System Preferences" icon="⚙️" color="purple">
        <SystemPreferences />
      </AdminCard>

      {/* Data Export - Admin only */}
      {(user.role === 'ADMIN' || user.role === 'GENERAL_MANAGER') && (
        <AdminCard title="Data Export" icon="📊" color="orange">
          <DataExport />
        </AdminCard>
      )}
    </div>
  );
};

export default Settings;
