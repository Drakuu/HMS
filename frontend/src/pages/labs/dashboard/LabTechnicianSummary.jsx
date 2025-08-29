import React from 'react';

const technicians = [
  { name: "Dr. James Smith", status: "Break", tests: 12, efficiency: 76, performance: 68 },
  { name: "Dr. Emily Johnson", status: "Active", tests: 30, efficiency: 88, performance: 90 },
  { name: "Dr. Michael Brown", status: "Active", tests: 19, efficiency: 82, performance: 79 },
  { name: "Dr. Linda Davis", status: "Break", tests: 25, efficiency: 70, performance: 75 },
  { name: "Dr. Robert Garcia", status: "Active", tests: 28, efficiency: 91, performance: 92 },
  { name: "Dr. Patricia Martinez", status: "Off", tests: 10, efficiency: 65, performance: 60 },
];

const LabTechnicianSummary = () => (
  <div className="bg-white p-4 border mx-4 mt-4 rounded-md shadow-md">
    <h3 className="font-bold mb-4">Lab Technician Summary</h3>
    <table className="w-full text-sm">
      <thead>
  <tr className="text-left border-b border-gray-500 ">
    <th className="py-3">Technician</th>
    <th className="py-3">Status</th>
    <th className="py-3">Tests Today</th>
    <th className="py-3">Efficiency</th>
    <th className="py-3">Performance</th>
  </tr>
</thead>
<tbody>
  {technicians.map((tech, i) => (
    <tr key={i} className="border-b border-gray-500">
      <td className="py-3">{tech.name}</td>
      <td className="py-3">
        <span className={`px-2 py-1 text-xs rounded-md ${
          tech.status === 'Active' ? 'bg-green-100 text-green-600' :
          tech.status === 'Break' ? 'bg-yellow-100 text-yellow-600' :
          'bg-gray-100 text-gray-500'
        }`}>{tech.status}</span>
      </td>
      <td className="py-3">{tech.tests}</td>
      <td className="py-3">{tech.efficiency}%</td>
      <td className="py-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${tech.performance}%` }}></div>
        </div>
        <span className="text-xs text-gray-600 ml-1">{tech.performance}%</span>
      </td>
    </tr>
  ))}
</tbody>

    </table>
  </div>
);

export default LabTechnicianSummary;
