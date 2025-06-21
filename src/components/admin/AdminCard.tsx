import React, { ReactNode } from 'react';
import './AdminCard.css';

interface AdminCardProps {
  title: string;
  icon?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';
  className?: string;
}

const AdminCard: React.FC<AdminCardProps> = ({ 
  title, 
  icon, 
  children, 
  headerActions, 
  color = 'blue',
  className = ''
}) => {
  return (
    <div className={`admin-card ${color} ${className}`}>
      <div className="admin-card-header">
        <div className="admin-card-title">
          {icon && <span className="admin-card-icon">{icon}</span>}
          <h3>{title}</h3>
        </div>
        {headerActions && (
          <div className="admin-card-actions">
            {headerActions}
          </div>
        )}
      </div>
      <div className="admin-card-content">
        {children}
      </div>
    </div>
  );
};

export default AdminCard;
