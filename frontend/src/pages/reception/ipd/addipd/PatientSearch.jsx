// components/PatientSearch.js
import React from 'react';
import { InputField } from "../../../../components/common/FormFields";
import { Button } from "../../../../components/common/Buttons";

const PatientSearch = ({
   mrNo,
   setMrNo,
   handleSearch,
   isLoading,
   isSearching
}) => {
   const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
         e.preventDefault();
         handleSearch(e);
      }
   };

   return (
      <div className="mb-8 bg-primary-50 p-4 rounded-lg">
         <div className="flex items-center mb-4">
            <div className="h-8 w-1 bg-primary-600 mr-3 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">
               Search Patient
            </h2>
         </div>
         <div className="flex items-center gap-4">
            <InputField
               name="search"
               type="text"
               value={mrNo}
               onChange={(e) => setMrNo(e.target.value)}
               onKeyDown={handleKeyDown} // Add this line
               placeholder="Enter MR Number and press Enter or click Search"
               icon="idCard"
               fullWidth
               required
               disabled={isLoading || isSearching}
            />
            <Button
               onClick={handleSearch}
               variant="primary"
               className="whitespace-nowrap"
               disabled={isLoading || isSearching}
               isLoading={isSearching}
            >
               {isSearching ? "Searching..." : "Search"}
            </Button>
         </div>
      </div>
   );
};

export default PatientSearch;