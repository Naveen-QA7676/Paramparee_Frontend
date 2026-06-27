import TopUtilityHeader from "@/components/layout/TopUtilityHeader";
import MainHeader from "@/components/layout/MainHeader";
import HeroSection from "@/components/sections/HeroSection";
import CircleCategories from "@/components/sections/CircleCategories";
import ShaadiWardrobe from "@/components/sections/ShaadiWardrobe";
import Bestsellers from "@/components/sections/Bestsellers";
import EthnicEnsemble from "@/components/sections/EthnicEnsemble";
import CuratedCollection from "@/components/sections/CuratedCollection";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/layout/BackToTop";
import PromotionalBanner from "@/components/sections/PromotionalBanner";
import Reveal from "@/components/ui/reveal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <TopUtilityHeader />
      <MainHeader />
      <main className="flex flex-col pb-20">
        <HeroSection />
        <div className="flex flex-col gap-20 md:gap-32 mt-16 md:mt-24">
          <Reveal><CircleCategories /></Reveal>
          <Reveal><ShaadiWardrobe /></Reveal>
          <Reveal><Bestsellers /></Reveal>
          <Reveal><PromotionalBanner /></Reveal>
          <Reveal><EthnicEnsemble /></Reveal>
          <Reveal><CuratedCollection /></Reveal>
          <Reveal><WhyChooseUs /></Reveal>
          <Reveal><Testimonials /></Reveal>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
