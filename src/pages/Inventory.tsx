import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { InventoryItem } from '../types';
import * as api from '../services/api';

const Inventory: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { t } = useSettings();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');  const fetchInventory = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching inventory for user:', { id: user.id, role: user.role, branchId: user.branchId });
      
      // Use the user's branchId for the API call
      const response = await api.getInventory(user.branchId || undefined);
      
      console.log('Inventory API response:', response.data);
      setInventoryItems(response.data || []);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch inventory data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);
  const getFilteredItems = () => {
    switch (filter) {
      case 'low-stock':
        return inventoryItems.filter(item => item.quantity > 0 && item.quantity <= item.minThreshold);
      case 'out-of-stock':
        return inventoryItems.filter(item => item.quantity === 0);
      default:
        return inventoryItems;
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.minThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock': return '#ef4444';
      case 'low-stock': return '#f59e0b';
      default: return '#10b981';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-4">
            {t('loadingInventory')}
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-light text-red-600 mb-4">
            {error}
          </h2>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-2">
            {t('inventory')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('inventoryDescription')}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('allItems')} ({inventoryItems.length})
            </button>            <button
              onClick={() => setFilter('low-stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'low-stock'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('lowStock')} ({inventoryItems.filter(item => item.quantity > 0 && item.quantity <= item.minThreshold).length})
            </button>
            <button
              onClick={() => setFilter('out-of-stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'out-of-stock'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('outOfStock')} ({inventoryItems.filter(item => item.quantity === 0).length})
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('item')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('quantity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('lastUpdated')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                      </td>                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {/* Category field not available in backend InventoryItem */}
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: `${getStockStatusColor(status)}20`,
                            color: getStockStatusColor(status)
                          }}
                        >
                          {status === 'out-of-stock' && t('outOfStock')}
                          {status === 'low-stock' && t('lowStock')}
                          {status === 'in-stock' && t('inStock')}
                        </span>
                      </td>                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {/* lastUpdated field not available in backend InventoryItem */}
                        -
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' && t('noInventoryItems')}
              {filter === 'low-stock' && t('noLowStockItems')}
              {filter === 'out-of-stock' && t('noOutOfStockItems')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
