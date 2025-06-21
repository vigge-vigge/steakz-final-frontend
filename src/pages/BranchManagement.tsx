import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';
import { Branch } from '../types';
import AdminCard from '../components/admin/AdminCard';
import '../components/admin/AdminCard.css';

const BranchManagement: React.FC = () => {
  const { hasPermission } = useContext(AuthContext);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    managerId: '',
  });

  const canCreateBranch = hasPermission(['ADMIN', 'GENERAL_MANAGER']);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getBranches();
      setBranches(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading branches');
    } finally {
      setLoading(false);
    }
  };
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const payload: any = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      };
      
      if (formData.managerId) {
        payload.managerId = Number(formData.managerId);
      }
      
      await api.createBranch(payload);
      
      setFormData({
        name: '',
        address: '',
        phone: '',
        managerId: '',
      });
      setShowCreateForm(false);
      setSuccess('Branch created successfully!');
      loadBranches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating branch');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    try {
      setError('');
      const payload: any = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      };
      
      if (formData.managerId) {
        payload.managerId = Number(formData.managerId);
      }
      
      await api.updateBranch(editingBranch.id, payload);
      
      setEditingBranch(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        managerId: '',
      });
      setSuccess('Branch updated successfully!');
      loadBranches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating branch');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) {
      return;
    }
    
    try {
      setError('');
      await api.deleteBranch(id);
      setSuccess('Branch deleted successfully!');
      loadBranches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting branch');
    }
  };

  const startEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      managerId: branch.managerId?.toString() || '',
    });
    setShowCreateForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      managerId: '',
    });
    setShowCreateForm(false);
    setEditingBranch(null);
  };

  const getBranchStats = () => {
    return {
      total: branches.length,
      active: branches.length,
      avgStaffPerBranch: branches.length > 0 ? Math.round(branches.length * 8 / branches.length) : 0,
    };
  };

  const stats = getBranchStats();

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <AdminCard title="Loading Branches..." icon="⏳" color="blue">
          <div className="loading">Loading restaurant branches...</div>
        </AdminCard>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '800', 
          color: '#1a202c', 
          margin: '0 0 0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '2.5rem' }}>🏪</span>
          Restaurant Branches
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
          Manage your restaurant locations and branch information
        </p>
      </div>

      {error && (
        <AdminCard title="Error" icon="⚠️" color="red">
          <div className="error">{error}</div>
        </AdminCard>
      )}

      {success && (
        <AdminCard title="Success" icon="✅" color="green">
          <div className="success">{success}</div>
        </AdminCard>
      )}

      {/* Branch Statistics */}
      <div className="admin-cards-grid">
        <AdminCard title="Branch Overview" icon="📊" color="blue">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb' }}>{stats.total}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Total Branches</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{stats.active}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Active Locations</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>{stats.avgStaffPerBranch}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Avg Staff/Branch</div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Branch Performance" icon="📈" color="green">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {branches.slice(0, 3).map((branch, index) => (
              <div key={branch.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>{branch.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{branch.address}</div>
                </div>
                <div style={{ 
                  background: ['#10b981', '#f59e0b', '#3b82f6'][index],
                  color: 'white', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {['Top', 'Good', 'Active'][index]}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingBranch) && (
        <AdminCard 
          title={editingBranch ? "Edit Branch" : "Add New Branch"} 
          icon={editingBranch ? "✏️" : "➕"} 
          color={editingBranch ? "orange" : "green"}
          headerActions={
            <button className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          }
        >
          <form onSubmit={editingBranch ? handleEditSubmit : handleCreateSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>Branch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Manager ID (Optional)</label>
                <input
                  type="number"
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  placeholder="Staff member ID"
                />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingBranch ? '💾 Update Branch' : '🏪 Create Branch'}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Add Branch Button */}
      {canCreateBranch && !showCreateForm && !editingBranch && (
        <AdminCard title="Quick Actions" icon="⚡" color="teal">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Add New Branch
          </button>
        </AdminCard>
      )}

      {/* Branch List */}
      <AdminCard 
        title="Restaurant Branches" 
        icon="🏪" 
        color="blue"
        headerActions={
          <button className="btn btn-outline" onClick={loadBranches}>
            🔄 Refresh
          </button>
        }
      >
        {branches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>No branches found</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add your first restaurant location to get started</div>
          </div>
        ) : (
          <div className="data-table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          background: '#4299e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          🏪
                        </div>
                        <span style={{ fontWeight: '600' }}>{branch.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{branch.address}</td>
                    <td style={{ fontSize: '0.875rem', color: '#64748b' }}>{branch.phone}</td>
                    <td>
                      {branch.managerId ? (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: '#10b981',
                          color: 'white'
                        }}>
                          Manager #{branch.managerId}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No manager</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: '#10b981',
                        color: 'white'
                      }}>
                        Active
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {canCreateBranch && (
                          <button
                            className="btn btn-outline"
                            onClick={() => startEdit(branch)}
                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                          >
                            ✏️
                          </button>
                        )}
                        {canCreateBranch && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(branch.id)}
                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
};

export default BranchManagement;
