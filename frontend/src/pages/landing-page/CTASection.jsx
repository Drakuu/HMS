import React from "react";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-900 to-primary-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your design process?</h2>
          <p className="text-xl mb-8 text-primary-100">Join thousands of designers who are creating better experiences with data-driven insights.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="#" className="bg-white text-primary-700 hover:bg-gray-100 transition-colors py-3 px-8 rounded-md font-medium">Start Free Trial</a>
            <a href="#" className="border border-white hover:bg-white hover:text-primary-700 transition-colors py-3 px-8 rounded-md font-medium">Schedule Demo</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;