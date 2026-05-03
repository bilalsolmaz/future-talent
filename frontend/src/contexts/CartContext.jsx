import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Sayfa yenilendiğinde sepeti localStorage'dan kurtar
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sepet her değiştiğinde localStorage'ı güncelle
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      // Ürün zaten sepette var mı kontrol et
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id);

      if (existingItemIndex > -1) {
        // Varsa miktarını artır
        const newCart = [...prevCart];
        const currentQty = newCart[existingItemIndex].quantity;
        
        // Stok kontrolü yap (sepet+eklenen stoktan fazla olamaz)
        if (currentQty + quantity > product.stok) {
          alert('Üzgünüz, bu üründen yeterli stok bulunmuyor.');
          return prevCart;
        }

        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      // Yoksa yeni ürün olarak ekle
      if (quantity > product.stok) {
         alert('Üzgünüz, bu üründen yeterli stok bulunmuyor.');
         return prevCart;
      }

      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          // Stok kontrolü
          if (quantity > item.stok) {
            alert('Maksimum stoğa ulaştınız.');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Sepetteki toplam ürün sayısı
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Sepetin toplam tutarı
  const totalPrice = cart.reduce((total, item) => total + (item.fiyat * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
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
