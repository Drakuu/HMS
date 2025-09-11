// components/ActionButtons.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonGroup } from '../../../../components/common/Buttons';
import { AiOutlineSave, AiOutlinePrinter } from "react-icons/ai";
import { getRoleRoute } from '../../../../utils/getRoleRoute';

const ActionButtons = ({
   mode,
   isSubmitting,
   onSave,
   onSubmit,
   onPrint,
}) => {
   const navigate = useNavigate();

   return (
      <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
         <Button
            variant="secondary"
            onClick={() => navigate(getRoleRoute('/OPD/manage'))}
            disabled={isSubmitting}
         >
            Cancel
         </Button>

         <ButtonGroup>
            <Button
               type="button"
               variant="success"
               onClick={onSave}
               disabled={isSubmitting}
               icon={AiOutlineSave}
            >
               {isSubmitting ? 'Saving...' : mode === "create" ? 'Save Only' : 'Update Only'}
            </Button>
            {/* <Button
               type="submit"
               onClick={onSubmit}
               disabled={isSubmitting}
               icon={AiOutlinePrinter}
            >
               {isSubmitting ? 'Processing...' : mode === "create" ? 'Save & Print' : 'Update & Print'}
            </Button> */}
         </ButtonGroup>
      </div>
   );
};

export default ActionButtons;