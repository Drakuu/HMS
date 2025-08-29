import React from 'react';
import { MoreVertical, Calendar } from 'lucide-react';
import { Button } from './buttonVariants';
import { Badge } from './badge';

const Appointments = ({ appointments, title = "Appointment" }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-md font-medium">Upcoming</h4>

        {appointments.map((appointment, index) => (
          <div key={index} className="border-b pb-4 last:border-0 mt-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">{appointment.type}</span>
                  <Badge
                    className={`
                      ${appointment.status === 'completed' ? 'bg-primary-100 text-primary-800' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'}
                    `}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>
                <p className="font-semibold text-lg mt-1">Dr. {appointment.doctor.name}</p>
                {appointment.doctor.specialty && (
                  <p className="text-sm text-gray-500">{appointment.doctor.specialty}</p>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <div>
                  <p>{appointment.date}</p>
                  <p>{appointment.time}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
