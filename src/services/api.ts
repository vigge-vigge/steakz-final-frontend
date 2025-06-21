import axios from 'axios';
import { 
  AuthResponse, Post, Comment, UsersResponse, User, Branch, MenuItem, Order, 
  InventoryItem, Role, StaffMember, OrderStatus, OrderWithDetails, MenuItemWithIngredients,
  Payment, PaymentMethod, SystemStatistics, RestaurantStatus, ActivityFeedItem,
  SystemAlert, FinancialData, SystemHealth, PerformanceAnalytics, CustomerFeedback
} from '../types';

// Base URL from the API documentation
const API_URL = 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const signup = async (
  username: string, 
  email: string, 
  password: string, 
  firstName?: string, 
  lastName?: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/signup', { 
    username, 
    email, 
    password, 
    firstName, 
    lastName 
  });
  return response.data;
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/request-reset', { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

// Post APIs
export const getAllPosts = async (): Promise<Post[]> => {
  const response = await api.get('/api/posts');
  return response.data;
};

export const createPost = async (title: string, content: string): Promise<Post> => {
  const response = await api.post('/api/posts', { title, content });
  return response.data;
};

// Delete a post by ID
export const deletePost = async (postId: number): Promise<void> => {
  await api.delete(`/api/posts/${postId}`);
};

// Comment APIs
export const createComment = async (content: string, postId: number, userName?: string): Promise<Comment> => {
  const response = await api.post('/api/comments', { content, postId, userName });
  return response.data;
};

// Review APIs (using posts as general reviews)
export const createReview = async (content: string, rating: number, title: string = 'Customer Review'): Promise<Post> => {
  const response = await api.post('/api/posts', { title, content, rating });
  return response.data;
};

export const getReviews = async (): Promise<Post[]> => {
  const response = await api.get('/api/posts');
  return response.data;
};

// Admin APIs
export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<UsersResponse> => {
  const response = await api.get(`/api/users?page=${page}&limit=${limit}`);
  return response.data;
};

// Get posts for the logged-in user
export const getMyPosts = async (): Promise<Post[]> => {
  const response = await api.get('/api/posts/my');
  return response.data;
};

// Staff management endpoints
export const createStaffMember = (data: {
  username: string;
  email: string;
  password: string;
  role: Role;
  branchId?: number;
}) => api.post<User>('/api/staff', data);

export const getStaffMembers = (branchId?: number) =>
  api.get<{ staff: StaffMember[] }>('/api/staff', { params: { branchId } });

export const updateStaffMember = (id: number, data: {
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
  branchId?: number;
}) => api.put<User>(`/api/staff/${id}`, data);

export const deleteStaffMember = (id: number) =>
  api.delete(`/api/staff/${id}`);

// Branch management endpoints
export const getBranches = () => api.get<Branch[]>('/api/branches');

