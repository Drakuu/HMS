import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '../../components/ui/buttonVariants';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';

const PatientInfo = ({ name, id, status, avatarSrc }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
              <Badge className="bg-medical-blue text-white">{status}</Badge>
            </div>
            <p className="text-gray-500">Patient ID: {id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <MessageCircle className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <Phone className="h-5 w-5 text-gray-600" />
          </Button>
          <Button className="bg-medical-blue hover:bg-primary-700 text-white">
            Edit Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
