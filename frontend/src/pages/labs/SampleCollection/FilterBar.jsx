// components/FilterBar.jsx
import React from 'react';

const FilterBar = () => (
  <div className="flex justify-between items-center mt-4 mb-2">
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search by patient name, test ID, type"
        className="border px-3 py-1 rounded w-80"
      />
      <select className="border px-2 py-1 rounded">
        <option>Routine</option>
        <option>STAT</option>
      </select>
    </div>
    <div className="flex gap-2">
      <button className="bg-emerald-500 text-white px-3 py-1 rounded">Collect All</button>
      <button className="bg-indigo-500 text-white px-3 py-1 rounded">Print Barcodes</button>
      <button className="bg-gray-400 text-white px-3 py-1 rounded">Export</button>
    </div>
  </div>
);

export default FilterBar;
