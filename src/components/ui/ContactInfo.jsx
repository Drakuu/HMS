import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from './buttonVariants';

const ContactInfo = ({ phone, email, address, emergency }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Contact Info</h3>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Phone Number</p>
          <p className="font-medium">{phone}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{email}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium">{address.street}</p>
          <p className="font-medium">{address.city}, {address.state}, {address.country}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Emergency Contact</p>
          <p className="font-medium">{emergency.name} - {emergency.relationship}</p>
          <p className="font-medium">{emergency.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
