import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addToCart = (book, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [
        ...prev,
        { id: book.id, name: book.title, price: book.price, imageUrl: book.imageUrl, quantity },
      ];
    });
  };

  const removeFromCart = (bookId) => {
    setItems((prev) => prev.filter((item) => item.id !== bookId));
  };

  const updateQuantity = (bookId, newQuantity) => {
    setItems((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((item) => item.id !== bookId);
      }
      return prev.map((item) => (item.id === bookId ? { ...item, quantity: newQuantity } : item));
    });
  };

  const clearCart = () => setItems([]);

  const cartSummary = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return { totalQuantity, totalPrice };
  }, [items]);

  const value = { items, addToCart, removeFromCart, updateQuantity, clearCart, ...cartSummary };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
