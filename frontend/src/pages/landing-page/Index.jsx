import React, { useState, useEffect } from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import ClientsSection from "./ClientSection";
import WhyChooseSection from "./WhyChooseSection";
import MobileAppSection from "./MobileAppSection ";
import PeopleSection from "./PeopleSection";
import FeaturesSection from "./FeaturesSection";
import DashboardShowcaseSection from "./DashboardShowcaseSection";
import TaskManagementSection from "./TaskManagmentSection";
import StatsSection from "./StatsSection";
import PricingSection from "./PricingSection";
import TestimonialsSection from "./TestimonialSection";
import CTASection from "./CTASection";
import ContactSection from "./ContactSection";
import Footer from "./FooterSection";



// Main App Component
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="overflow-x-hidden">
      <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <HeroSection />
      <section id="clients" >     <ClientsSection />        </section>
      <section id="why-choose" > <WhyChooseSection /> </section>
      <section id="mobile-app" > <MobileAppSection /> </section>
      <section id="people" > <PeopleSection /> </section>
      <section id="features" > <FeaturesSection /> </section>
      <section id="dashboard" ><DashboardShowcaseSection /> </section>
      <section id="task-management" > <TaskManagementSection /> </section>
      <section id="stats" > <StatsSection /> </section>
      <section id="pricing" ><PricingSection /> </section>
      <section id="testimonials" > <TestimonialsSection /> </section>
      <section id="cta" >     <CTASection /> </section>
      <section id="contact" ><ContactSection /> </section>
      <section id="footer" > <Footer /> </section>
    </div>
  );
};

export default App;