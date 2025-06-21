import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Signup from './pages/Signup';
import Login from './pages/Login';
import CreatePost from './pages/CreatePost';
import MyPosts from './pages/MyPosts';
import MyOrders from './pages/MyOrders';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './pages/NotFound';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import './index.css';
import StaffManagement from './pages/StaffManagement';
import AdminRestaurants from './pages/AdminRestaurants';
import Restauranger from './pages/Restauranger';
import MenuPage from './pages/menu';
import Settings from './pages/Settings';
import AdminMenuPage from './pages/AdminMenuPage';
import CashierLayout from './pages/cashier/CashierLayout';
import CashierHome from './pages/cashier/CashierHome';
import CashierOrders from './pages/cashier/CashierOrders';
import CashierPOS from './pages/cashier/CashierPOS';
import CashierReceipts from './pages/cashier/CashierReceipts';
import CashierSettings from './pages/cashier/CashierSettings';
import BranchesPage from './pages/branches';
import Inventory from './pages/Inventory';
import ChefHome from './pages/chef/Home';
import ChefOrders from './pages/chef/ChefOrders';
import BranchReports from './pages/BranchReports';
import Reports from './pages/Reports';
import BranchPreferences from './pages/BranchPreferences';
import CustomerFeedback from './pages/CustomerFeedback';
import Cart from './pages/Cart';
import Orders from './pages/Orders';


const AppRoutes: React.FC = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <Routes>
      <Route path="/" element={user?.role === 'CASHIER' ? (
        <ProtectedRoute requiredRoles={['CASHIER']}>
          <CashierHome />
        </ProtectedRoute>
      ) : user?.role === 'CHEF' ? (
        <ProtectedRoute requiredRoles={['CHEF']}>
          <ChefHome />
        </ProtectedRoute>
      ) : user?.role === 'BRANCH_MANAGER' ? (
        <ProtectedRoute requiredRoles={['BRANCH_MANAGER']}>
          <Home />
        </ProtectedRoute>
      ) : <Home />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/staff" element={
        <ProtectedRoute requiredRoles={['ADMIN', 'GENERAL_MANAGER', 'BRANCH_MANAGER']}>
          <StaffManagement />
        </ProtectedRoute>
      } />
      <Route path="/create-post" element={
        <ProtectedRoute requiredRoles={['BRANCH_MANAGER', 'GENERAL_MANAGER', 'ADMIN']}>
          <CreatePost />
        </ProtectedRoute>
      } />
      <Route path="/my-posts" element={
        <ProtectedRoute requiredRoles={['BRANCH_MANAGER', 'GENERAL_MANAGER', 'ADMIN']}>
          <MyPosts />
        </ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <MyOrders />
        </ProtectedRoute>
      } />
      <Route path="/kitchen" element={
        <ProtectedRoute requiredRoles={['CHEF']}>
          <KitchenDashboard />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute requiredRoles={['CHEF', 'ADMIN', 'GENERAL_MANAGER', 'BRANCH_MANAGER']}>
          {user?.role === 'CHEF' ? <ChefOrders /> : <Orders />}
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute requiredRoles={['CHEF', 'ADMIN', 'GENERAL_MANAGER', 'BRANCH_MANAGER']}>
          <Inventory />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/request-reset" element={<RequestPasswordReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/restaurants" element={<AdminRestaurants />} />
      <Route path="/restauranger" element={<Restauranger />} />
      <Route path="/branches" element={<BranchesPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/cart" element={
        <ProtectedRoute requiredRoles={['CUSTOMER', 'CASHIER', 'BRANCH_MANAGER', 'GENERAL_MANAGER']}>
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={<Settings />} />
      <Route path="/admin/menu" element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <AdminMenuPage />
        </ProtectedRoute>
      } />
      <Route path="/cashier" element={
        <ProtectedRoute requiredRoles={['CASHIER']}>
          <CashierLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CashierHome />} />
        <Route path="home" element={<CashierHome />} />
        <Route path="orders" element={<CashierOrders />} />
        <Route path="pos" element={<CashierPOS />} />
        <Route path="receipts" element={<CashierReceipts />} />
        <Route path="settings" element={<CashierSettings />} />
      </Route>
      
      {/* Additional direct route for cashier receipts */}
      <Route path="/cashier/receipts" element={
        <ProtectedRoute requiredRoles={['CASHIER']}>
          <CashierReceipts />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute requiredRoles={['BRANCH_MANAGER', 'GENERAL_MANAGER', 'ADMIN']}>
          {user?.role === 'BRANCH_MANAGER' ? <BranchReports /> : <Reports />}
        </ProtectedRoute>
      } />
      <Route path="/branch-reports" element={
        <ProtectedRoute requiredRoles={['BRANCH_MANAGER']}>
          <BranchReports />
        </ProtectedRoute>
      } />
      <Route path="/branch/preferences" element={
        <ProtectedRoute requiredRoles={['BRANCH_MANAGER']}>
          <BranchPreferences />
        </ProtectedRoute>
      } />
      <Route path="/customer-feedback" element={
        <ProtectedRoute requiredRoles={['GENERAL_MANAGER', 'ADMIN']}>
          <CustomerFeedback />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <SettingsProvider>
            <Router>
              <Navbar />
              <AppRoutes />
            </Router>
          </SettingsProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

// TODO: Students - Complete the routing setup by:
// 1. Implementing the MyPosts page (/my-posts) to show the logged-in user's posts
// 2. Adding protected route logic to restrict access to certain routes based on user role
// 3. Adding a 404 page for invalid routes
