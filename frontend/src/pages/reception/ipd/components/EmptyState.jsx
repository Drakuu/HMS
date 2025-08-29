import React from 'react';

const EmptyState = ({ searchTerm, dateRange, handleResetFilters }) => {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">No patients found</h3>
      <p className="mt-2 text-gray-500">
        {searchTerm || (dateRange.start && dateRange.end) 
          ? 'No patients match your search criteria.' 
          : 'No patients are currently admitted.'}
      </p>
      <div className="mt-6">
        <button
          onClick={handleResetFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
};

export default EmptyState;