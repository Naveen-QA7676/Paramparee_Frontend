import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Plus, Check, ArrowLeft, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopUtilityHeader from "@/components/layout/TopUtilityHeader";
import MainHeader from "@/components/layout/MainHeader";
import Footer from "@/components/layout/Footer";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAddresses, Address } from "@/hooks/useAddresses";
import { STATES_OF_INDIA } from "@/constants/states";

const Checkout = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Online" | "COD">("COD");
  const { toast } = useToast();
  
  const { cartItems: globalCartItems, subtotal: globalSubtotal, loading } = useCart();
  const { addresses, addAddress } = useAddresses();
  
  const directBuyItemRaw = sessionStorage.getItem("directBuyItem");
  const directBuyItem = directBuyItemRaw ? JSON.parse(directBuyItemRaw) : null;
  const isDirectBuy = !!directBuyItem;

  const cartItems = isDirectBuy ? [directBuyItem] : globalCartItems;
  const subtotal = isDirectBuy ? (directBuyItem.price * directBuyItem.quantity) : globalSubtotal;

  const deliveryCharge = subtotal >= 2999 ? 0 : 99;
  const total = subtotal + deliveryCharge;

  const [formData, setFormData] = useState<Omit<Address, "id" | "_id" | "isDefault">>({
    fullName: "", mobile: "", house: "", street: "",
    city: "", state: "", pincode: "", landmark: "", alternatePhone: "", addressLine1: "",
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) { navigate("/login", { state: { returnTo: "/checkout" } }); return; }
    if (!isDirectBuy && !loading && globalCartItems.length === 0) { navigate("/cart"); return; }
  }, [navigate, globalCartItems, loading, isDirectBuy]);

  useEffect(() => {
    if (addresses.length > 0) {
      setFormData((prev) => {
        if (prev.fullName) return prev;
        const defaultAddr = addresses.find((a: Address) => a.isDefault) || addresses[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const legacyAddr = defaultAddr as any;
        return {
          fullName: legacyAddr.fullName || "",
          mobile: legacyAddr.mobile || "",
          house: legacyAddr.house || legacyAddr.addressLine1 || "",
          street: legacyAddr.street || legacyAddr.addressLine2 || "",
          city: defaultAddr.city || "",
          state: defaultAddr.state || "",
          pincode: defaultAddr.pincode || "",
          landmark: defaultAddr.landmark || "",
          alternatePhone: defaultAddr.alternatePhone || "",
          addressLine1: defaultAddr.addressLine1 || legacyAddr.house || "",
        };
      });
    }
  }, [addresses]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!formData.mobile?.trim() || !/^[0-9]{10}$/.test(formData.mobile)) newErrors.mobile = "Valid 10-digit mobile is required";
    if (!formData.house?.trim()) newErrors.house = "House/Flat is required";
    if (!formData.street?.trim()) newErrors.street = "Street/Area is required";
    
    if (!formData.city?.trim()) newErrors.city = "City is required";
    else if (!/^[A-Za-z\s]{2,}$/.test(formData.city)) newErrors.city = "Enter a valid city name";

    if (!formData.state?.trim() || formData.state === "") newErrors.state = "Please select a state";
    
    if (!formData.pincode?.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = "Please enter a valid 6-digit pincode";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) {
      toast({ title: "Incomplete Address", description: "Please fill out all required address fields correctly.", variant: "destructive" });
      return;
    }
    setSavingAddress(true);
    try { 
      await addAddress({ ...formData, addressLine1: formData.house });
      toast({ title: "Address Saved", description: "Your delivery address has been saved." });
    } catch (e) { 
      console.warn("Failed saving address", e); 
      toast({ title: "Save Failed", description: "Could not save address.", variant: "destructive" });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleRazorpayPayment = async (selectedAddr: Address) => {
    try {
      const { data: { data: rzpOrder } } = await apiClient.post("/payment/create-order", {
        amount: total,
        receipt: `receipt_${Date.now()}`
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Parampare",
        description: "Authentic Ilkal Sarees",
        order_id: rzpOrder.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            await apiClient.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            await completeOrder(selectedAddr, "Online");
          } catch (err) {
            console.error("Payment verification or order placement failed:", err);
            toast({ title: "Order Failed", description: "Payment verified but order creation failed. Please contact support.", variant: "destructive" });
          }
        },
        prefill: {
          name: selectedAddr.fullName,
          contact: selectedAddr.mobile,
        },
        theme: { color: "#C5A059" },
        modal: {
          ondismiss: () => {
            toast({ title: "Payment Cancelled", description: "You closed the payment window. Your order was not placed." });
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on('payment.failed', function (response: any) {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay initiation failed:", err);
      toast({ title: "Payment Error", description: "Could not initiate payment. Please try again or use COD.", variant: "destructive" });
    } finally {
      setPlacingOrder(false);
    }
  };

  const completeOrder = async (selectedAddr: Address, method: "Online" | "COD") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItems = cartItems.map((item: any) => ({
      productId: item.id,
      name: item.name,
      image: item.image || "",
      quantity: item.quantity,
      price: item.price,
    }));

    const res = await apiClient.post("/orders", {
      items: orderItems,
      shippingAddress: selectedAddr,
      paymentMethod: method === "Online" ? "Online Payment" : "Cash on Delivery",
    });

    if (!isDirectBuy) {
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      sessionStorage.removeItem("directBuyItem");
    }

    const orderData = res.data.data || res.data;
    const finalOrder = {
      id: orderData.orderId || orderData._id || orderData.id,
      items: orderItems,
      address: selectedAddr,
      date: new Date().toISOString(),
      status: "Order Confirmed",
      paymentMethod: method === "Online" ? "Online Payment" : "Cash on Delivery",
      total: total,
      subtotal: subtotal,
      deliveryCharge: deliveryCharge,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    sessionStorage.setItem("lastOrderId", finalOrder.id);
    
    // Fallback: Save to local storage so OrderDetail can retrieve it even if backend API dies or page is refreshed
    try {
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      localStorage.setItem("orders", JSON.stringify([finalOrder, ...existingOrders]));
    } catch (e) {
      console.warn("Failed saving order to local storage", e);
    }

    // Background sync to Google Sheets
    const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
    if (googleSheetsUrl) {
      try {
        const sheetData = {
          orderId: finalOrder.id,
          date: finalOrder.date,
          status: finalOrder.status,
          paymentMethod: finalOrder.paymentMethod,
          total: finalOrder.total,
          fullName: finalOrder.address.fullName,
          mobile: finalOrder.address.mobile,
          address: `${finalOrder.address.house}, ${finalOrder.address.street}, ${finalOrder.address.city}, ${finalOrder.address.state} - ${finalOrder.address.pincode}`,
          items: finalOrder.items.map(item => `${item.name} (x${item.quantity})`).join(" | "),
        };

        // Added test log for local debugging
        console.log("SENDING TO GOOGLE SHEETS FOR TEST:", sheetData);

        fetch(googleSheetsUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sheetData)
        }).catch(err => console.error("Failed silently to sync to Google Sheets:", err));
      } catch (err) {
        console.error("Google Sheets sync error:", err);
      }
    }

    navigate("/order-confirmation", {
      state: { orderId: finalOrder.id, order: finalOrder },
      replace: true
    });
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast({ title: "Incomplete Address", description: "Please fill out all required address fields correctly.", variant: "destructive" });
      return;
    }

    setPlacingOrder(true);
    
    // Background sync to Address Book if it's new/modified
    const isExactMatch = addresses.some(a => 
      a.street === formData.street && a.house === formData.house && a.pincode === formData.pincode
    );
    if (!isExactMatch) {
      try { await addAddress({ ...formData, addressLine1: formData.house }); } catch (e) { console.warn("Failed syncing address", e); }
    }
    
    const selectedAddr = { ...formData, addressLine1: formData.house } as Address;

    if (paymentMethod === "Online") {
      await handleRazorpayPayment(selectedAddr);
    } else {
      try {
        await completeOrder(selectedAddr, "COD");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Place order failed:", err);
        toast({ title: "Order Failed", description: "Could not place order. Please try again.", variant: "destructive" });
      } finally {
        setPlacingOrder(false);
      }
    }
  };


  return (
    <div className="min-h-screen bg-background font-body">
      <TopUtilityHeader /><MainHeader />
      <main className="container mx-auto px-4 py-8">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-gold">Home</Link><span className="mx-2">/</span>
          <Link to="/cart" className="hover:text-gold">Cart</Link><span className="mx-2">/</span>
          <span className="text-foreground">Checkout</span>
        </nav>
        <h1 className="text-3xl font-display font-semibold text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border/50 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gold" />Delivery Address
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="Enter full name" className={errors.fullName ? "border-destructive" : ""} />
                    {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                    <Input value={formData.mobile} onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" className={errors.mobile ? "border-destructive" : ""} />
                    {errors.mobile && <p className="text-destructive text-xs mt-1">{errors.mobile}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">House / Flat *</label>
                    <Input value={formData.house} onChange={(e) => handleChange("house", e.target.value)} placeholder="House/Flat number, Building name" className={errors.house ? "border-destructive" : ""} />
                    {errors.house && <p className="text-destructive text-xs mt-1">{errors.house}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Street / Area *</label>
                    <Input value={formData.street} onChange={(e) => handleChange("street", e.target.value)} placeholder="Street, Area, Colony" className={errors.street ? "border-destructive" : ""} />
                    {errors.street && <p className="text-destructive text-xs mt-1">{errors.street}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="e.g. Bengaluru" className={errors.city ? "border-destructive" : ""} />
                    {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className={`w-full h-10 border rounded-md bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.state ? "border-destructive" : "border-input"}`}
                    >
                      <option value="" disabled>Select State</option>
                      {STATES_OF_INDIA.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-destructive text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode *</label>
                    <Input value={formData.pincode} onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} placeholder="e.g. 560001" className={errors.pincode ? "border-destructive" : ""} />
                    {errors.pincode && <p className="text-destructive text-xs mt-1">{errors.pincode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Landmark (Optional)</label>
                    <Input value={formData.landmark || ""} onChange={(e) => handleChange("landmark", e.target.value)} placeholder="Nearby landmark" className={errors.landmark ? "border-destructive" : ""} />
                    {errors.landmark && <p className="text-destructive text-xs mt-1">{errors.landmark}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Alternate Phone (Optional)</label>
                    <Input value={formData.alternatePhone || ""} onChange={(e) => handleChange("alternatePhone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Another phone number" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={handleSaveAddress} disabled={savingAddress} variant="outline" className="border-gold text-gold hover:bg-gold/10">
                    {savingAddress ? "Saving..." : "Save Address"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-card rounded-xl p-6 border border-border/50 shadow-soft">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-gold" />Payment Method
              </h2>
              <div className="grid gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "Online" ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"}`}>
                  <input type="radio" name="payment" checked={paymentMethod === "Online"} onChange={() => setPaymentMethod("Online")} className="w-4 h-4 accent-gold" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Online Payment</p>
                      <p className="text-xs text-muted-foreground">Razorpay (Cards, UPI, Netbanking)</p>
                    </div>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"}`}>
                  <input type="radio" name="payment" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="w-4 h-4 accent-gold" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when you receive the order</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border/50 shadow-soft sticky top-24">
              <h2 className="text-xl font-display font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-sm border-t border-border pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-green-600" : ""}>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-border">
                  <span>Total</span><span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 mb-4">Payment: <span className="font-medium text-foreground">{paymentMethod === "Online" ? "Online Payment" : "Cash on Delivery"}</span></p>
              <Button onClick={handlePlaceOrder} disabled={placingOrder} className="w-full h-12 bg-gold hover:bg-gold/90 text-foreground font-medium">
                {placingOrder ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