// Public version of getBranches that doesn't require authentication
export const getBranchesPublic = () => {
  return axios.get<Branch[]>(`${API_URL}/api/branches/public`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createBranch = (data: {
  name: string;
  address: string;
  phone: string;
  managerId?: number;
}) => api.post<Branch>('/api/branches', data);

export const updateBranch = (id: number, data: Partial<Branch>) =>
  api.put<Branch>(`/api/branches/${id}`, data);

export const deleteBranch = (id: number) =>
  api.delete(`/api/branches/${id}`);

// Menu management endpoints
export const getMenuItems = (branchId?: number) =>
  api.get<MenuItemWithIngredients[]>('/api/menu-items', { params: { branchId } });

export const createMenuItem = (data: {
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: number[];
}) => api.post<MenuItem>('/api/menu-items', data);

export const updateMenuItem = (id: number, data: {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  isAvailable?: boolean;
  ingredients?: number[];
}) => api.put<MenuItem>(`/api/menu-items/${id}`, data);

export const deleteMenuItem = (id: number) =>
  api.delete(`/api/menu-items/${id}`);

// Inventory management endpoints
export const getInventory = (branchId?: number) => {
  const params = branchId ? { branchId } : {};
  return api.get<InventoryItem[]>('/api/inventory', { params });
};

export const updateInventoryItem = (id: number, data: {
  quantity: number;
  minThreshold?: number;
}) => api.put<InventoryItem>(`/api/inventory/${id}`, data);

// Order management endpoints
export const createOrder = (data: {
  branchId: number;
  items: { menuItemId: number; quantity: number; }[];
  deliveryAddress: string;
}) => api.post<Order>('/api/orders', data);

export const getOrders = (params?: {
  branchId?: number;
  status?: OrderStatus;
  customerId?: number;
}) => api.get<OrderWithDetails[]>('/api/orders', { params });

export const updateOrderStatus = (id: number, status: OrderStatus) =>
  api.patch<Order>(`/api/orders/${id}/status`, { status });

// Payment endpoints
export const processPayment = (orderId: number, data: {
  amount: number;
  method: PaymentMethod;
}) => api.post<Payment>(`/api/payments/${orderId}`, data);

export const reprintReceipt = (paymentId: number) =>
  api.post<any>(`/api/payments/${paymentId}/reprint`);

export const emailReceipt = (paymentId: number, email: string) =>
  api.post<any>(`/api/payments/${paymentId}/email`, { email });

// Receipt endpoints
export const createReceipt = (data: {
  orderId: number;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
}) => api.post<any>('/api/receipts', data);

export const getReceipts = (params?: {
  branchId?: number;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}) => api.get<any[]>('/api/receipts', { params });

export const getReceiptById = (id: number) =>
  api.get<any>(`/api/receipts/${id}`);

export const getReceiptStatistics = (params?: {
  branchId?: number;
  startDate?: string;
  endDate?: string;
}) => api.get<any>('/api/receipts/statistics', { params });

// Update user profile (admin or self)
export const updateUser = (id: number, data: {
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
  branchId?: number;
}) => api.put<User>(`/api/users/${id}`, data);

// Change user role (admin only)
export const changeUserRole = (id: number, role: Role) =>
  api.patch<User>(`/api/users/${id}/role`, { role });

export const createUser = (data: {
  username: string;
  email: string;
  password: string;
  role: Role;
  branchId?: number;
}) => api.post<User>('/api/users', data);

// Data Export API
export const startDataExport = (payload: any) => api.post('/api/data-export/start', payload);
export const getExportStatus = (jobId: string) => api.get(`/api/data-export/status/${jobId}`);
export const downloadExportFile = (jobId: string) => api.get(`/api/data-export/download/${jobId}`, { responseType: 'blob' });

// Find closest branch by address
export const getClosestBranch = (payload: { address: string }) =>
  api.post<{ id: number; name: string; address: string }>('/api/branches/closest', payload);

// Admin Dashboard APIs
export const getSystemStatistics = () => api.get<SystemStatistics>('/api/admin-dashboard/statistics');

export const getRestaurantStatus = () => api.get<RestaurantStatus[]>('/api/admin-dashboard/restaurant-status');

export const getLiveOrderActivity = (limit?: number) => 
  api.get<OrderWithDetails[]>('/api/admin-dashboard/live-orders', { params: { limit } });

export const getFinancialData = (period?: number) => 
  api.get<FinancialData>('/api/admin-dashboard/financial', { params: { period } });

export const getSystemHealth = () => api.get<SystemHealth>('/api/admin-dashboard/health');

export const getActivityFeed = (limit?: number) => 
  api.get<ActivityFeedItem[]>('/api/admin-dashboard/activity', { params: { limit } });

export const getPerformanceAnalytics = (period?: number) => 
  api.get<PerformanceAnalytics>('/api/admin-dashboard/analytics', { params: { period } });

export const getSystemAlerts = () => api.get<SystemAlert[]>('/api/admin-dashboard/alerts');

export const performQuickAction = (action: string, data: any) => 
  api.post('/api/admin-dashboard/actions', { action, data });

// Category APIs
export const getCategories = () => api.get('/api/categories');
export const createCategory = (name: string) => api.post('/api/categories', { name });
export const updateCategory = (id: number, data: { name: string; order?: number }) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id: number) => api.delete(`/api/categories/${id}`);
export const reorderCategories = (order: { id: number; order: number }[]) => api.post('/api/categories/reorder', { order });

export const getCurrentUser = () => api.get<User>('/api/users/me');
export const updateCurrentUser = (data: {
  username?: string;
  email?: string;
  password?: string;
}) => api.put<User>('/api/users/me', data);

// Branch Dashboard APIs
export const getBranchDailySales = () => api.get('/api/branch-dashboard/daily-sales');
export const getBranchActiveOrders = () => api.get('/api/branch-dashboard/active-orders');
export const getBranchStaffOnShift = () => api.get('/api/branch-dashboard/staff-on-shift');
export const getBranchInventoryAlerts = () => api.get('/api/branch-dashboard/inventory-alerts');
export const getBranchCustomerFeedback = () => api.get('/api/branch-dashboard/customer-feedback');
export const getBranchWeeklyTrend = () => api.get('/api/branch-dashboard/weekly-trend');
export const getBranchMetrics = () => api.get('/api/branch-dashboard/metrics');

// Add reports API functions
export const getBranchSalesReport = (params?: { period?: string; startDate?: string; endDate?: string }) => 
  api.get('/api/branch-dashboard/reports/sales', { params });

export const getBranchStaffPerformance = (params?: { period?: string }) => 
  api.get('/api/branch-dashboard/reports/staff-performance', { params });

export const getBranchOrderAnalytics = (params?: { period?: string }) => 
  api.get('/api/branch-dashboard/reports/order-analytics', { params });

export const exportBranchReport = (params: { type: string; format?: string; period?: string }) => 
  api.get('/api/branch-dashboard/reports/export', { params });

export const getCustomerFeedback = async (): Promise<CustomerFeedback[]> => {
  const response = await api.get('/api/branch-dashboard/customer-feedback');
  return response.data;
};

export const getInventoryUsage = () => 
  api.get('/api/branch-dashboard/reports/inventory');

export default api;
