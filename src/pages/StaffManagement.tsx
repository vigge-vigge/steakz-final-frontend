import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';
import { StaffMember, Role, Branch } from '../types';
import { createStaffMember } from '../services/api';
import AdminCard from '../components/admin/AdminCard';
import '../components/admin/AdminCard.css';

const StaffManagement: React.FC = () => {
  const { user, hasPermission } = useContext(AuthContext);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CHEF' as Role,
    branchId: undefined as number | undefined,
  });  const canCreateStaff = hasPermission(['ADMIN', 'GENERAL_MANAGER', 'BRANCH_MANAGER']);
  const canEditStaff = hasPermission(['ADMIN', 'GENERAL_MANAGER', 'BRANCH_MANAGER']);
  const canDeleteStaff = hasPermission(['ADMIN', 'GENERAL_MANAGER', 'BRANCH_MANAGER']);const loadStaff = useCallback(async () => {
    try {      setLoading(true);
      setError('');
      
      if (!user) {
        setError('User not authenticated');
        return;
      }
      
      if (user.role === 'ADMIN') {
        // Admin can see all users
        const response = await api.getAllUsers(1, 100);
        setStaff(response.users.map(u => ({
          ...u,
          branch: u.branch && typeof u.branch.name === 'string' ? { 
            ...u.branch, 
            id: u.branchId ?? 0, 
            address: '', 
            phone: '', 
            managerId: 0, 
            createdAt: '', 
            updatedAt: '' 
          } : undefined
        })));
      } else if (user.role === 'GENERAL_MANAGER') {
        // General managers can see all staff members
        const response = await api.getStaffMembers();
        setStaff(response.data.staff);      } else if (user.role === 'BRANCH_MANAGER') {
        // Branch managers see only their branch's staff
        const response = await api.getStaffMembers(user.branchId);
        // Extra frontend filtering to ensure only branch staff are shown
        const filteredStaff = response.data.staff.filter(staff => 
          staff.branchId === user.branchId && staff.branchId !== null && staff.branchId !== undefined
        );
        setStaff(filteredStaff);
      } else {
        // Other roles (chef, cashier) see only their branch's staff
        const response = await api.getStaffMembers(user.branchId);
        // Extra filtering for non-admin roles to ensure branch consistency
        const filteredStaff = response.data.staff.filter(staff => 
          staff.branchId === user.branchId && staff.branchId !== null && staff.branchId !== undefined
        );
        setStaff(filteredStaff);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading staff');
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.branchId, user]);

  useEffect(() => {
    loadStaff();
    if (hasPermission(['ADMIN', 'GENERAL_MANAGER'])) {
      api.getBranches().then(res => setBranches(res.data)).catch(() => setBranches([]));
    }
  }, [hasPermission, loadStaff]);
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      
      // For branch managers, automatically set their branch
      const branchId = user?.role === 'BRANCH_MANAGER' ? user.branchId : formData.branchId;
      
      await createStaffMember({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        branchId: branchId,
      });
      
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'CHEF',
        branchId: undefined,
      });
      setShowCreateForm(false);
      setSuccess('Staff member created successfully!');
      loadStaff();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating staff member');
    }
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    try {
      setError('');
      
      // For branch managers, automatically set their branch
      const branchId = user?.role === 'BRANCH_MANAGER' ? user.branchId : formData.branchId;
      
      await api.updateStaffMember(editingStaff.id, {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        branchId: branchId,
      });
      
      setEditingStaff(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'CHEF',
        branchId: undefined,
      });
      setSuccess('Staff member updated successfully!');
      loadStaff();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating staff member');
    }
  };
  const handleDelete = async (id: number) => {
    // Find the staff member to check branch access
    const staffMember = staff.find(s => s.id === id);
    if (user?.role === 'BRANCH_MANAGER' && staffMember?.branchId !== user.branchId) {
      setError('You can only delete staff from your own branch');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    
    try {
      setError('');
      await api.deleteStaffMember(id);
      setSuccess('Staff member deleted successfully!');
      loadStaff();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting staff member');
    }
  };
  const startEdit = (staffMember: StaffMember) => {
    // Branch managers can only edit staff from their own branch
    if (user?.role === 'BRANCH_MANAGER' && staffMember.branchId !== user.branchId) {
      setError('You can only edit staff from your own branch');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setEditingStaff(staffMember);
    setFormData({
      username: staffMember.username,
      email: staffMember.email,
      password: '',
      role: staffMember.role,
      branchId: staffMember.branchId || undefined,
    });
    setShowCreateForm(false);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'CHEF',
      branchId: undefined,
    });
    setShowCreateForm(false);
    setEditingStaff(null);
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'ADMIN': return '#9f7aea';
      case 'GENERAL_MANAGER': return '#ed8936';
      case 'BRANCH_MANAGER': return '#4299e1';
      case 'CHEF': return '#48bb78';
      case 'CASHIER': return '#38b2ac';
      default: return '#6b7280';
    }
  };

  const getStaffStats = () => {
    const roleCount = staff.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<Role, number>);

    return {
      total: staff.length,
      roleCount,
      byBranch: staff.reduce((acc, member) => {
        const branchName = member.branch?.name || 'No Branch';
        acc[branchName] = (acc[branchName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  const stats = getStaffStats();

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <AdminCard title="Loading Staff..." icon="⏳" color="blue">
          <div className="loading">Loading staff members...</div>
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
          <span style={{ fontSize: '2.5rem' }}>👥</span>
          Staff Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>
          Manage your team members and their roles across all restaurant branches
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

      {/* Staff Statistics */}
      <div className="admin-cards-grid">
        <AdminCard title="Staff Overview" icon="📊" color="blue">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb' }}>{stats.total}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Total Staff</div>
            </div>
            {Object.entries(stats.roleCount).map(([role, count]) => (
              <div key={role} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.8)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: getRoleColor(role as Role) }}>{count}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'capitalize' }}>
                  {role.replace('_', ' ').toLowerCase()}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {user?.role === 'ADMIN' && (
          <AdminCard title="Branch Distribution" icon="🏪" color="purple">
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {Object.entries(stats.byBranch).map(([branch, count]) => (
                <div key={branch} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>{branch}</span>
                  <span style={{ 
                    background: '#9f7aea', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>{count}</span>
                </div>
              ))}
            </div>
          </AdminCard>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingStaff) && (
        <AdminCard 
          title={editingStaff ? "Edit Staff Member" : "Add New Staff Member"} 
          icon={editingStaff ? "✏️" : "➕"} 
          color={editingStaff ? "orange" : "green"}
          headerActions={
            <button className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          }
        >
          <form onSubmit={editingStaff ? handleEditSubmit : handleCreateSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              {!editingStaff && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role, branchId: undefined })}
                  required
                >
                  <option value="CHEF">Chef</option>
                  <option value="CASHIER">Cashier</option>
                  {user?.role !== 'BRANCH_MANAGER' && (
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                  )}
                  {hasPermission(['ADMIN']) && (
                    <>
                      <option value="GENERAL_MANAGER">General Manager</option>
                      <option value="ADMIN">Admin</option>
                    </>
                  )}
                </select>
              </div>{(formData.role === 'BRANCH_MANAGER' || formData.role === 'CHEF' || formData.role === 'CASHIER') && 
               branches.length > 0 && 
               user?.role !== 'BRANCH_MANAGER' && (
                <div className="form-group">
                  <label>Branch</label>
                  <select
                    value={formData.branchId ?? ''}
                    onChange={e => setFormData({ ...formData, branchId: e.target.value ? Number(e.target.value) : undefined })}
                    required
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {user?.role === 'BRANCH_MANAGER' && (formData.role === 'BRANCH_MANAGER' || formData.role === 'CHEF' || formData.role === 'CASHIER') && (
                <div className="form-group">
                  <label>Branch</label>
                  <input
                    type="text"
                    value={user.branch?.name || `Branch ${user.branchId}`}
                    disabled
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Staff will be assigned to your branch
                  </small>
                </div>
              )}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingStaff ? '💾 Update Staff Member' : '✨ Create Staff Member'}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Add Staff Button */}
      {canCreateStaff && !showCreateForm && !editingStaff && (
        <AdminCard title="Quick Actions" icon="⚡" color="teal">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Add New Staff Member
          </button>
        </AdminCard>
      )}

      {/* Staff List */}
      <AdminCard 
        title="Staff Members" 
        icon="👥" 
        color="blue"
        headerActions={
          <button className="btn btn-outline" onClick={loadStaff}>
            🔄 Refresh
          </button>
        }
      >
        {staff.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>No staff members found</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add your first team member to get started</div>
          </div>
        ) : (
          <div className="data-table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: getRoleColor(member.role),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600' }}>{member.username}</span>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: getRoleColor(member.role),
                        color: 'white'
                      }}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{member.branch?.name || 'No branch'}</td>                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {canEditStaff && 
                         (user?.role !== 'BRANCH_MANAGER' || member.branchId === user.branchId) && (
                          <button
                            className="btn btn-outline"
                            onClick={() => startEdit(member)}
                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                          >
                            ✏️
                          </button>
                        )}
                        {canDeleteStaff && 
                         member.id !== user?.id && 
                         (user?.role !== 'BRANCH_MANAGER' || member.branchId === user.branchId) && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(member.id)}
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

export default StaffManagement;
