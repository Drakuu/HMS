import React from 'react';
import { FiHome } from 'react-icons/fi';
import { BiBed } from 'react-icons/bi';

const WardTypeTabs = ({ activeTab, setActiveTab, wardTypes }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all-admitted')}
          className={`px-4 py-2 mr-2 rounded-lg font-medium whitespace-nowrap flex items-center ${activeTab === 'all-admitted'
            ? 'bg-primary-100 text-primary-700 border border-primary-300'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
        >
          <FiHome className="mr-2" /> All Admitted
        </button>
        {wardTypes.map(ward => (
          <button
            key={ward}
            onClick={() => setActiveTab(ward.toLowerCase())}
            className={`px-4 py-2 mr-2 rounded-lg font-medium whitespace-nowrap flex items-center ${activeTab === ward.toLowerCase()
              ? 'bg-primary-100 text-primary-700 border border-primary-300'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            <BiBed className="mr-2" /> {ward}
          </button>
        ))}
      </div>
      <button
        onClick={() => setActiveTab('all-discharge')}
        className={`px-4 py-2 mr-2 rounded-lg font-medium whitespace-nowrap flex items-center ${activeTab === 'all-discharge'
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
      >
        <FiHome className="mr-2" /> All Discharged
      </button>
    </div>
  );
};

export default WardTypeTabs;