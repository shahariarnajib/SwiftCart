"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string; // product id
  productId: string;
  name: string;
  slug: string;
  price: number;
  regularPrice: number;
  image: string;
  sku: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    regularPrice: number;
    image: string;
    sku: string;
    stock: number;
  }, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  deliveryZone: "inside_dhaka" | "outside_dhaka";
  setDeliveryZone: (zone: "inside_dhaka" | "outside_dhaka") => void;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  notification: string | null;
  clearNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "swift_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");
  const [notification, setNotification] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, isLoaded]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const addItem = (
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      regularPrice: number;
      image: string;
      sku: string;
      stock: number;
    },
    quantity: number = 1
  ): boolean => {
    if (product.stock <= 0) {
      notify(`Sorry, "${product.name}" is out of stock.`);
      return false;
    }

    let success = true;
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          notify(`Only ${product.stock} units available in stock.`);
          success = false;
          return prev;
        }
        notify(`Updated "${product.name}" quantity (${newQty}) in cart!`);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock) {
          notify(`Only ${product.stock} units available in stock.`);
          success = false;
          return prev;
        }
        notify(`Added "${product.name}" to cart!`);
        return [
          ...prev,
          {
            id: product.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            regularPrice: product.regularPrice,
            image: product.image,
            sku: product.sku,
            quantity: quantity,
            stock: product.stock,
          },
        ];
      }
    });

    return success;
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.productId === productId);
      if (target) {
        notify(`Removed "${target.name}" from cart.`);
      }
      return prev.filter((item) => item.productId !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (quantity > item.stock) {
            notify(`Cannot exceed available stock (${item.stock} items).`);
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Free delivery threshold: over 2500 BDT
  const deliveryCharge =
    subtotal > 2500 || items.length === 0
      ? 0
      : deliveryZone === "inside_dhaka"
      ? 60
      : 120;

  const total = subtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryCharge,
        deliveryZone,
        setDeliveryZone,
        total,
        isOpen,
        setIsOpen,
        notification,
        clearNotification: () => setNotification(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
