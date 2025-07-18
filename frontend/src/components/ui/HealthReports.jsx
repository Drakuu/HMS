import React from 'react';
import { MoreVertical, FileText, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/buttonVariants';

const HealthReports = ({ reports }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Health Reports</h3>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {reports.map((report, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center">
              <div className="bg-teal-50 p-2 rounded-md">
                <FileText className="h-5 w-5 text-teal-500" />
              </div>
              <div className="ml-3">
                <p className="font-medium">{report.name}</p>
                <p className="text-xs text-gray-500">{report.size}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthReports;
