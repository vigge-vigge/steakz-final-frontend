import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, getTranslation } from '../utils/formatCurrency';
import api from '../services/api';

// Minimal icon SVGs for dashboard (all icons now w-4 h-4 and align-middle)
const ReviewIcon = () => (
  <svg className="w-4 h-4 text-primary-600 align-middle" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 10h8M8 14h5"/></svg>
);
const StarIcon = () => (
  <svg className="w-4 h-4 text-yellow-400 align-middle" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
);
const NPSIcon = () => (
  <svg className="w-4 h-4 text-green-500 align-middle" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
);
const SmileIcon = () => (
  <svg className="w-4 h-4 text-blue-500 align-middle" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/></svg>
);
const UserIcon = () => (
  <svg className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 align-middle" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z"/></svg>
);

interface FeedbackData {
  id: string;
  customerName: string;
  branchName: string;
  rating: number;
  comment: string;
  category: 'food' | 'service' | 'ambiance' | 'cleanliness' | 'delivery';
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
}

interface DashboardStats {
  totalFeedback: number;
  averageRating: number;
  npsScore: number;
  satisfactionRate: number;
  pendingIssues: number;
  resolvedToday: number;
}

const CustomerFeedback = () => {
  const { language, currency } = useContext(AuthContext);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFeedback: 0,
    averageRating: 0,
    npsScore: 0,
    satisfactionRate: 0,
    pendingIssues: 0,
    resolvedToday: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  // Real-time data fetching from backend
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoading(true);
        let feedbackResponse;
        try {
          feedbackResponse = await api.get('/api/branch-dashboard/customer-feedback');
        } catch (err) {
          feedbackResponse = { data: [] };
        }
        let statsResponse;
        try {
          statsResponse = await api.get('/api/branch-dashboard/feedback/stats');
        } catch (err) {
          statsResponse = { data: {
            totalFeedback: 0,
            averageRating: 0,
            npsScore: 0,
            satisfactionRate: 0,
            pendingIssues: 0,
            resolvedToday: 0
          }};
        }
        if (feedbackResponse.data) {
          setFeedbacks(feedbackResponse.data);
        }
        if (statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching feedback data:', error);
        
        // Fallback to mock data if API fails
        const mockFeedbacks: FeedbackData[] = [
          {
            id: '1',
            customerName: 'John Smith',
            branchName: 'Downtown Branch',
            rating: 5,
            comment: 'Excellent service and amazing food quality! The staff was very friendly.',
            category: 'service',
            status: 'reviewed',
            createdAt: '2024-01-15T10:30:00Z',
            priority: 'low'
          },
          {
            id: '2',
            customerName: 'Sarah Johnson',
            branchName: 'Mall Branch',
            rating: 2,
            comment: 'Food was cold when delivered and took way too long. Very disappointed.',
            category: 'delivery',
            status: 'pending',
            createdAt: '2024-01-15T14:20:00Z',
            priority: 'high'
          },
          {
            id: '3',
            customerName: 'Mike Chen',
            branchName: 'Airport Branch',
            rating: 4,
            comment: 'Good food but the restaurant was quite noisy. Could improve ambiance.',
            category: 'ambiance',
            status: 'pending',
            createdAt: '2024-01-15T16:45:00Z',
            priority: 'medium'
          },
          {
            id: '4',
            customerName: 'Emily Davis',
            branchName: 'Downtown Branch',
            rating: 5,
            comment: 'Perfect experience! Clean environment and delicious food.',
            category: 'cleanliness',
            status: 'resolved',
            createdAt: '2024-01-15T12:15:00Z',
            priority: 'low'
          },
          {
            id: '5',
            customerName: 'Robert Wilson',
            branchName: 'Mall Branch',
            rating: 1,
            comment: 'Worst experience ever. Food was undercooked and staff was rude.',
            category: 'food',
            status: 'pending',
            createdAt: '2024-01-15T18:00:00Z',
            priority: 'high'
          }
        ];

        const mockStats: DashboardStats = {
          totalFeedback: 156,
          averageRating: 4.2,
          npsScore: 73,
          satisfactionRate: 87.5,
          pendingIssues: 12,
          resolvedToday: 8
        };

        setFeedbacks(mockFeedbacks);
        setStats(mockStats);      } finally {
        setLoading(false);
      }
    };
    fetchFeedbackData();
    // Removed all auto-refresh intervals
  }, []);

  // Ensure actions update backend and customer view
  const handleAssignFeedback = async (feedbackId: string | number, branchManager: string) => {
    try {
      const id = typeof feedbackId === 'string' ? parseInt(feedbackId, 10) : feedbackId;
      console.log(`Frontend: Assigning feedback ${id} to ${branchManager}`);
      const response = await api.put(`/api/branch-dashboard/feedback/${id}/assign`, { assignedTo: branchManager });
      console.log('Assignment response:', response.data);
      // Always fetch from backend to ensure persistence
      const feedbackResponse = await api.get('/api/branch-dashboard/customer-feedback');
      if (feedbackResponse.data) {
        console.log('Refreshed feedback data:', feedbackResponse.data);
        setFeedbacks(feedbackResponse.data);
      }
    } catch (error) {
      console.error('Error assigning feedback:', error);
      setFeedbacks(prev => prev.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, assignedTo: branchManager, status: 'reviewed' as const }
          : feedback
      ));    }
  };

  const handleStatusChange = async (feedbackId: string | number, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    try {
      const id = typeof feedbackId === 'string' ? parseInt(feedbackId, 10) : feedbackId;
      console.log(`Frontend: Updating feedback ${id} status to ${newStatus}`);
      const response = await api.put(`/api/branch-dashboard/feedback/${id}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      // Always fetch from backend to ensure persistence
      const feedbackResponse = await api.get('/api/branch-dashboard/customer-feedback');
      if (feedbackResponse.data) {
        console.log('Refreshed feedback data:', feedbackResponse.data);
        setFeedbacks(feedbackResponse.data);
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      setFeedbacks(prev => prev.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, status: newStatus }
          : feedback
      ));
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesCategory = selectedCategory === 'all' || feedback.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || feedback.status === selectedStatus;
    const matchesSearch = feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer feedback...</p>
        </div>
      </div>
    );
  }  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}><ReviewIcon /><span>Customer Feedback</span></h1>          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '4px'
          }}>Monitor and manage customer reviews and satisfaction across all branches</p>
        </div>
        <div>
          <button style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>Add New Review</button>
        </div>
      </div>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <ReviewIcon />
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px'
          }}>Total Reviews</span>
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginTop: '4px'
          }}>{stats.totalFeedback}</span>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <StarIcon />
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px'
          }}>Avg Rating</span>
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginTop: '4px'
          }}>{stats.averageRating}/5</span>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <NPSIcon />
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px'
          }}>NPS Score</span>
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginTop: '4px'
          }}>{stats.npsScore}</span>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <SmileIcon />
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px'
          }}>Satisfaction</span>
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginTop: '4px'
          }}>{stats.satisfactionRate}%</span>
        </div>
      </div>
      {/* Main Content */}
      <div style={{
        display: 'flex',
        gap: '32px',
        alignItems: 'flex-start'
      }}>
        <div style={{
          flex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          {/* Chart Placeholder */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827'
              }}>Reviews</span>
              <select style={{
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}>
                <option>Past 6 Months</option>
                <option>Past 12 Months</option>
              </select>
            </div>
            <div style={{ height: '256px', padding: '16px' }}>
              {/* Reviews Chart */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>Rating Distribution</div>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>Last 6 months</div>
              </div>
              
              {/* Simple Bar Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = feedbacks.filter(f => f.rating === rating).length;
                  const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                  return (
                    <div key={rating} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: '48px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>{rating}</span>
                        <StarIcon />
                      </div>
                      <div style={{
                        flex: 1,
                        backgroundColor: '#e5e7eb',
                        borderRadius: '9999px',
                        height: '8px'
                      }}>
                        <div style={{
                          backgroundColor: '#fbbf24',
                          height: '8px',
                          borderRadius: '9999px',
                          transition: 'all 0.3s ease',
                          width: `${percentage}%`
                        }}></div>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        width: '32px'
                      }}>{count}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Summary Stats */}
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#6b7280' }}>Total Reviews: {feedbacks.length}</span>
                  <span style={{ color: '#6b7280' }}>Avg Rating: {feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : '0.0'}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Recent Reviews Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827'
              }}>Recent Reviews</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}>
                  <option>Past 1 Month</option>
                  <option>Past 3 Months</option>
                </select>
                <button
                  style={{
                    fontSize: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer'
                  }}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const feedbackResponse = await api.get('/api/branch-dashboard/customer-feedback');
                      if (feedbackResponse.data) setFeedbacks(feedbackResponse.data);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Refresh
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredFeedbacks.slice(0, 5).map((feedback) => (
                <div key={feedback.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f1f5'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <UserIcon />
                    <span style={{ fontWeight: '500' }}>{feedback.customerName}</span>
                  </div>
                  <span style={{ color: '#374151' }}>{feedback.branchName}</span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#fbbf24',
                    fontWeight: '600'
                  }}><StarIcon />{feedback.rating}</span>
                  <span style={{
                    color: '#374151',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{feedback.comment}</span>
                  <span style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    borderRadius: '9999px',
                    border: '1px solid'
                  }} className={getStatusColor(feedback.status)}>{feedback.status.toUpperCase()}</span>
                  <div>
                    {feedback.status === 'pending' && !feedback.assignedTo && (
                      <button onClick={async () => {
                        try {
                          await handleAssignFeedback(feedback.id, 'Branch Manager');
                        } catch {}
                      }} style={{
                        fontSize: '12px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        marginRight: '4px',
                        cursor: 'pointer'
                      }}>Assign</button>
                    )}
                    {feedback.status !== 'resolved' && (
                      <button onClick={async () => {
                        try {
                          await handleStatusChange(feedback.id, 'resolved');
                        } catch {}
                      }} style={{
                        fontSize: '12px',
                        backgroundColor: '#059669',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                      }}>Resolve</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>{/* Customer Reviews Cards (Bottom Section) */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            marginTop: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827'
              }}>Customer Reviews</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  fontSize: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}>Sort by</button>
                <button style={{
                  fontSize: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}>Filter</button>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {filteredFeedbacks.slice(0, 3).map((feedback) => (
                <div key={feedback.id} style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  padding: '20px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <UserIcon />
                    <span style={{
                      fontWeight: '500',
                      color: '#111827'
                    }}>{feedback.customerName}</span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginLeft: 'auto'
                    }}>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{
                    color: '#374151',
                    lineHeight: '1.5',
                    marginBottom: '12px'
                  }}>{feedback.comment}</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>Branch: {feedback.branchName}</span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}><StarIcon />{feedback.rating}/5</span>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '9999px',
                      border: '1px solid',
                      marginLeft: 'auto'
                    }} className={getStatusColor(feedback.status)}>{feedback.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedback;
