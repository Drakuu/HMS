import React from 'react';

const SampleTable = ({ data }) => {
  const handleCollectSample = (id) => {
    alert(`Collecting sample for ID: ${id}`);
    // You can add real logic here
  };

  const handleRecollectionRequest = (id) => {
    alert(`Requesting recollection for ID: ${id}`);
    // You can add real logic here
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Patient</th>
            <th className="p-3">Doctor</th>
            <th className="p-3">Specialization</th>
            <th className="p-3">Test Type</th>
            <th className="p-3">Urgency</th>
            <th className="p-3">Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((sample, index) => (
            <tr key={index} className="border-t">
              <td className="p-3">{sample.id}</td>
              <td className="p-3">{sample.patient}</td>
              <td className="p-3">{sample.doctor}</td>
              <td className="p-3">{sample.specialization}</td>
              <td className="p-3">{sample.testType}</td>
              <td className="p-3">{sample.urgency}</td>
              <td className="p-3">{sample.date}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => handleCollectSample(sample.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Collect
                </button>
                <button
                  onClick={() => handleRecollectionRequest(sample.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Re-Collect
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="8" className="p-4 text-center text-gray-500">
                No matching records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SampleTable;
