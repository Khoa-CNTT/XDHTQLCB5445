import { createContext, useState, useEffect } from 'react';
import { getCart } from '../APIs/cartApi';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const res = await getCart();
      const cartItems = res?.data || {};
      const uniqueProductCount = Object.keys(cartItems).length; // Đếm số sản phẩm duy nhất
      setCartCount(uniqueProductCount);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};