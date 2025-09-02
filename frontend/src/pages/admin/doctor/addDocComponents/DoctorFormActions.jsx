import React from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorFormActions = ({ status, isEditMode, onSubmit }) => {
   const navigate = useNavigate();

   const submitText = isEditMode ? "Update Doctor" : "Register Doctor";
   const loadingText = isEditMode ? "Updating..." : "Processing...";

   return (
      <div className="flex justify-between pt-6 border-t border-gray-200">
         <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
         >
            Cancel
         </button>

         <button
            type="submit"
            disabled={status === 'loading'}
            onClick={onSubmit}
            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
         >
            {status === 'loading' ? (
               <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {loadingText}
               </span>
            ) : (
               submitText
            )}
         </button>
      </div>
   );
};

export default DoctorFormActions;