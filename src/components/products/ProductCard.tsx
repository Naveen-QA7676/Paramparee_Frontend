import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/ui/tilt-card";
import { Product } from "@/lib/api";
import { useWishlist } from "@/hooks/useWishlist";

// Extend Product with frontend-only fields for card
export type ProductCardProps = {
  product: Product & {
    image: string;
    reviews: number;
    badge?: string;
  };
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const getDiscount = () => {
    if (!product.originalPrice || !product.price) return 0;
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    return isNaN(discount) ? 0 : discount;
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Best Seller":
        return "bg-gold text-foreground";
      case "New Arrival":
        return "bg-primary text-primary-foreground";
      case "GI Certified":
        return "bg-green-600 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviews: product.reviews,
      badge: product.badge,
      inStock: product.inStock,
    });
  };

  return (
    <TiltCard className="group relative bg-card rounded-xl overflow-hidden border border-border/50 shadow-soft hover:shadow-elevated transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </Link>
        
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge className={getBadgeColor(product.badge)}>
              {product.badge}
            </Badge>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
        >
          <Heart
            className={`h-5 w-5 ${
              isInWishlist(product.id)
                ? "fill-destructive text-destructive"
                : "text-foreground/70"
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-foreground line-clamp-2 hover:text-gold transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({product.reviews})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
              <span className="text-sm text-green-600 font-medium">
                {getDiscount()}% off
              </span>
            </>
          )}
        </div>
      </div>
    </TiltCard>
  );
};

export default ProductCard;
