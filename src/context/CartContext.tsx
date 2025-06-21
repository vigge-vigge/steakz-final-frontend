import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { createOrder, createReceipt } from '../services/api';
import { MenuItemWithIngredients } from '../types';

export interface CartItem {
  id: number;
  menuItem: MenuItemWithIngredients;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (menuItem: MenuItemWithIngredients, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  placeOrder: (deliveryAddress: string, branchId?: number, paymentMethod?: string, customerName?: string) => Promise<void>;
  isPlacingOrder: boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotalPrice: () => 0,
  getTotalItems: () => 0,
  placeOrder: async () => {},
  isPlacingOrder: false,
});

const CART_STORAGE_KEY = 'cart_items';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { user } = useContext(AuthContext);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (menuItem: MenuItemWithIngredients, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItem.id === menuItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { 
          id: Date.now(), // temporary ID for cart management
          menuItem, 
          quantity 
        }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };  const placeOrder = async (deliveryAddress: string, branchId?: number, paymentMethod: string = 'CASH', customerName?: string) => {
    if (!user) {
      throw new Error('Please log in to place orders');
    }

    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    setIsPlacingOrder(true);
    
    try {
      // For customers, ensure they have a default branch or determine branch from address
      let targetBranchId = branchId;
      
      if (user.role === 'CUSTOMER') {
        // For customers, use provided branch or default to branch 7
        targetBranchId = branchId || user.branchId || 7;
      } else {
        // For staff (cashiers), use their assigned branch or provided branch
        targetBranchId = branchId || user.branchId || 7;
      }      const orderData = {
        branchId: targetBranchId,
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity
        })),
        deliveryAddress
        // For customers, let backend handle customer ID automatically
        // For cashiers, they can specify customer info via customerName parameter
      };

      console.log('Placing order with data:', orderData);
      const orderResponse = await createOrder(orderData);
      console.log('Order response:', orderResponse);
      
      // Create receipt after successful order placement
      if (orderResponse.data && orderResponse.data.id) {
        const subtotal = getTotalPrice();
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        
        const receiptData = {
          orderId: orderResponse.data.id,
          subtotal,
          tax,
          total,
          paymentMethod,
          customerName: customerName || 'Walk-in Customer'
        };
        
        console.log('Creating receipt with data:', receiptData);
        const receiptResponse = await createReceipt(receiptData);
        console.log('Receipt created:', receiptResponse);
      }
      
      clearCart();
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      // Extract the actual error message from the API response
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to place order';
      throw new Error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      placeOrder,
      isPlacingOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
