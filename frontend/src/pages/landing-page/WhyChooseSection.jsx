import React from "react";
import { FileText, Settings2, Layout, Shield } from "lucide-react";

const WhyChooseSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose DesignMetrics</h2>
          <p className="text-gray-600">Our focus is on flexibility with streamlined configuration makes our platform, easy to use and customizable.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-red-500" size={24} />
            </div>
            <h3 className="font-bold mb-2">Create Your Custom UI Account</h3>
            <p className="text-sm text-gray-600">Develop a personalized dashboard tailored to your specific needs.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Settings2 className="text-blue-500" size={24} />
            </div>
            <h3 className="font-bold mb-2">Setup Requirements Configuration</h3>
            <p className="text-sm text-gray-600">Customize all aspects of your analytics experience with our intuitive setup.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Layout className="text-green-500" size={24} />
            </div>
            <h3 className="font-bold mb-2">Design Your Software Configuration</h3>
            <p className="text-sm text-gray-600">Build and modify your interface elements to match your workflow perfectly.</p>
          </div>
          
          {/* Feature 4 */}
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-yellow-500" size={24} />
            </div>
            <h3 className="font-bold mb-2">Start Your Projects Securely</h3>
            <p className="text-sm text-gray-600">Launch with confidence knowing your data and designs are protected.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;