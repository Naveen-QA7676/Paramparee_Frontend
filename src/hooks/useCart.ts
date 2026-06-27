import { useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadCart,
  addToCart as addToCartThunk,
  removeFromCart as removeFromCartThunk,
  updateQuantity as updateQuantityThunk,
} from "@/store/slices/cartSlice";

export type { CartItem } from "@/store/slices/cartSlice";

/**
 * Backwards-compatible cart hook. The cart now lives in the Redux store, but
 * this hook preserves the original API (and the cross-component sync via the
 * `cartUpdated`/`storage`/`loginSuccess` window events) so consumers are
 * unchanged.
 */
export const useCart = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const loading = useAppSelector((state) => state.cart.loading);

  useEffect(() => {
    dispatch(loadCart());

    const onUpdate = () => {
      // Small delay to ensure DB has updated before we refetch.
      setTimeout(() => dispatch(loadCart()), 100);
    };

    window.addEventListener("cartUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    window.addEventListener("loginSuccess", onUpdate);

    return () => {
      window.removeEventListener("cartUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("loginSuccess", onUpdate);
    };
  }, [dispatch]);

  const addToCart = useCallback(
    async (product: any, quantity: number = 1) => {
      await dispatch(addToCartThunk({ product, quantity }));
      return true;
    },
    [dispatch]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      await dispatch(removeFromCartThunk(productId));
      return true;
    },
    [dispatch]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1 || quantity > 5) return false;
      await dispatch(updateQuantityThunk({ productId, quantity }));
      return true;
    },
    [dispatch]
  );

  const refreshCart = useCallback(() => {
    dispatch(loadCart());
  }, [dispatch]);

  const cartCount = useMemo(() => cartItems.length, [cartItems]);
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  return {
    cartItems,
    loading,
    cartCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart,
  };
};

export default useCart;
