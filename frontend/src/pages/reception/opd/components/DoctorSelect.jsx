import React from 'react';
import Select from 'react-select';
import { FaUserMd } from "react-icons/fa";

const DoctorSelect = ({
   doctorsStatus,
   doctorOptions,
   selectedDoctor,
   onDoctorChange
}) => {
   return (
      <div className="space-y-1 mb-6">
         <label className="block text-sm font-medium text-gray-700">
            Consulting Doctor
         </label>
         <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
               <FaUserMd className="text-primary-600" />
            </div>
            <Select
            // required={true}
               options={doctorOptions}
               value={selectedDoctor}
               onChange={onDoctorChange}
               className="react-select-container"
               classNamePrefix="react-select"
               placeholder="Select Doctor"
               isDisabled={doctorsStatus === 'loading'}
               isLoading={doctorsStatus === 'loading'}
               isClearable={true}
               noOptionsMessage={() =>
                  doctorsStatus === 'loading' ? 'Loading doctors...' : 'No doctors found'
               }
               styles={{
                  control: (base) => ({
                     ...base,
                     paddingLeft: '40px',
                     minHeight: '44px'
                  })
               }}
            />
         </div>
      </div>
   );
};

export default DoctorSelect;