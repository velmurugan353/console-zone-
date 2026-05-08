import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type: 'buy' | 'rent';
  rentalDuration?: number; // in days
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, type: 'buy' | 'rent') => void;
  updateQuantity: (id: string, type: 'buy' | 'rent', quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(item => 
        item.id === newItem.id && 
        item.type === newItem.type && 
        item.rentalDuration === newItem.rentalDuration
      );
      if (existing) {
        return prev.map(item => 
          (item.id === newItem.id && item.type === newItem.type && item.rentalDuration === newItem.rentalDuration)
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string, type: 'buy' | 'rent') => {
    setItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
  };

  const updateQuantity = (id: string, type: 'buy' | 'rent', quantity: number) => {
    setItems(prev => prev.map(item => 
      (item.id === id && item.type === type) 
        ? { ...item, quantity } 
        : item
    ));
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((total, item) => {
    const itemPrice = item.type === 'rent' && item.rentalDuration 
      ? item.price * item.rentalDuration 
      : item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
