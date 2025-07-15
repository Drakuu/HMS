import React from "react";

const SummaryCard = ({ label, value, color }) => {
  return (
    <div className="bg-white shadow rounded-md px-6 py-4 text-center w-full">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
};


const StatsCard = () => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total Earnings (All)" value="PKR 1,450" color="text-green-600" />
        <SummaryCard label="Total Earnings (Today)" value="PKR 450" color="text-green-600" />
        <SummaryCard label="Refunds (All)" value="PKR 150" color="text-yellow-500" />
        <SummaryCard label="Refunds (Today)" value="PKR 250" color="text-yellow-500" />
      </div>
    </div>
  )
}

export default StatsCard
