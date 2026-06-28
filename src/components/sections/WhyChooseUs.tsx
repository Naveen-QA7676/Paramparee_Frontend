import { Shield, Truck, RefreshCw, Headphones, Sparkles } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { TextReveal } from "@/components/ui/text-reveal";

const features = [
  { icon: Shield, title: "Direct from Weaver", description: "Authentic handwoven Ilkal sarees" },
  { icon: Truck, title: "Free Shipping ₹3999+", description: "On all orders across India" },
  { icon: RefreshCw, title: "Easy Returns", description: "7-day hassle-free returns" },
  { icon: Headphones, title: "24/7 Support", description: "Dedicated customer care" },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <span className="inline-flex justify-center items-center gap-2 text-gold font-body text-xs tracking-[0.25em] uppercase mb-3">
            <Sparkles className="h-4 w-4" />
            Why Parampare
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-medium text-foreground">
            <TextReveal text="The Parampare Promise" />
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <TiltCard
              key={feature.title}
              max={16}
              glare={false}
              className="relative text-center group rounded-2xl p-4 hover:bg-background/60 transition-colors"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <feature.icon className="w-6 h-6 text-gold" strokeWidth={1.5} />
              </div>
              <h3 className="font-body text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-muted-foreground text-xs font-body">{feature.description}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;