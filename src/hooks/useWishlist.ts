import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadWishlist,
  addToWishlist as addToWishlistThunk,
  removeFromWishlist as removeFromWishlistThunk,
  toggleWishlist as toggleWishlistThunk,
  type WishlistItem,
} from "@/store/slices/wishlistSlice";

export type { WishlistItem };

/**
 * Backwards-compatible wishlist hook. State now lives in the Redux store
 * (replacing the previous module-global + observer pattern), but the public
 * API and the `wishlistUpdated`/`loginSuccess` window-event sync are preserved.
 */
export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist.items);

  useEffect(() => {
    // loadWishlist branches internally between API (authenticated) and local.
    dispatch(loadWishlist());

    const onUpdate = () => {
      dispatch(loadWishlist());
    };

    window.addEventListener("wishlistUpdated", onUpdate);
    window.addEventListener("loginSuccess", onUpdate);

    return () => {
      window.removeEventListener("wishlistUpdated", onUpdate);
      window.removeEventListener("loginSuccess", onUpdate);
    };
  }, [dispatch]);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((item) => item.id === productId),
    [wishlist]
  );

  const addToWishlist = useCallback(
    async (product: WishlistItem) => {
      const res = await dispatch(addToWishlistThunk(product)).unwrap();
      return res.ok;
    },
    [dispatch]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const res = await dispatch(removeFromWishlistThunk(productId)).unwrap();
      return res.ok;
    },
    [dispatch]
  );

  const toggleWishlist = useCallback(
    async (product: WishlistItem) => {
      const res = await dispatch(toggleWishlistThunk(product)).unwrap();
      return res.result;
    },
    [dispatch]
  );

  return {
    wishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    wishlistCount: wishlist.length,
  };
};

export default useWishlist;
