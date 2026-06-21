import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopUtilityHeader from "@/components/layout/TopUtilityHeader";
import MainHeader from "@/components/layout/MainHeader";
import Footer from "@/components/layout/Footer";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

import { useCart } from "@/hooks/useCart";

const isLoggedIn = () =>
  !!(localStorage.getItem("token") && localStorage.getItem("isLoggedIn") === "true");

const Cart = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    sessionStorage.removeItem("directBuyItem");
  }, []);

  const { cartItems, loading, updateQuantity, removeFromCart: removeItem, subtotal } = useCart();

  const deliveryCharge = subtotal >= 2999 ? 0 : 20;
  const totalAmount = subtotal + deliveryCharge;

  const handlePlaceOrder = () => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { returnTo: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-body">
        <TopUtilityHeader /><MainHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading cart...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background font-body">
        <TopUtilityHeader /><MainHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-display font-semibold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => navigate("/products")} className="bg-gold hover:bg-gold/90 text-foreground">Continue Shopping</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <TopUtilityHeader />
      <MainHeader />

      <main className="container mx-auto px-4 py-8">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-gold">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Shopping Cart</span>
        </nav>

        <h1 className="text-3xl font-display font-semibold text-foreground mb-8">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-card rounded-xl p-4 md:p-6 border border-border/50 shadow-soft flex gap-4">
                <Link to={`/product/${item.id}`} className="flex-shrink-0">
                  <div className="w-24 h-32 md:w-32 md:h-40 rounded-lg overflow-hidden bg-secondary">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-medium text-foreground hover:text-gold transition-colors">{item.name}</h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-semibold text-foreground">₹{item.price.toLocaleString()}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">₹{item.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-secondary transition-colors" disabled={item.quantity <= 1}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-secondary transition-colors" disabled={item.quantity >= 5}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="flex items-center gap-1 text-destructive hover:underline text-sm">
                      <Trash2 className="h-4 w-4" />Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border/50 shadow-soft sticky top-24">
              <h2 className="text-xl font-display font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span className={`font-medium ${deliveryCharge === 0 ? "text-green-600" : ""}`}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-gold">Add ₹{(2999 - subtotal).toLocaleString()} more for free delivery</p>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-lg">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Button onClick={handlePlaceOrder} className="w-full h-12 bg-gold hover:bg-gold/90 text-foreground font-medium">Place Order</Button>
                <Button onClick={() => navigate("/products")} variant="outline" className="w-full">Continue Shopping</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

//deploying latest code
