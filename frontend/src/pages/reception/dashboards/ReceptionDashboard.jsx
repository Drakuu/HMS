import { useState,useEffect } from 'react';
import {
  FaUserInjured,
  FaCalendarAlt,
  FaBed,
  FaUserMd,
  FaChartLine,
  FaPlus,
  FaFilter,
  FaMoneyBillWave,
  FaHospital,
  FaStethoscope,
  FaPercentage,
  FaMobile
} from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


const HospitalDashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    beds: 0,
    availableBeds: 0,
    doctors: 0,
    emergencies: 0,
    occupancyRate: 0,
    revenue: 0,
    avgStay: 0,
    opdRevenue: 0,
    hospitalCut: 0,
    doctorCut: 0,
    ipdRevenue: 0,
    procedures: 0,
    averageOpdCharge: 0,
    averageIpdCharge: 0
  });

  const [editingCut, setEditingCut] = useState(false);
  const [tempCut, setTempCut] = useState(stats.hospitalCut);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate financial splits
  const hospitalOpdRevenue = (stats.opdRevenue * stats.hospitalCut / 100).toFixed(2);
  const doctorOpdRevenue = (stats.opdRevenue * stats.doctorCut / 100).toFixed(2);

  const handleCutChange = (e) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    setTempCut(value);
  };

  const saveCutChanges = () => {
    setStats({
      ...stats,
      hospitalCut: tempCut,
      doctorCut: 100 - tempCut
    });
    setEditingCut(false);
  };

  // Chart data
  const revenueSplitData = {
    labels: ['Hospital', 'Doctor'],
    datasets: [
      {
        data: [stats.hospitalCut, stats.doctorCut],
        backgroundColor: ['#0d9488', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const revenueStreamData = {
    labels: ['Hosp. OPD', 'Dr. OPD', 'IPD'],
    datasets: [
      {
        label: 'Revenue (PKR)',
        data: [hospitalOpdRevenue, doctorOpdRevenue, stats.ipdRevenue],
        backgroundColor: ['#0d9488', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const departmentRevenueData = {
    labels: ['Cardio', 'Neuro', 'Ortho', 'Peds', 'Onco'],
    datasets: [
      {
        label: 'Revenue (PKR)',
        data: [45000, 32000, 28000, 38000, 42000],
        backgroundColor: '#3b82f6',
        borderWidth: 0,
      },
    ],
  };

  // Sample data
  const recentAppointments = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. S. Johnson', time: '10:30 AM', status: 'Confirmed', type: 'OPD', fee: 150 },
    { id: 2, patient: 'Maria Garcia', doctor: 'Dr. R. Chen', time: '11:15 AM', status: 'Confirmed', type: 'OPD', fee: 180 },
    { id: 3, patient: 'David Wilson', doctor: 'Dr. E. Davis', time: '1:45 PM', status: 'Pending', type: 'IPD', fee: 2000 },
    { id: 4, patient: 'Lisa Brown', doctor: 'Dr. M. Taylor', time: '2:30 PM', status: 'Confirmed', type: 'OPD', fee: 120 },
  ];

  // Mobile optimized chart options
  const mobileChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        bodyFont: {
          size: 10
        },
        titleFont: {
          size: 10
        },
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}% (PKR ${(stats.opdRevenue * context.raw / 100).toLocaleString()})`;
          }
        }
      }
    }
  };

  const desktopChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}% (PKR ${(stats.opdRevenue * context.raw / 100).toLocaleString()})`;
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Mobile Warning Banner (only shows on mobile) */}
      {isMobile && (
        <div className="bg-primary-100 text-primary-800 p-2 text-sm flex items-center justify-center">
          <FaMobile className="mr-2" />
          Viewing on mobile - some elements are simplified for better experience
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <main className="max-w-9xl mx-auto p-3 sm:p-4 lg:p-6">
          {/* Stats Cards - First Row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <StatCard 
              icon={<FaUserInjured className="text-primary-500 text-lg sm:text-xl" />} 
              title={isMobile ? "Patients" : "Total Patients"} 
              value={stats.patients.toLocaleString()} 
              trend="up" 
              change="12%"
              bgColor="bg-primary-50"
              isMobile={isMobile}
            />
            <StatCard 
              icon={<FaCalendarAlt className="text-green-500 text-lg sm:text-xl" />} 
              title={isMobile ? "Appointments" : "Today's Appointments"} 
              value={stats.appointments} 
              trend="up" 
              change="5%"
              bgColor="bg-green-50"
              isMobile={isMobile}
            />
            <StatCard 
              icon={<FaBed className="text-purple-500 text-lg sm:text-xl" />} 
              title={isMobile ? "Beds" : "Available Beds"} 
              value={stats.availableBeds} 
              trend="down" 
              change="8%"
              bgColor="bg-purple-50"
              isMobile={isMobile}
            />
            <StatCard 
              icon={<FaUserMd className="text-orange-500 text-lg sm:text-xl" />} 
              title={isMobile ? "Doctors" : "Active Doctors"} 
              value={stats.doctors} 
              trend="up" 
              change="3%"
              bgColor="bg-orange-50"
              isMobile={isMobile}
            />
          </div>

          {/* Stats Cards - Second Row (Financial) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <StatCard 
              icon={<FaMoneyBillWave className="text-indigo-500 text-lg sm:text-xl" />} 
              title={isMobile ? "OPD Rev" : "OPD Revenue"} 
              value={`PKR ${isMobile ? stats.opdRevenue.toLocaleString().slice(0, -3) + 'K' : stats.opdRevenue.toLocaleString()}`} 
              trend="up" 
              change="8%"
              bgColor="bg-indigo-50"
              isMobile={isMobile}
            />
            
            <div className="bg-teal-50 p-3 sm:p-4 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{isMobile ? "Hosp. Share" : "Hospital Share"}</p>
                  <div className="flex items-center mt-1">
                    {editingCut ? (
                      <input
                        type="number"
                        value={tempCut}
                        onChange={handleCutChange}
                        className={`${isMobile ? 'w-12' : 'w-16'} text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 border-b border-teal-600 bg-transparent`}
                        min="0"
                        max="100"
                      />
                    ) : (
                      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{stats.hospitalCut}%</p>
                    )}
                    <button 
                      onClick={() => editingCut ? saveCutChanges() : setEditingCut(true)}
                      className="ml-1 sm:ml-2 text-teal-600 hover:text-teal-800"
                    >
                      {editingCut ? <FaCheck /> : <FaPercentage className="text-sm sm:text-base" />}
                    </button>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg font-medium mt-1">
                    PKR {isMobile ? hospitalOpdRevenue.slice(0, -3) + 'K' : hospitalOpdRevenue}
                  </p>
                </div>
                <div className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10 sm:h-12 sm:w-12'} rounded-full bg-white flex items-center justify-center shadow-sm`}>
                  <FaHospital className={`${isMobile ? 'text-base' : 'text-lg sm:text-xl'} text-teal-500`} />
                </div>
              </div>
              <div className="mt-2 sm:mt-4 flex items-center text-green-600">
                <FaChartLine className="text-xs sm:text-sm mr-1" />
                <span className="text-xs sm:text-sm font-medium">
                  PKR {Math.round(stats.opdRevenue * 0.08).toLocaleString().slice(0, -3) + 'K'} from yesterday
                </span>
              </div>
            </div>
            
            <StatCard 
              icon={<FaStethoscope className="text-amber-500 text-lg sm:text-xl" />} 
              title={isMobile ? "Dr. Share" : "Doctor Share"} 
              value={`${stats.doctorCut}% / ${isMobile ? 'PKR' + doctorOpdRevenue.slice(0, -3) + 'K' : 'PKR ' + doctorOpdRevenue}`} 
              trend="up" 
              change="8%"
              bgColor="bg-amber-50"
              isMobile={isMobile}
            />
            
            <StatCard 
              icon={<FaMoneyBillWave className="text-rose-500 text-lg sm:text-xl" />} 
              title={isMobile ? "IPD Rev" : "IPD Revenue"} 
              value={`PKR ${isMobile ? stats.ipdRevenue.toLocaleString().slice(0, -3) + 'K' : stats.ipdRevenue.toLocaleString()}`} 
              trend="up" 
              change="15%"
              bgColor="bg-rose-50"
              isMobile={isMobile}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* OPD Revenue Split */}
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">
                  {isMobile ? "OPD Split" : "OPD Revenue Distribution"}
                </h3>
                <button className="text-xs sm:text-sm text-primary-500 flex items-center">
                  <FaFilter className="mr-1" /> {isMobile ? '' : 'Filter'}
                </button>
              </div>
              <div className="h-48 sm:h-56 md:h-64 relative">
                <Doughnut 
                  data={revenueSplitData}
                  options={isMobile ? mobileChartOptions : desktopChartOptions}
                />
                {!isMobile && (
                  <div className="absolute inset-0 flex items-end justify-center flex-col md:pr-12 pointer-events-none">
                    <div className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                      PKR {stats.opdRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Total OPD Revenue
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department Revenue */}
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">
                {isMobile ? "Dept. Revenue" : "Department Revenue"}
              </h3>
              <div className="h-48 sm:h-56 md:h-64">
                <Bar
                  data={departmentRevenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        bodyFont: {
                          size: isMobile ? 10 : 12
                        },
                        titleFont: {
                          size: isMobile ? 10 : 12
                        },
                        callbacks: {
                          label: function(context) {
                            return `PKR ${context.raw.toLocaleString()}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          font: {
                            size: isMobile ? 10 : 12
                          },
                          callback: function(value) {
                            if (isMobile && value >= 1000) {
                              return `PKR ${(value/1000).toFixed(0)}K`;
                            }
                            return `PKR ${value.toLocaleString()}`;
                          }
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: isMobile ? 10 : 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Revenue Comparison */}
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">
                {isMobile ? "Revenue" : "Revenue Streams"}
              </h3>
              <div className="h-48 sm:h-56 md:h-64">
                <Bar
                  data={revenueStreamData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        bodyFont: {
                          size: isMobile ? 10 : 12
                        },
                        titleFont: {
                          size: isMobile ? 10 : 12
                        },
                        callbacks: {
                          label: function(context) {
                            return `PKR ${context.raw.toLocaleString()}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          font: {
                            size: isMobile ? 10 : 12
                          },
                          callback: function(value) {
                            if (isMobile && value >= 1000) {
                              return `PKR ${(value/1000).toFixed(0)}K`;
                            }
                            return `PKR ${value.toLocaleString()}`;
                          }
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: isMobile ? 10 : 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Appointments */}
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">
                  {isMobile ? "Appointments" : "Recent Appointments"}
                </h3>
                <button className="text-xs sm:text-sm text-primary-500 flex items-center">
                  <FaPlus className="mr-1" /> {isMobile ? '' : 'New'}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isMobile ? "Patient" : "Patient"}
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isMobile ? "Dr." : "Doctor"}
                      </th>
                      {!isMobile && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                      )}
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 sm:px-4 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {isMobile ? appointment.patient.split(' ')[0] : appointment.patient}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {isMobile ? appointment.doctor.split(' ')[0] : appointment.doctor}
                        </td>
                        {!isMobile && (
                          <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${appointment.type === 'OPD' ? 'bg-primary-100 text-primary-800' : 'bg-purple-100 text-purple-800'}`}>
                              {appointment.type}
                            </span>
                          </td>
                        )}
                        <td className="px-3 py-2 sm:px-4 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-medium">
                          PKR {appointment.fee}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            appointment.status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isMobile ? appointment.status[0] : appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">
                  {isMobile ? "Finance" : "Financial Summary"}
                </h3>
                <button className="text-xs sm:text-sm text-primary-500">
                  {isMobile ? "More" : "View Details"}
                </button>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {isMobile ? "OPD Rev:" : "Total OPD Revenue:"}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold">
                    PKR {isMobile ? stats.opdRevenue.toLocaleString().slice(0, -3) + 'K' : stats.opdRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pl-2 sm:pl-4">
                  <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                    <span className="inline-block w-2 h-2 bg-teal-600 rounded-full mr-1 sm:mr-2"></span>
                    {isMobile ? "Hosp:" : "Hospital Share"} ({stats.hospitalCut}%)
                  </span>
                  <span className="text-xs sm:text-sm font-semibold">
                    PKR {isMobile ? hospitalOpdRevenue.slice(0, -3) + 'K' : hospitalOpdRevenue}
                  </span>
                </div>
                <div className="flex justify-between items-center pl-2 sm:pl-4">
                  <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                    <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1 sm:mr-2"></span>
                    {isMobile ? "Dr:" : "Doctor Share"} ({stats.doctorCut}%)
                  </span>
                  <span className="text-xs sm:text-sm font-semibold">
                    PKR {isMobile ? doctorOpdRevenue.slice(0, -3) + 'K' : doctorOpdRevenue}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 sm:pt-2 border-t border-gray-200">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {isMobile ? "IPD Rev:" : "Total IPD Revenue:"}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold">
                    PKR {isMobile ? stats.ipdRevenue.toLocaleString().slice(0, -3) + 'K' : stats.ipdRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 sm:pt-2 border-t border-gray-200">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {isMobile ? "Total:" : "Total Revenue:"}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-primary-600">
                    PKR {isMobile ? (stats.opdRevenue + stats.ipdRevenue).toLocaleString().slice(0, -3) + 'K' : (stats.opdRevenue + stats.ipdRevenue).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 sm:pt-4">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-1">
                    <span>{isMobile ? "Avg OPD:" : "Average OPD Charge:"}</span>
                    <span>PKR {stats.averageOpdCharge}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                    <span>{isMobile ? "Avg IPD:" : "Average IPD Charge:"}</span>
                    <span>PKR {stats.averageIpdCharge}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Enhanced StatCard component with mobile support
const StatCard = ({ icon, title, value, trend, change, bgColor, isMobile }) => {
  return (
    <div className={`${bgColor} p-3 sm:p-4 md:p-6 rounded-xl shadow-sm`}>
      <div className="flex justify-between">
        <div>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>{title}</p>
          <p className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-semibold text-gray-800 mt-1`}>{value}</p>
        </div>
        <div className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10 sm:h-12 sm:w-12'} rounded-full bg-white flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className={`mt-2 sm:mt-4 flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? (
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
        <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{change} from yesterday</span>
      </div>
    </div>
  );
};

// FaCheck icon component
const FaCheck = () => (
  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export default HospitalDashboard;