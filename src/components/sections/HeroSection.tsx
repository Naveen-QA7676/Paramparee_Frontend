import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const heroBanner = "/assets/hero-banner.jpg";
const heroVideo = "/assets/hero-video.mp4";

const HeroSection = () => {
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative min-h-[70vh] md:min-h-[90vh] overflow-hidden bg-secondary">
      {/* Background Video with Fallback to Image */}
      {!videoError ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setVideoError(true)}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        />
      )}
      
      {/* Gradient Overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

      {/* Modern Decorative Elements - Glassmorphism */}
      <div className="absolute top-32 right-24 w-64 h-64 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-32 right-48 w-48 h-48 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-48 left-1/2 w-32 h-32 bg-gold/5 rounded-full blur-2xl animate-pulse-soft" />

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center min-h-[70vh] md:min-h-[90vh]">
        <div className="max-w-2xl space-y-8 py-16">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-white/40 shadow-soft opacity-0 animate-blur-in" 
            style={{ animationDelay: "0.2s" }}
          >
            <Sparkles className="h-4 w-4 text-gold animate-pulse-soft" />
            <span className="text-sm font-medium tracking-wide text-foreground">
              Heritage Handwoven Collection
            </span>
          </div>
          
          {/* Heading */}
          <h2 
            className="font-display text-4xl md:text-7xl lg:text-8xl font-semibold text-foreground leading-[1.1] tracking-tight opacity-0 animate-blur-in" 
            style={{ animationDelay: "0.4s" }}
          >
            Threads of
            <span className="block text-gold mt-2">
              Tradition
            </span>
          </h2>
          
          {/* Description */}
          <p 
            className="font-body text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed opacity-0 animate-fade-in-up" 
            style={{ animationDelay: "0.6s" }}
          >
            Discover the timeless elegance of Karnataka's finest handloom tradition. 
            Each saree tells a story of heritage and artistry.
          </p>
          
          {/* CTA Button */}
          <div 
            className="flex flex-wrap gap-4 pt-4 opacity-0 animate-fade-in-up" 
            style={{ animationDelay: "0.8s" }}
          >
            <Magnetic strength={0.45}>
              <Link to="/products">
                <Button
                  size="lg"
                  className="font-body font-medium tracking-wide rounded-full px-8 py-6 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 hover:shadow-elevated group"
                >
                  <span className="flex items-center gap-2">
                    Shop Collection
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </Magnetic>
          </div>

          {/* Trust Badges */}
          <div 
            className="flex flex-wrap gap-8 pt-8 opacity-0 animate-fade-in" 
            style={{ animationDelay: "1s" }}
          >
            {["100% Handwoven", "Direct from Weaver", "Free Shipping ₹2999+"].map((badge) => (
              <span 
                key={badge} 
                className="flex items-center gap-2.5 text-sm text-muted-foreground font-body"
              >
                <span className="w-2 h-2 bg-gold rounded-full" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-body text-muted-foreground tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-foreground/30 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 w-full bg-gold animate-fade-in-up" style={{ animationDuration: "1.5s", animationIterationCount: "infinite" }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
