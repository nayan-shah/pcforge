import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number; // Price in INR
  originalPrice?: number;
  image?: string;
  brand: string;
  rating?: number;
  quantity: number;
  powerWatts?: number;
  description?: string;
  compatibilityNotes?: string[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isItemInCart: (id: string) => boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('pcforge_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pcforge_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartDrawerOpen(true); // Open the drawer immediately for great UX feedback
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const isItemInCart = (id: string) => {
    return cart.some((item) => item.id === id);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isItemInCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
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
