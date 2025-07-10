import React from 'react';
import { Button } from '../../components/ui/buttonVariants';  

const PatientNotes = ({ notes, lastUpdated }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Patient Notes</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Last Updated on: {lastUpdated}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span>···</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">View All</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {notes.map((note, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">{note.date}</p>
              <h4 className="font-semibold mt-1 mb-2">{note.title}</h4>
              <p className="text-sm text-gray-600">{note.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientNotes;
