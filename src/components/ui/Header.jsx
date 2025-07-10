import React from 'react';
import { ArrowLeft, Settings, Bell } from 'lucide-react';
import { Button } from './buttonVariants';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

const Header = ({ userName, userInitials, avatarSrc }) => {
  return (
    <header className="w-full bg-white py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Back to Patient List</span>
          <h1 className="text-2xl font-bold">Patient Details</h1>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
          <Settings className="h-5 w-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={avatarSrc} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-semibold">{userName}</span>
            <button className="text-xs text-gray-500">
              <span>▼</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
