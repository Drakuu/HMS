import React from "react";

const StatsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">5.8k+</div>
            <p className="text-primary-300">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">A+</div>
            <p className="text-primary-300">Customer Rating</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">97%</div>
            <p className="text-primary-300">Satisfaction Rate</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
            <p className="text-primary-300">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;