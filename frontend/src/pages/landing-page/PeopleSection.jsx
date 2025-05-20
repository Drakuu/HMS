import React from "react";
import { ArrowRight } from "lucide-react";

const PeopleSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div>
            <div className="text-sm text-primary-600 font-medium mb-2">The Difference Makers</div>
            <h2 className="text-3xl font-bold mb-4">In World of Technology, People Make The Difference</h2>
            <p className="text-gray-600 mb-6">Our key value is that we prioritize with talent and expertise that make DesignMetrics stand out from the competition.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-bold text-primary-600 text-xl mb-1">92%</div>
                <div className="text-sm text-gray-600">Customer satisfaction rate</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-bold text-primary-600 text-xl mb-1">4.8</div>
                <div className="text-sm text-gray-600">Average rating from users</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-bold text-primary-600 text-xl mb-1">24/7</div>
                <div className="text-sm text-gray-600">Support available</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-bold text-primary-600 text-xl mb-1">100+</div>
                <div className="text-sm text-gray-600">Expert team members</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <button className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium mr-4">
                Meet Our Team
              </button>
              <a href="#" className="text-primary-600 font-medium flex items-center">
                Learn More <ArrowRight className="ml-1" size={16} />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-primary-100 p-5 rounded-xl h-40"></div>
              <div className="bg-blue-100 p-5 rounded-xl h-56"></div>
            </div>
            <div className="space-y-4 mt-6">
              <div className="bg-pink-100 p-5 rounded-xl h-56"></div>
              <div className="bg-green-100 p-5 rounded-xl h-40"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PeopleSection;