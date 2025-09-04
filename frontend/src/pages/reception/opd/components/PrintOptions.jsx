import React from 'react';
import { RadioGroup } from '../../../../components/common/FormFields';
import { AiOutlinePrinter, AiOutlineFileText } from "react-icons/ai";

const PrintOptions = ({ formData, handleChange }) => {
   return (
      <div className="space-y-4 border-t pt-4 mb-6">
         <RadioGroup
            name="printOption"
            label="Print Options"
            value={formData.printOption}
            onChange={handleChange}
            options={[
               { value: "thermal", label: "Thermal Slip", icon: AiOutlinePrinter },
               { value: "a4", label: "A4 Form", icon: AiOutlineFileText },
               { value: "pdf", label: "PDF", icon: AiOutlineFileText }
            ]}
         />
      </div>
   );
};

export default PrintOptions;