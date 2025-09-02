import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { FormSection } from '../../../../components/common/FormSection';
import QualificationsList from '../../../../components/Display/QualificationsList';

const DoctorQualifications = ({
   qualificationInput,
   setQualificationInput,
   formData,
   handleAddQualification,
   handleRemoveQualification
}) => {
   return (
      <FormSection title="Qualifications">
         <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-primary-600" />
               </div>
               <input
                  type="text"
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  placeholder="Add Qualification"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
               />
            </div>
            <button
               type="button"
               onClick={handleAddQualification}
               className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
               Add
            </button>
         </div>
         <QualificationsList
            items={formData.doctor_Qualifications}
            onRemove={handleRemoveQualification}
         />
      </FormSection>
   );
};

export default DoctorQualifications;