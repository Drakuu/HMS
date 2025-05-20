import React from "react";
import { Lock, MessageSquare, Settings, Check, PieChart, Users, PenTool } from "lucide-react";

const MobileAppSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-4">Sometimes The Best Way To Envision The Future is To Invent It</h2>
            <p className="text-gray-600 mb-8">Our platform gives you the tools to bring your ideas to life, making sure what you design today can help shape tomorrow.</p>
            
            <div className="space-y-6">
              {/* Feature with Button */}
              <div>
                <button className="bg-primary-600 text-white px-6 py-3 rounded-md font-medium flex items-center mb-4">
                  <Lock size={18} className="mr-2" />
                  Protect Your Data And Privacy
                </button>
                <p className="text-sm text-gray-500">We prioritize your security so you can focus on what matters - creating amazing designs.</p>
              </div>
              
              {/* Feature with Icon */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg mr-4">
                  <MessageSquare size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Free And Open Source Software</h3>
                  <p className="text-gray-600 text-sm">Built by the community, for the community, ensuring transparency and collaboration.</p>
                </div>
              </div>
              
              {/* Feature with Icon */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg mr-4">
                  <Settings size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Managing Change Requests</h3>
                  <p className="text-gray-600 text-sm">Streamlined process for handling modifications and improvements to your designs.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile App Image */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="w-[250px] md:w-[300px] bg-white rounded-3xl border-8 border-gray-800 shadow-xl overflow-hidden">
                <div className="bg-primary-600 p-4 text-white">
                  <div className="text-lg font-bold">Protect Your Data And Privacy</div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-6">Use features to gain control of all your data, from data visualization to real-time analytics right away from the powerful DesignMetrics.</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center">
                      <Check size={16} className="text-green-500 mr-2" />
                      <span className="text-sm">Privacy-first design approach</span>
                    </div>
                    <div className="flex items-center">
                      <Check size={16} className="text-green-500 mr-2" />
                      <span className="text-sm">End-to-end data encryption</span>
                    </div>
                    <div className="flex items-center">
                      <Check size={16} className="text-green-500 mr-2" />
                      <span className="text-sm">Full control of your data</span>
                    </div>
                    <div className="flex items-center">
                      <Check size={16} className="text-green-500 mr-2" />
                      <span className="text-sm">Access to your analytics</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-100 rounded-xl p-3 flex items-center justify-center flex-col">
                      <div className="bg-primary-500 rounded-lg w-10 h-10 flex items-center justify-center mb-2">
                        <PieChart size={18} className="text-white" />
                      </div>
                      <span className="text-xs text-center text-primary-700">Analytics</span>
                    </div>
                    <div className="bg-blue-100 rounded-xl p-3 flex items-center justify-center flex-col">
                      <div className="bg-blue-500 rounded-lg w-10 h-10 flex items-center justify-center mb-2">
                        <Users size={18} className="text-white" />
                      </div>
                      <span className="text-xs text-center text-blue-700">Team</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -right-4 top-1/4 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                <PenTool size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;