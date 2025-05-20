import CTASection from "./CTASection";
import ContactSection from "./ContactSection";
import Header from "./Header";
import HeroSection from "./HeroSection"
import ClientsSection from "./ClientSection"
import WhyChooseSection from "./WhyChooseSection"
import MobileAppSection from "./MobileAppSection "
import PeopleSection from "./PeopleSection"
import FeaturesSection from "./FeaturesSection"
import DashboardShowcaseSection from "./DashboardShowcaseSection"
import TaskManagementSection from "./TaskManagmentSection"
import StatsSection from "./StatsSection"
import TestimonialsSection from "./TestimonialsSection"      
import PricingSection from "./PricingSection"
import Footer from "./Footer"


const Index = () => {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <HeroSection />
      <ClientsSection />
      <WhyChooseSection />
      <MobileAppSection />
      <PeopleSection />
      <FeaturesSection />
      <DashboardShowcaseSection />
      <TaskManagementSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;