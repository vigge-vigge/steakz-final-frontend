import React from 'react';
import { ActivityFeedItem } from '../../types';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  expanded?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, expanded = false }) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return '📋';
      case 'user': return '👤';
      case 'payment': return '💳';
      default: return '📄';
    }
  };

  const displayActivities = expanded ? activities : activities.slice(0, 8);

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>📊 Activity Feed</h2>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {displayActivities.map((activity) => (
          <div 
            key={activity.id} 
            style={{ 
              background: 'white', 
              padding: '1rem', 
              marginBottom: '0.5rem', 
              borderRadius: '8px',
              borderLeft: '4px solid #667eea'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{getActivityIcon(activity.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {activity.title}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {activity.description}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
            {activity.amount && (
              <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#38a169' }}>
                {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(activity.amount)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {!expanded && activities.length > 8 && (
        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
          Showing 8 of {activities.length} activities
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
