// components/FormActions.js
import React from 'react';
import { Button, ButtonGroup } from "../../../../components/common/Buttons";

const FormActions = ({
   onCancel,
   onSubmit,
   onSaveAndPrint,
   isSubmitting
}) => {
   return (
      <div className="flex justify-between pt-4 border-t border-gray-200">
         <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
         >
            Cancel
         </Button>
         <ButtonGroup>
            <Button
               type="submit"
               variant="primary"
               isSubmitting={isSubmitting}
               onClick={onSubmit}
            >
               Save Admission
            </Button>
            <Button
               type="button"
               variant="success"
               onClick={onSaveAndPrint}
               isSubmitting={isSubmitting}
            >
               Save & Print
            </Button>
         </ButtonGroup>
      </div>
   );
};

export default FormActions;