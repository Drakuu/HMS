import React from 'react';
import { Ruler, Weight, Heart, Activity, Droplets, AirVent } from 'lucide-react';

const MedicalInfo = ({ metrics }) => {
  const medicalMetrics = [
    {
      label: "Body Height",
      value: metrics.height,
      icon: <Ruler className="h-5 w-5 text-teal-500" />,
    },
    {
      label: "Body Weight",
      value: metrics.weight,
      icon: <Weight className="h-5 w-5 text-teal-500" />,
    },
    {
      label: "Body Mass Index",
      value: metrics.bmi,
      icon: <Weight className="h-5 w-5 text-teal-500" />,
    },
    {
      label: "Heart Rate",
      value: metrics.heartRate,
      icon: <Heart className="h-5 w-5 text-teal-500" />,
    },
    {
      label: "Blood Pressure",
      value: metrics.bloodPressure,
      icon: <Activity className="h-5 w-5 text-teal-500" />,
    },
    {
      label: "Blood Sugar",
      value: metrics.bloodSugar,
      icon: <Droplets className="h-5 w-5 text-teal-500" />,
    },
    {
      label: "Cholesterol",
      value: metrics.cholesterol,
      icon: <Droplets className="h-5 w-5 text-teal-500" />,
    },
    {
      label: "Respiratory",
      value: metrics.respiratory,
      icon: <AirVent className="h-5 w-5 text-teal-500" />,
    },
    {
      label: "Hemoglobin",
      value: metrics.hemoglobin,
      icon: <Droplets className="h-5 w-5 text-teal-500" />,
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Medical Info</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {medicalMetrics.map((metric, index) => (
          <div key={index} className="flex">
            <div className="bg-teal-50 p-3 rounded-lg">
              {metric.icon}
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="font-semibold">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalInfo;
