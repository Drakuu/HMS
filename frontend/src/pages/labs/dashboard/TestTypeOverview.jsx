import React from 'react';

const data = [
  { type: 'Blood Chemistry', color: 'red-500', completed: 12, pending: 5 },
  { type: 'Microbiology', color: 'green-500', completed: 20, pending: 3 },
  { type: 'Hematology', color: 'purple-500', completed: 15, pending: 2 },
  { type: 'Toxicology', color: 'pink-500', completed: 9, pending: 4 },
  { type: 'Immunology', color: 'yellow-500', completed: 7, pending: 1 }
];

const TestTypeOverview = () => (
  <div className="bg-white shadow-md p-4 ml-4 rounded-xl flex flex-col gap-3 hover:shadow-2xl transition-shadow duration-300 border">
    <h3 className="font-bold text-lg mb-4">Test Types Overview</h3>
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.type} className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-${item.color}`}></span>
            <p className="font-medium">{item.type}</p>
          </div>

            {/* Completed Record */}
            <div>
              <p className="text-gray-500 font-bold">Completed</p>
              <p className="text-green-600 font-bold">{item.completed}</p>
            </div>

            {/* Pending Record */}
            <div>
              <p className="text-gray-500 font-bold">Pending</p>
              <p className="text-yellow-500 font-bold">{item.pending}</p>
            </div>
            <div className={`h-2 w-full rounded-full bg-${item.color}`}></div>  {/*time bar*/}

          
        </div>
      ))}
    </div>
  </div>
);

export default TestTypeOverview;
