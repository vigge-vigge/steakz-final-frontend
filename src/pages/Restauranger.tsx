import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User } from '../types';
import AdminCard from '../components/admin/AdminCard';
import '../components/admin/AdminCard.css';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  manager: { username: string };
  staff: Array<{ id: number }>;
  status?: string;
}

interface BranchStats {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
  totalStaff: number;
}

const Restauranger: React.FC = () => {
  const { user, token } = useContext(AuthContext);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BranchStats>({
    totalBranches: 0,
    activeBranches: 0,
    inactiveBranches: 0,
    totalStaff: 0,
  });

  const calculateStats = useCallback((branchData: Branch[]) => {
    const totalBranches = branchData.length;
    const activeBranches = branchData.filter(b => b.status !== 'inactive').length;
    const inactiveBranches = totalBranches - activeBranches;
    const totalStaff = branchData.reduce((sum, branch) => sum + branch.staff.length, 0);

    setStats({
      totalBranches,
      activeBranches,
      inactiveBranches,
      totalStaff,
    });
  }, []);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    const apiUrl = '/api/branches';
    try {
      const res = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch branches');
      }

      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setBranches(data);
        calculateStats(data);
        setError(null);
      } else {
        const text = await res.text();
        setError('Server did not return JSON: ' + text);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, calculateStats]);
  useEffect(() => {
    fetchBranches();
    
    // Auto-refresh every 30 seconds to show newly created branches
    const interval = setInterval(() => {
      fetchBranches();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchBranches]);
  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>Restaurants</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>Restaurants</h1>
        </div>
        <div className="text-red-600 text-center mt-8">Error: {error}</div>
      </div>
    );
  }

  // Only show staff count and status for ADMIN and GENERAL_MANAGER
  const showAdminCols = user && (user.role === 'ADMIN' || user.role === 'GENERAL_MANAGER');

  return (
    <div className="admin-container">      <div className="admin-header">
        <h1>Restaurants</h1>
        <p>Manage restaurant branches and locations</p>
        <button 
          onClick={() => fetchBranches()} 
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            marginTop: '8px'
          }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        <AdminCard title="Total Restaurants" className="stat-card">
          <div className="stat-number">{stats.totalBranches}</div>
          <div className="stat-label">Active Locations</div>
        </AdminCard>

        <AdminCard title="Active Branches" className="stat-card">
          <div className="stat-number text-green-600">{stats.activeBranches}</div>
          <div className="stat-label">Currently Operating</div>
        </AdminCard>

        {showAdminCols && (
          <AdminCard title="Inactive Branches" className="stat-card">
            <div className="stat-number text-red-600">{stats.inactiveBranches}</div>
            <div className="stat-label">Temporarily Closed</div>
          </AdminCard>
        )}

        {showAdminCols && (
          <AdminCard title="Total Staff" className="stat-card">
            <div className="stat-number text-blue-600">{stats.totalStaff}</div>
            <div className="stat-label">Across All Branches</div>
          </AdminCard>
        )}
      </div>

      {/* Restaurant Cards */}
      <div className="admin-section">
        <AdminCard title="Restaurant Locations" className="full-width">
          {branches.length === 0 ? (
            <div className="empty-state">
              <p>No restaurants found.</p>
            </div>
          ) : (
            <div className="admin-grid">
              {branches.map(branch => (
                <AdminCard key={branch.id} title={branch.name} className="restaurant-card">
                  <div className="restaurant-info">
                    <div className="info-row">
                      <span className="info-label">📍 Address:</span>
                      <span className="info-value">{branch.address}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📞 Phone:</span>
                      <span className="info-value">{branch.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">👤 Manager:</span>
                      <span className="info-value">{branch.manager?.username || 'Not assigned'}</span>
                    </div>
                    {showAdminCols && (
                      <>
                        <div className="info-row">
                          <span className="info-label">👥 Staff Count:</span>
                          <span className="info-value">{branch.staff.length}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">🏪 Status:</span>
                          <span className={`status-badge ${branch.status === 'inactive' ? 'status-inactive' : 'status-active'}`}>
                            {branch.status === 'inactive' ? 'Inactive' : 'Active'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </AdminCard>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
};

export default Restauranger;
