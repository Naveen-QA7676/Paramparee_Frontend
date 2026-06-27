import { Heart, ShoppingBag, Eye, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";
import { Magnetic } from "@/components/ui/magnetic";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { fetchProducts } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  tag?: string;
  discount: string;
  rating: number;
  reviews: number;
  inStock: boolean;
};


const Bestsellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        const res = await fetchProducts({ limit: 8, sort: "newest" });
        if (res.success && res.products && res.products.length > 0) {
          const mapped = res.products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice || p.price * 1.2,
            image: (p.images && p.images.length > 0) ? p.images[0] : "/placeholder.svg",
            tag: (p.badges && p.badges.length > 0) ? p.badges[0] : undefined,
            discount: p.originalPrice ? `${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF` : "Best Buy",
            rating: p.rating || 4.5,
            reviews: p.reviewCount || 0,
            inStock: p.inStock
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load bestsellers:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBestsellers();
  }, []);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (product: typeof products[0]) => {
    await addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistClick = async (product: typeof products[0]) => {
    const wasAdded = await toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviews: product.reviews,
      badge: product.tag || undefined,
      inStock: product.inStock,
    });
    
    toast({
      title: wasAdded ? "Added to Wishlist" : "Removed from Wishlist",
      description: wasAdded 
        ? `${product.name} added to your wishlist.`
        : `${product.name} removed from your wishlist.`,
    });
  };

  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused || loading || products.length === 0) return;

    const scrollInterval = setInterval(() => {
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 2) {
        scrollContainer.scrollTo({ left: 0, behavior: "auto" });
      } else {
        scrollContainer.scrollBy({ left: 1, behavior: "auto" });
      }
    }, 40);

    return () => clearInterval(scrollInterval);
  }, [isPaused, loading, products.length]);

  return (
    <section id="bestsellers" className="py-12 md:py-16 bg-background relative overflow-hidden font-body">
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex justify-center items-center gap-2 text-gold font-body text-sm md:text-base tracking-[0.25em] uppercase mb-3 text-center w-full">
            <Sparkles className="h-4 w-4" />
            Most Loved
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-medium text-foreground text-center">
            Bestsellers
          </h2>
        </div>

        <div 
          className="relative group/arrows"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
            // Wait 2 seconds after touch ends before resuming auto-scroll
            setTimeout(() => setIsPaused(false), 2000);
          }}
        >
          {loading ? (
             <div className="flex gap-4 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                   <div key={i} className="flex-shrink-0 w-[240px] md:w-[300px] aspect-[3/4] bg-secondary animate-pulse rounded-2xl" />
                ))}
             </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground w-full">
              No bestsellers found. Browse our collections to find your perfect saree.
            </div>
          ) : (
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto pb-8 gap-5 md:gap-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
            >
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-[240px] md:w-[300px] group opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <TiltCard className="relative overflow-hidden rounded-2xl bg-secondary mb-4 card-hover shadow-soft hover:shadow-elevated transition-shadow duration-300">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full aspect-[3/4] object-cover transition-all duration-700 ${
                          hoveredId === product.id ? "scale-105" : "scale-100"
                        }`}
                      />
                    </Link>
                    
                    {product.tag && (
                      <span className={`absolute top-4 left-4 px-3 py-1.5 text-xs font-body font-medium rounded-full ${
                        product.tag === "Sale" 
                          ? "bg-destructive text-white" 
                          : product.tag === "New Arrival"
                          ? "bg-foreground text-background"
                          : "bg-gold text-foreground"
                      }`}>
                        {product.tag}
                      </span>
                    )}

                    <span className="absolute top-4 right-4 px-2.5 py-1 text-xs font-body font-semibold bg-white text-foreground rounded-full shadow-soft">
                      {product.discount}
                    </span>

                    <div className={`absolute top-14 right-4 flex flex-col gap-2 transition-all duration-300 ${
                      hoveredId === product.id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                    }`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleWishlistClick(product)}
                        className={`bg-white hover:bg-gold hover:text-white rounded-full h-10 w-10 shadow-soft transition-all duration-300 ${
                          isInWishlist(product.id) ? "text-destructive" : ""
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} strokeWidth={1.5} />
                      </Button>
                      <Link to={`/product/${product.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white hover:bg-gold hover:text-white rounded-full h-10 w-10 shadow-soft transition-all duration-300"
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </Link>
                    </div>

                    <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 ${
                      hoveredId === product.id ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product)}
                        className="w-full font-body text-sm bg-foreground hover:bg-foreground/90 text-background gap-2 rounded-full shadow-elevated"
                      >
                        <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                        Add to Cart
                      </Button>
                    </div>
                  </TiltCard>

                  <div className="space-y-2">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-body text-sm font-medium text-foreground line-clamp-2 group-hover:text-gold transition-colors duration-300">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-lg text-foreground">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="font-body text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Desktop Arrow Buttons */}
          <button 
            onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-elevated items-center justify-center text-foreground hover:bg-gold hover:text-white transition-all opacity-0 group-hover/arrows:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-elevated items-center justify-center text-foreground hover:bg-gold hover:text-white transition-all opacity-0 group-hover/arrows:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center mt-14 opacity-0 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <Magnetic>
            <Link to="/products">
              <Button
                variant="outline"
                size="lg"
                className="font-body font-medium tracking-wide rounded-full px-8 border-2 border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-300 group"
              >
                View All Bestsellers
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Button>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
