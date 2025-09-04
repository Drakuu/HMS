import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const PatientSearchBar = ({ onSearch, onClear, isSearching }) => {
   const [searchTerm, setSearchTerm] = useState('');

   const handleSubmit = (e) => {
      e.preventDefault();
      if (searchTerm.trim()) {
         onSearch(searchTerm);
      }
   };

   const handleClear = () => {
      setSearchTerm('');
      onClear();
   };

   return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
         <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
               Search Existing Patient
            </h3>
            <span className="text-sm text-gray-500">
               Search by MR Number, Contact, or CNIC
            </span>
         </div>

         <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
               </div>
               <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter MR Number, phone number, or CNIC..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={isSearching}
               />
               {searchTerm && (
                  <button
                     type="button"
                     onClick={handleClear}
                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                     <FaTimes className="text-gray-400 hover:text-gray-600" />
                  </button>
               )}
            </div>
            <button
               type="submit"
               disabled={isSearching || !searchTerm.trim()}
               className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isSearching ? 'Searching...' : 'Search'}
            </button>
         </form>

         <div className="mt-2 text-xs text-gray-500">
            <p>Examples: MR-2024-001, 0300-1234567, 12345-6789012-3</p>
         </div>
      </div>
   );
};

export default PatientSearchBar;