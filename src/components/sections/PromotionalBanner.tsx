import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const bgImage = "/assets/saree-3.jpg";

const PromotionalBanner = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-foreground">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Premium Collection" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <span className="inline-flex items-center gap-2 text-gold font-body text-sm md:text-base tracking-[0.25em] uppercase mb-4">
            <span className="w-8 h-[1px] bg-gold"></span>
            Exclusive Preview
          </span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6 text-white">
            The Heritage Silk Collection
          </h2>
          <p className="font-body text-white/80 text-lg mb-8 max-w-md">
            Discover our newly curated handwoven pure silk sarees, crafted by master artisans to perfection.
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-gold hover:bg-gold-dark text-white rounded-full font-body tracking-wide px-8 shadow-soft">
              Explore Collection
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;
