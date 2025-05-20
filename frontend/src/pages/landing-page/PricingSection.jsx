import React from "react";
import { Check } from "lucide-react";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600">Choose the plan that's right for you and start improving your designs today.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Starter</h3>
              <div className="text-primary-600 text-4xl font-bold mb-2">$19<span className="text-gray-400 text-lg font-normal">/mo</span></div>
              <p className="text-gray-600 mb-6">Perfect for individuals and small projects</p>
              <ul className="space-y-3 mb-8">
                {["5 Projects", "Basic Analytics", "1 Team Member", "Export to PNG/SVG"].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check size={18} className="text-green-500 mr-2" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center rounded-md font-medium transition-colors">Get Started</a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-primary-200 overflow-hidden relative">
            <div className="bg-primary-500 text-white text-xs font-bold uppercase py-1 px-3 absolute right-0">Popular</div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Professional</h3>
              <div className="text-primary-600 text-4xl font-bold mb-2">$49<span className="text-gray-400 text-lg font-normal">/mo</span></div>
              <p className="text-gray-600 mb-6">Ideal for growing teams and businesses</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited Projects",
                  "Advanced Analytics",
                  "5 Team Members",
                  "Export to Code",
                  "Component Library",
                  "Priority Support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check size={18} className="text-green-500 mr-2" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className="block w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center rounded-md font-medium transition-colors">Get Started</a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">Enterprise</h3>
              <div className="text-primary-600 text-4xl font-bold mb-2">$99<span className="text-gray-400 text-lg font-normal">/mo</span></div>
              <p className="text-gray-600 mb-6">For large organizations with advanced needs</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited Everything",
                  "Custom Analytics",
                  "Unlimited Team Members",
                  "White Labeling",
                  "Custom Integrations",
                  "Dedicated Support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check size={18} className="text-green-500 mr-2" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <a href="#" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center rounded-md font-medium transition-colors">Contact Sales</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;