import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategoryTree, getCategoryImageUrl } from "@/lib/api";
import { TiltCard } from "@/components/ui/tilt-card";
import { TextReveal } from "@/components/ui/text-reveal";

const CircleCard = ({ category, index }: { category: { name: string; image: string; href: string }; index: number }) => {
  return (
    <Link
      to={category.href}
      className="group block opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative flex flex-col items-center">
        {/* Circle image - Small and centered, with 3D pointer tilt */}
        <TiltCard
          max={18}
          className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-border/50 group-hover:border-gold transition-all duration-500 bg-secondary shadow-sm group-hover:shadow-md"
        >
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </TiltCard>
        
        {/* Category Name - Smaller font */}
        <h3 className="mt-2 text-center text-[10px] md:text-xs font-medium text-foreground group-hover:text-gold transition-colors duration-300">
          {category.name}
        </h3>
      </div>
    </Link>
  );
};
const CircleCategories = () => {
  const { data: treeRes } = useQuery({
    queryKey: ["categoryTree"],
    queryFn: fetchCategoryTree,
  });

  const shopByCategory = treeRes?.data?.find(c => c.slug === "shop-by-category");
  const apiCategories = shopByCategory?.children || [];
  
  // Also check if they are directly under root if shop-by-category doesn't exist
  const effectiveCategories = apiCategories.length > 0 
    ? apiCategories 
    : (treeRes?.data?.filter(c => c.level === 0 && c.children && c.children.length > 0) || []);

  const categories = effectiveCategories.map((cat) => ({
    name: cat.name,
    image: getCategoryImageUrl(cat.imageUrl) || "/placeholder.svg",
    href: `/category/shop-by-category/${cat.slug}`,
  }));

  return (
    <section className="py-12 md:py-16 px-4 bg-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center justify-center gap-2 text-gold font-body text-sm md:text-base tracking-[0.25em] uppercase mb-3 text-center w-full">
            <Sparkles className="h-4 w-4" />
            Our Collections
          </span>
          <h2 className="text-2xl md:text-4xl font-display font-medium text-foreground text-center">
            <TextReveal text="Shop by Category" />
          </h2>
        </div>

        {/* Categories Flex Grid - Single centered row */}
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center items-start gap-6 md:gap-8 lg:gap-12 overflow-x-auto md:overflow-visible scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-2">
          {categories.map((category, index) => (
            <div key={category.name} className="flex-shrink-0 w-24 md:w-28">
              <CircleCard category={category} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CircleCategories;
