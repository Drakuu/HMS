import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage = 1, totalPages = 1, totalItems = 0, onPageChange }) => {
   if (totalPages <= 1) return null;

   const pages = [];
   const maxVisiblePages = 5;

   let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
   let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

   if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
   }

   for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
   }

   return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
         <div className="flex justify-between flex-1 sm:hidden">
            <button
               onClick={() => onPageChange(currentPage - 1)}
               disabled={currentPage === 1}
               className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               Previous
            </button>
            <button
               onClick={() => onPageChange(currentPage + 1)}
               disabled={currentPage === totalPages}
               className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               Next
            </button>
         </div>

         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
               <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 20, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
               </p>
            </div>
            <div>
               <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                     onClick={() => onPageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <span className="sr-only">Previous</span>
                     <FiChevronLeft className="w-5 h-5" />
                  </button>

                  {pages.map((page) => (
                     <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === page
                              ? 'z-10 bg-primary-600 border-primary-600 text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                           } border`}
                     >
                        {page}
                     </button>
                  ))}

                  <button
                     onClick={() => onPageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <span className="sr-only">Next</span>
                     <FiChevronRight className="w-5 h-5" />
                  </button>
               </nav>
            </div>
         </div>
      </div>
   );
};

export default Pagination;