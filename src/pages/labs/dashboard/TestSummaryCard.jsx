import React from 'react';
import { FlaskConical, CheckCircle, Timer, AlertCircle} from 'lucide-react';



const getCardDetails = (title) => {
  switch (title.toLowerCase()) {
    case 'pending':
      return {
        icon: <Timer className="w-10 h-10 text-blue-500" />,
        color: 'text-yellow-500',
        description: 'Awaiting Processing',
      };
    case 'completed':
      return {
        icon: <CheckCircle className="w-10 h-10 text-blue-500" />,
        color: 'text-green-500',
        description: 'Tests Completed Successfully',
      };
    case 'urgent':
      return {
        icon: <AlertCircle className="w-10 h-10 text-red-400" />,
        color: 'text-red-500',
        description: 'Requires Immediate Attention',
      };
    case 'total tests today':
      return {
        icon: <FlaskConical className="w-10 h-10 text-blue-500" />,
        color: 'text-blue-500',
        description: '↑ 12% from last week',
      };
    default:
      return {
        icon: '📊',
        color: 'text-gray-500',
        description: '',
      };
  }
};

const Card = ({ title, value }) => {
  const { icon, color, description } = getCardDetails(title);

  return (
    <div className="bg-white shadow-md p-4 rounded-xl flex flex-col gap-3 hover:shadow-2xl transition-shadow duration-300 border">
        <div className='flex justify-between'>
            <h2 className={`text-4xl font-bold ${color}`}>{value}</h2>
            <div className="text-4xl">{icon}</div>
        </div>
      <p className="text-lg text-gray-600">{title}</p>
      <span className={`text-sm font-medium ${color}`}>{description}</span>
    </div>
  );
};


const TestSummaryCard = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <Card title="Total Tests Today" value="450" />
      <Card title="Completed" value="318" />
      <Card title="Pending" value="92" />
      <Card title="Urgent" value="40" />
    </div>
  );
};

export default TestSummaryCard;
