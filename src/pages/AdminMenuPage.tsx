import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminMenuManagement from './AdminMenuManagement';
import { useNavigate } from 'react-router-dom';

const AdminMenuPage: React.FC = () => {
  const { user, hasPermission } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user || !hasPermission(['ADMIN'])) {
    navigate('/');
    return null;
  }

  return <AdminMenuManagement />;
};

export default AdminMenuPage;
