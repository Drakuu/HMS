import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from './buttonVariants';

const GeneralInfo = ({ gender, age, dob, occupation, insurance }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">General Info</h3>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Gender</p>
          <p className="font-medium">{gender}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-500">Occupation</p>
          <p className="font-medium">{occupation}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-500">Age</p>
          <p className="font-medium">{age}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-500">Insurance</p>
          <p className="font-medium">{insurance}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-500">Date of Birth</p>
          <p className="font-medium">{dob}</p>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfo;
