import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/lib/apiClient";

export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
}

interface WishlistState {
  items: WishlistItem[];
}

const isLoggedIn = () =>
  !!(localStorage.getItem("token") && localStorage.getItem("isLoggedIn") === "true");

// Helper: convert DB product → WishlistItem shape
const toWishlistItem = (raw: any): WishlistItem => ({
  id: raw._id || raw.id,
  name: raw.name,
  image: (raw.images && raw.images[0]) || "",
  price: raw.price,
  originalPrice: raw.originalPrice,
  rating: raw.rating || 4,
  reviews: raw.numReviews || 0,
  badge: raw.badges?.[0],
  inStock: raw.inStock ?? true,
});

const readLocalWishlist = (): WishlistItem[] => {
  // SSR-safe: the Next.js server has no localStorage. The SPA mounts client-side,
  // where the real persisted wishlist is read and synced into the store.
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("wishlist") || "[]");
};

// Preserve the previous throttle that prevented rapid duplicate API fetches.
let isFetchingWishlist = false;
let lastFetchTime = 0;

const initialState: WishlistState = {
  items: readLocalWishlist(),
};

export const loadWishlist = createAsyncThunk(
  "wishlist/load",
  async (_, { getState, rejectWithValue }) => {
    if (!isLoggedIn()) {
      return readLocalWishlist();
    }

    const now = Date.now();
    if (isFetchingWishlist || now - lastFetchTime < 1000) {
      // Keep current state when throttled.
      return (getState() as { wishlist: WishlistState }).wishlist.items;
    }

    try {
      isFetchingWishlist = true;
      const res = await apiClient.get("/wishlist");

      // Support multiple API structures.
      const data = res.data;
      let rawItems: any[] = [];

      if (data.items) {
        rawItems = data.items;
      } else if (data.data) {
        if (Array.isArray(data.data)) {
          if (data.data[0]?.items) {
            rawItems = data.data[0].items;
          } else {
            rawItems = data.data;
          }
        } else if (typeof data.data === "object" && data.data.items) {
          rawItems = data.data.items;
        } else if (typeof data.data === "object") {
          rawItems = data.data.items || [];
        }
      }

      const items = rawItems.map((i: any) => toWishlistItem(i.product || i));
      localStorage.setItem("wishlist", JSON.stringify(items));
      lastFetchTime = Date.now();
      return items;
    } catch (err) {
      console.error("Fetch wishlist failed:", err);
      return readLocalWishlist();
    } finally {
      isFetchingWishlist = false;
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (product: WishlistItem, { dispatch }) => {
    const updated = [...readLocalWishlist(), product];
    localStorage.setItem("wishlist", JSON.stringify(updated));

    if (isLoggedIn()) {
      try {
        await apiClient.post("/wishlist/add", { productId: product.id });
      } catch (err) {
        console.error("Add to wishlist failed, reverting:", err);
        dispatch(loadWishlist());
        return { items: readLocalWishlist(), ok: false };
      }
    } else {
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
    return { items: updated, ok: true };
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId: string, { dispatch }) => {
    const updated = readLocalWishlist().filter((item) => item.id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(updated));

    if (isLoggedIn()) {
      try {
        await apiClient.delete("/wishlist/remove", { data: { productId } });
      } catch (err) {
        console.error("Remove from wishlist failed, reverting:", err);
        dispatch(loadWishlist());
        return { items: readLocalWishlist(), ok: false };
      }
    } else {
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
    return { items: updated, ok: true };
  }
);

/**
 * Toggle a product in the wishlist. Returns whether the product is in the
 * wishlist after the operation (matching the previous hook's return contract).
 */
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (product: WishlistItem, { getState, dispatch }) => {
    const current = (getState() as { wishlist: WishlistState }).wishlist.items;
    const isCurrentlyIn = current.some((item) => item.id === product.id);

    const updated = isCurrentlyIn
      ? readLocalWishlist().filter((item) => item.id !== product.id)
      : [...readLocalWishlist(), product];

    localStorage.setItem("wishlist", JSON.stringify(updated));

    if (isLoggedIn()) {
      try {
        await apiClient.post("/wishlist/toggle", { productId: product.id });
      } catch (err) {
        console.error("Toggle wishlist failed, reverting:", err);
        dispatch(loadWishlist());
        return { items: readLocalWishlist(), result: isCurrentlyIn };
      }
    } else {
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
    return { items: updated, result: !isCurrentlyIn };
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistItems(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items;
      });
  },
});

export const { setWishlistItems } = wishlistSlice.actions;
export default wishlistSlice.reducer;
