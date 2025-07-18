import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

const MembershipCard = ({
  hospitalName,
  membershipType,
  patientName,
  patientId,
  validUntil,
  hospitalLogo,
  patientAvatar
}) => {
  return (
    <div className="bg-medical-blue text-white rounded-lg p-6 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-6">
          <div className="bg-white p-2 rounded-md">
            {hospitalLogo ? (
              <img src={hospitalLogo} alt={hospitalName} className="h-6 w-6" />
            ) : (
              <div className="h-6 w-6 bg-medical-teal rounded-full flex items-center justify-center text-medical-blue font-bold">
                W
              </div>
            )}
          </div>
          <span className="ml-2 font-semibold">{hospitalName}</span>
        </div>

        <div className="bg-medical-highlight bg-opacity-20 rounded-md p-3 mb-6">
          <span className="font-semibold text-teal-300">{membershipType}</span>
        </div>

        <div className="flex items-center space-x-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={patientAvatar} />
            <AvatarFallback>{patientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm">{patientName} | {patientId}</p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <p className="text-xs text-gray-300">Valid till {validUntil}</p>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
