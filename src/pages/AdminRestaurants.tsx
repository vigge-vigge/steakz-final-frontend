import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface Branch {
  id: number;
  name: string;
  address: string;
  manager: { id: number; username: string };
  staff: Array<{ id: number }>;

  status?: string;
}

export default function DeprecatedAdminRestaurants() {
  return null;
}

/* const AdminRestaurants: React.FC = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    setLoading(true);
    fetch('/api/restaurants', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setBranches(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600 text-center mt-8">Fel: {error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Restauranger</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Namn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chef</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {branches.map((branch) => (
              <tr key={branch.id}>
                <td className="px-6 py-4 whitespace-nowrap">{branch.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{branch.address}</td>
                <td className="px-6 py-4 whitespace-nowrap">{branch.manager?.username || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{branch.staff.length}</td>
                <td className="px-6 py-4 whitespace-nowrap">{branch.status === 'inactive' ? <span className="text-red-500">Inaktiv</span> : <span className="text-green-600">Aktiv</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; */
