import React from "react";
import { BarChart3, Smartphone, Layout, Code, Users, MessageSquare } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose DesignMetrics</h2>
          <p className="text-lg text-gray-600">Our platform combines powerful design tools with analytics to help you create better user experiences.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <BarChart3 className="text-primary-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">Analytics Integration</h3>
            <p className="text-gray-600">Get real-time insights about how users interact with your designs.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <Smartphone className="text-primary-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">Mobile Optimization</h3>
            <p className="text-gray-600">Ensure your designs look great across all devices with our testing tools.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <Layout className="text-primary-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">Component Library</h3>
            <p className="text-gray-600">Access thousands of pre-built components to speed up your design process.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <Code className="text-primary-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">Code Export</h3>
            <p className="text-gray-600">Export your designs directly to React, Vue, or Angular code.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <Users className="text-primary-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">Collaboration Tools</h3>
            <p className="text-gray-600">Work together with your team in real-time with our collaboration features.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <MessageSquare className="text-primary-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">User Feedback</h3>
            <p className="text-gray-600">Collect and analyze feedback directly from your users.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;