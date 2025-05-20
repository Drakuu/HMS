import React from 'react';

const FilterList = ({
  entriesPerPage,
  setEntriesPerPage,
  entriesPerPageOptions,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center  px-2 gap-4">
      <div className="flex items-center space-x-2 text-sm">
        <label>Show</label>
        <select
          value={entriesPerPage}
          onChange={(e) => {
            setEntriesPerPage(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring"
        >
          {entriesPerPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span>entries</span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 text-sm rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FilterList;
