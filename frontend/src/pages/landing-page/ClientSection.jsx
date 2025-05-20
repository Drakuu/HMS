import React from "react";

const ClientsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-600 mb-8">Trusted by leading companies worldwide</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {['Github', 'Twitter', 'Airbnb', 'Slack', 'Google'].map((client, index) => (
            <div key={index} className="flex items-center rounded-lg py-2 px-5">
              <span className="font-bold text-4xl bg-gradient-to-l from-primary-800 to-indigo-900 text-transparent bg-clip-text">
                {client}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;
