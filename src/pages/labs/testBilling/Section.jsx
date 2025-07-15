import React from 'react';

const Section = ({ title, children }) => (
  <div className="mt-6 px-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div className="mt-2">{children}</div>
  </div>
);

export default Section;
