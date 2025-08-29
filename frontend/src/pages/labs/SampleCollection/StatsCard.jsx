// components/StatsGrid.jsx
import React from 'react';
import { RotateCcw, CheckCircle, Timer, AlertCircle } from 'lucide-react';

const getCardDetails = (title) => {
  switch (title.toLowerCase()) {
    case 'pending collections':
      return {
        icon: <Timer className="w-10 h-10 text-yellow-500" />,
        color: 'text-yellow-500',
        description: 'Awaiting Processing',
      };
    case 'collected today':
      return {
        icon: <CheckCircle className="w-10 h-10 text-green-600" />,
        color: 'text-green-600',
        description: 'Tests Collected Successfully',
      };
    case 're-collections':
      return {
        icon: <AlertCircle className="w-10 h-10 text-red-500" />,
        color: 'text-red-500',
        description: 'Requires Re-Sampling',
      };
    case 'stat priority':
      return {
        icon: <RotateCcw className="w-10 h-10 text-pink-600" />,
        color: 'text-pink-600',
        description: 'Handle Immediately',
      };
    default:
      return {
        icon: '📊',
        color: 'text-gray-500',
        description: '',
      };
  }
};

const StatCard = ({ title, count }) => {
  const { icon, color, description } = getCardDetails(title);

  return (
    <div className="bg-white shadow-md p-4 rounded-xl flex flex-col gap-3 hover:shadow-2xl transition-shadow duration-300 border">
      <div className="flex justify-between">
        <h2 className={`text-4xl font-bold ${color}`}>{count}</h2>
        <div className="text-4xl">{icon}</div>
      </div>
      <p className="text-lg text-gray-600">{title}</p>
      <span className={`text-sm font-medium ${color}`}>{description}</span>
    </div>
  );
};

const StatsGrid = () => {
  const stats = [
    { title: 'Pending Collections', count: 4 },
    { title: 'Collected Today', count: 8 },
    { title: 'Re-Collections', count: 2 },
    { title: 'STAT Priority', count: 5 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {stats.map((stat, i) => (
        <StatCard key={i} title={stat.title} count={stat.count} />
      ))}
    </div>
  );
};

export default StatsGrid;
