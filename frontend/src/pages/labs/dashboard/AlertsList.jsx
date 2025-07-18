// import React from 'react';
// import { AlertTriangle } from 'lucide-react';

// const alerts = [
//   "Critical Blood Work - Patient ID: 4829",
//   "Sample #BS-2024-0156 Expires In 1 Hour",
//   "Toxicology Report Needed ASAP - ID: 9847",
//   "Urine Sample Batch #UR-445 Expired",
//   "Cardiac Enzymes – Emergency Case",
// ];

// const AlertsList = () => (
//   <div className="bg-white shadow-md p-4 rounded-xl flex flex-col gap-3 mr-4 hover:shadow-2xl transition-shadow duration-300 border border-grey-100">
//     <h3 className="font-bold mb-2">Alerts</h3>
//     <ul className="space-y-2">
//       {alerts.map((alert, i) => (
//         <li key={i} className="bg-red-50 border border-red-200 p-2 rounded-md text-sm text-red-800 flex items-center gap-2">
//           <span><AlertTriangle className="w-5 h-5 text-red-500" />
// </span>
//           {alert}
//         </li>
//       ))}
//     </ul>
//   </div>
// );

// export default AlertsList;


import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

const alerts = [
  { message: "Critical Blood Work - Patient ID: 4829", timeStatus: "2 Min Ago" },
  { message: "Sample #BS-2024-0156", timeStatus: "Expires in 1 Hour" },
  { message: "Toxicology Report Needed ASAP - ID: 9847", timeStatus: "2 Min Ago" },
  { message: "Urine Sample Batch #UR-445", timeStatus: "Expired" },
  { message: "Cardiac Enzymes – Emergency Case", timeStatus: "2 Min Ago" },
];

const AlertsList = () => (
  <div className="bg-white shadow-md p-4 rounded-xl flex flex-col gap-3 mr-4 hover:shadow-2xl transition-shadow duration-300 border border-grey-100">
    <h3 className="font-bold mb-2">Alerts</h3>
    <ul className="space-y-2">
      {alerts.map((alert, i) => (
        <li key={i} className="bg-red-50 p-3 rounded-md text-sm text-red-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
          {/* Left: Alert icon + Message */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className='text-gray-600 font-bold'>{alert.message}</span>
          </div>

          {/* Right: Timer icon + status */}
          <div className="flex items-center gap-1 text-red-400 text-xs mt-1 sm:mt-0">
            <Clock className="w-4 h-4" />
            <span>{alert.timeStatus}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default AlertsList;
