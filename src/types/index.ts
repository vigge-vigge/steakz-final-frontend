// Data models based on the Blog API documentation
export type Role = 'CUSTOMER' | 'CHEF' | 'CASHIER' | 'BRANCH_MANAGER' | 'GENERAL_MANAGER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  branchId?: number;
  branch?: { name: string }; // Added branch property for displaying branch name in settings
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: User;
  comments: Comment[];
  rating?: number; // Optional rating for posts
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId?: number;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  managerId: number;
  manager?: User;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  branchId: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  image?: string;
}

export interface MenuItemWithIngredients extends MenuItem {
  ingredients: InventoryItem[];
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  customerId: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
  deliveryAddress?: string; // Added for customer delivery orders
  items: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  orderId: number;
  menuItemId: number;
  menuItem: MenuItem;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_PAYMENT';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  orderId: number;
  createdAt: string;
  updatedAt: string;
}

// This type is used in the CashierDashboard and KitchenDashboard
export interface OrderWithDetails extends Order {
  items: (OrderItem & {
    menuItem: MenuItem;
  })[];
  customer: User;
  branch?: Branch;
}

export interface StaffMember extends User {
  branch?: Branch;
}

// Admin Dashboard Types
export interface SystemStatistics {
  totalActiveOrders?: number;
  system: {
    totalBranches: number;
    totalUsers: number;
    totalMenuItems: number;
    lowStockItems: number;
  };
  users: Record<string, number>;
  orders: {
    total: {
      today: number;
      week: number;
      month: number;
    };
    status: {
      pending: number;
      preparing: number;
      ready: number;
    };
  };
  revenue: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
}

export interface RestaurantStatus {
  id: number;
  name: string;
  address: string;
  phone: string;
  managerId: number;
  manager?: User;
  createdAt: string;
  updatedAt: string;
  metrics: {
    activeOrders: number;
    todayOrders: number;
    todayRevenue: number;
    lowStockItems: number;
    activeStaff: number;
    totalStaff: number;
    isOpen?: boolean;
  };
}

export interface ActivityFeedItem {
  id: string;
  type: 'order' | 'user' | 'payment' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  amount?: number;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'inventory' | 'payment' | 'orders' | 'system';
  title: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  branchId?: number;
}

export interface FinancialData {
  totalSalesToday?: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  branchRevenue: Array<{
    branchId: number;
    branchName: string;
    revenue: number;
  }>;
  paymentMethods: Array<{
    method: PaymentMethod;
    _count: number;
    _sum: { amount: number };
  }>;
  topItems: Array<{
    menuItemId: number;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export interface SystemHealth {
  database: {
    status: string;
    connectionCount: number;
    queryTime: number;
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
  application: {
    totalUsers: number;
    activeOrders: number;
    failedPaymentsToday: number;
    systemErrorsToday: number;
    averageResponseTime: number;
  };
}

// Branch Dashboard Types
export interface BranchDailySales {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  percentChange: number;
}

export interface BranchActiveOrder {
  id: number;
  customerName: string;
  status: string;
  items: number;
  total: number;
  timeRemaining: string;
}

export interface BranchStaffMember {
  id: number;
  name: string;
  role: string;
  shift: string;
  status: 'on_shift' | 'break' | 'off_shift';
}

export interface BranchInventoryAlert {
  id: number;
  itemName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical';
}

export interface BranchCustomerFeedback {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BranchWeeklyTrend {
  day: string;
  sales: number;
  orders: number;
}

export interface BranchMetrics {
  ordersToday: number;
  avgRating: number;
  staffOnShift: number;
  lowStockItems: number;
}

// Branch Reports Types
export interface SalesReport {
  period: { start: string; end: string };
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface StaffPerformance {
  period: { start: string; end: string };
  staffPerformance: Array<{
    id: number;
    name: string;
    role: string;
    ordersHandled: number;
    avgOrderTime: number;
    customerRating: string;
    workHours: number;
    efficiency: number;
  }>;
}

export interface OrderAnalytics {
  period: { start: string; end: string };
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    orders: number;
  }>;
  averageOrderValue: number;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
}

export interface PerformanceAnalytics {
  orderMetrics: {
    avgCompletionTime: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  branchPerformance: Array<{
    branchId: number;
    branchName: string;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  }>;
  peakHours: Array<{
    hour: number;
    orderCount: number;
    avgOrderValue: number;
  }>;
}

// Customer feedback for HQ dashboard and Home page
export interface CustomerFeedback {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

// TODO: Students - Add interfaces for error responses and other API responses as needed
// For example, you might need interfaces for post creation responses or user update responses
