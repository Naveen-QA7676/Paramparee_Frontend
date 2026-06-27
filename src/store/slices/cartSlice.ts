import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "@/lib/apiClient";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
}

const isLoggedIn = () =>
  !!(localStorage.getItem("token") && localStorage.getItem("isLoggedIn") === "true");

const readLocalCart = (): CartItem[] => {
  // SSR-safe: no localStorage on the Next.js server. Cart is hydrated client-side.
  if (typeof window === "undefined") return [];
  const stored = JSON.parse(localStorage.getItem("cart") || "[]");
  return Array.isArray(stored) ? stored : [];
};

const initialState: CartState = {
  items: [],
  loading: true,
};

/**
 * Load the cart. Mirrors the previous hook: when authenticated it fetches from
 * the API and mirrors the result into localStorage; otherwise it reads the
 * local cart. Falls back to local on any API error.
 */
export const loadCart = createAsyncThunk("cart/load", async () => {
  if (!isLoggedIn()) {
    return readLocalCart();
  }
  try {
    const res = await apiClient.get("/cart");
    const rawItems = res.data.data?.items || res.data.items || [];
    const items: CartItem[] = rawItems.map((i: any) => ({
      id: i.product?._id || i.product || i.productId,
      name: i.product?.name || i.name,
      image: i.product?.images?.[0] || i.image || "",
      price: i.product?.price || i.price,
      originalPrice: i.product?.originalPrice || i.originalPrice,
      quantity: i.quantity,
    }));
    localStorage.setItem("cart", JSON.stringify(items));
    return items;
  } catch (err) {
    console.error("Fetch cart failed:", err);
    return readLocalCart();
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ product, quantity = 1 }: { product: any; quantity?: number }) => {
    const productId = product.id || product._id;
    const name = product.name;
    const image = product.image || (product.images && product.images[0]) || "";
    const price = product.price;
    const originalPrice = product.originalPrice;

    // Optimistically update local storage first.
    const cart = readLocalCart();
    const existing = cart.find((i) => i.id === productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, 5);
    } else {
      cart.push({ id: productId, name, image, price, originalPrice, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    if (isLoggedIn()) {
      try {
        await apiClient.post("/cart/add", { productId, quantity });
      } catch (err) {
        console.error("Add to cart API failed:", err);
      }
    }
    return cart;
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId: string) => {
    const cart = readLocalCart();
    const updated = cart.filter((i) => i.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));

    if (isLoggedIn()) {
      try {
        await apiClient.delete("/cart/remove", { data: { productId } });
      } catch (err) {
        console.error("Remove from cart API failed:", err);
      }
    }
    return updated;
  }
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue }
  ) => {
    if (quantity < 1 || quantity > 5) return rejectWithValue("invalid quantity");

    const cart = readLocalCart();
    const item = cart.find((i) => i.id === productId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }

    if (isLoggedIn()) {
      try {
        await apiClient.put("/cart/update", { productId, quantity });
      } catch (err) {
        console.error("Update cart API failed:", err);
      }
    }
    return cart;
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
