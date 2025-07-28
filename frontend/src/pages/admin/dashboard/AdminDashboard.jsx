import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Activity, 
  Bed, 
  DollarSign, 
  Bell, 
  Search, 
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Filter,
  Download,
  Settings,
  Heart,
  Stethoscope,
  Pill,
  ClipboardList,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [notifications, setNotifications] = useState(3);

  // Sample data
  const statsData = [
    { name: 'Jan', patients: 120, revenue: 45000, doctors: 25, appointments: 180 },
    { name: 'Feb', patients: 150, revenue: 52000, doctors: 28, appointments: 220 },
    { name: 'Mar', patients: 180, revenue: 48000, doctors: 30, appointments: 195 },
    { name: 'Apr', patients: 200, revenue: 61000, doctors: 32, appointments: 250 },
    { name: 'May', patients: 170, revenue: 55000, doctors: 35, appointments: 210 },
    { name: 'Jun', patients: 220, revenue: 67000, doctors: 38, appointments: 275 }
  ];

  const departmentData = [
    { name: 'Cardiology', value: 30, color: '#3B82F6', patients: 142 },
    { name: 'Neurology', value: 25, color: '#10B981', patients: 118 },
    { name: 'Orthopedics', value: 20, color: '#F59E0B', patients: 95 },
    { name: 'Pediatrics', value: 15, color: '#EF4444', patients: 71 },
    { name: 'Others', value: 10, color: '#8B5CF6', patients: 47 }
  ];

  const recentPatients = [
    { id: 'P001', name: 'John Doe', age: 45, department: 'Cardiology', status: 'Critical', doctor: 'Dr. Smith', room: '301A', admitted: '2024-01-15', phone: '+1-555-0123' },
    { id: 'P002', name: 'Jane Smith', age: 32, department: 'Neurology', status: 'Stable', doctor: 'Dr. Johnson', room: '205B', admitted: '2024-01-14', phone: '+1-555-0124' },
    { id: 'P003', name: 'Mike Johnson', age: 28, department: 'Orthopedics', status: 'Recovery', doctor: 'Dr. Wilson', room: '102C', admitted: '2024-01-13', phone: '+1-555-0125' },
    { id: 'P004', name: 'Sarah Wilson', age: 55, department: 'Cardiology', status: 'Critical', doctor: 'Dr. Anderson', room: '304A', admitted: '2024-01-12', phone: '+1-555-0126' },
    { id: 'P005', name: 'David Lee', age: 38, department: 'Pediatrics', status: 'Stable', doctor: 'Dr. Brown', room: '401D', admitted: '2024-01-11', phone: '+1-555-0127' },
    { id: 'P006', name: 'Emma Davis', age: 42, department: 'Neurology', status: 'Recovery', doctor: 'Dr. Taylor', room: '208B', admitted: '2024-01-10', phone: '+1-555-0128' }
  ];

  const upcomingAppointments = [
    { id: 1, time: '09:00 AM', patient: 'Emma Brown', doctor: 'Dr. Smith', department: 'Cardiology', type: 'Consultation', status: 'Confirmed' },
    { id: 2, time: '10:30 AM', patient: 'Robert Davis', doctor: 'Dr. Johnson', department: 'Neurology', type: 'Follow-up', status: 'Pending' },
    { id: 3, time: '02:00 PM', patient: 'Lisa Garcia', doctor: 'Dr. Wilson', department: 'Orthopedics', type: 'Surgery', status: 'Confirmed' },
    { id: 4, time: '03:30 PM', patient: 'Michael Chen', doctor: 'Dr. Anderson', department: 'Pediatrics', type: 'Check-up', status: 'Confirmed' },
    { id: 5, time: '04:15 PM', patient: 'Anna White', doctor: 'Dr. Brown', department: 'Cardiology', type: 'Emergency', status: 'Urgent' }
  ];

  const doctorsData = [
    { id: 'D001', name: 'Dr. James Smith', specialty: 'Cardiology', patients: 42, rating: 4.9, experience: '15 years', status: 'Available' },
    { id: 'D002', name: 'Dr. Sarah Johnson', specialty: 'Neurology', patients: 38, rating: 4.8, experience: '12 years', status: 'Busy' },
    { id: 'D003', name: 'Dr. Michael Wilson', specialty: 'Orthopedics', patients: 45, rating: 4.7, experience: '18 years', status: 'Available' },
    { id: 'D004', name: 'Dr. Emily Anderson', specialty: 'Pediatrics', patients: 35, rating: 4.9, experience: '10 years', status: 'Off Duty' },
    { id: 'D005', name: 'Dr. Robert Brown', specialty: 'Cardiology', patients: 40, rating: 4.6, experience: '14 years', status: 'Available' }
  ];

  const labResults = [
    { id: 'L001', patient: 'John Doe', test: 'Blood Test', result: 'Normal', date: '2024-01-15', status: 'Completed' },
    { id: 'L002', patient: 'Jane Smith', test: 'MRI Scan', result: 'Pending', date: '2024-01-14', status: 'In Progress' },
    { id: 'L003', patient: 'Mike Johnson', test: 'X-Ray', result: 'Abnormal', date: '2024-01-13', status: 'Completed' },
    { id: 'L004', patient: 'Sarah Wilson', test: 'ECG', result: 'Normal', date: '2024-01-12', status: 'Completed' }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4" style={{borderLeftColor: color}}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          <div className="flex items-center mt-3">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-gray-500 text-sm ml-1">vs last month</span>
          </div>
        </div>
        <div className="p-4 rounded-full" style={{backgroundColor: color + '20'}}>
          <Icon className="w-8 h-8" style={{color: color}} />
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const configs = {
      'Critical': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      'Stable': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Recovery': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Activity },
      'Confirmed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Urgent': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      'Available': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Busy': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Off Duty': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Activity }
    };
    
    const config = configs[status] || configs['Stable'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg transform -translate-y-0.5' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-1">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Al-Shahbaz</h1>
                  <p className="text-sm text-gray-500">Hospital Management System</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="hidden 2xl:flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <TabButton id="overview" label="Overview" icon={Activity} active={activeSection === 'overview'} onClick={setActiveSection} />
              <TabButton id="patients" label="Patients" icon={Users} active={activeSection === 'patients'} onClick={setActiveSection} />
              <TabButton id="doctors" label="Doctors" icon={Stethoscope} active={activeSection === 'doctors'} onClick={setActiveSection} />
              <TabButton id="appointments" label="Appointments" icon={Calendar} active={activeSection === 'appointments'} onClick={setActiveSection} />
              <TabButton id="lab" label="Lab" icon={ClipboardList} active={activeSection === 'lab'} onClick={setActiveSection} />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <Bell className="w-6 h-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="Admin"
                  className="w-10 h-10 rounded-full border-2 border-gray-300"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Dr. Admin</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="2xl:hidden mt-4 flex overflow-x-auto space-x-2 pb-2">
            <TabButton id="overview" label="Overview" icon={Activity} active={activeSection === 'overview'} onClick={setActiveSection} />
            <TabButton id="patients" label="Patients" icon={Users} active={activeSection === 'patients'} onClick={setActiveSection} />
            <TabButton id="doctors" label="Doctors" icon={Stethoscope} active={activeSection === 'doctors'} onClick={setActiveSection} />
            <TabButton id="appointments" label="Appointments" icon={Calendar} active={activeSection === 'appointments'} onClick={setActiveSection} />
            <TabButton id="lab" label="Lab" icon={ClipboardList} active={activeSection === 'lab'} onClick={setActiveSection} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Patients"
                value="1,247"
                change={12.5}
                icon={Users}
                color="#3B82F6"
                subtitle="473 active today"
              />
              <StatCard
                title="Active Doctors"
                value="38"
                change={-2.3}
                icon={Stethoscope}
                color="#10B981"
                subtitle="28 on duty now"
              />
              <StatCard
                title="Appointments Today"
                value="156"
                change={8.7}
                icon={Calendar}
                color="#8B5CF6"
                subtitle="23 pending"
              />
              <StatCard
                title="Monthly Revenue"
                value="$67,000"
                change={15.2}
                icon={DollarSign}
                color="#F59E0B"
                subtitle="$2,200 today"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Hospital Analytics</h3>
                  <div className="flex space-x-2">
                    <button className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100">6M</button>
                    <button className="text-sm text-white bg-blue-600 px-3 py-1 rounded-lg">1Y</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="patients" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="appointments" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="doctors" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Department Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Department Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {departmentData.map((dept, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: dept.color}}></div>
                        <span className="text-gray-700">{dept.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{dept.patients}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Today's Appointments</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    View All
                  </button>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-medium text-blue-600">{appointment.time}</p>
                          <p className="text-xs text-gray-500">{appointment.type}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{appointment.patient}</p>
                          <p className="text-sm text-gray-500">{appointment.doctor} • {appointment.department}</p>
                        </div>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Patients */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Critical Patients</h3>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Monitor All
                  </button>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {recentPatients.filter(p => p.status === 'Critical').map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-600">{patient.department} • Room {patient.room}</p>
                          <p className="text-xs text-gray-500">Dr: {patient.doctor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={patient.status} />
                        <p className="text-xs text-gray-500 mt-1">Age {patient.age}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'patients' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Patient
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                              <div className="text-sm text-gray-500">ID: {patient.id} • Age {patient.age}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.doctor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.room}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={patient.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{patient.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                            <button className="text-green-600 hover:text-green-900">Edit</button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'doctors' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Doctor
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {doctorsData.map((doctor) => (
                  <div key={doctor.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-blue-600" />
                      </div>
                      <StatusBadge status={doctor.status} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{doctor.name}</h3>
                    <p className="text-gray-600 mb-3">{doctor.specialty}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Patients:</span>
                        <span className="font-medium">{doctor.patients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-medium text-yellow-600">★ {doctor.rating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="font-medium">{doctor.experience}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        View Profile
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'appointments' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      New Appointment
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="text-center min-w-[80px]">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-blue-600">{appointment.time}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{appointment.patient}</h4>
                            <span className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded">{appointment.type}</span>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.doctor} • {appointment.department}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <StatusBadge status={appointment.status} />
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">Reschedule</button>
                            <button className="text-green-600 hover:text-green-800 text-sm">Complete</button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'lab' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Laboratory Management</h2>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      New Test
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Test ID</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {labResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <ClipboardList className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-900">{result.patient}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.test}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            result.result === 'Normal' ? 'text-green-600' : 
                            result.result === 'Abnormal' ? 'text-red-600' : 
                            'text-yellow-600'
                          }`}>
                            {result.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={result.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">View</button>
                            <button className="text-green-600 hover:text-green-900">Download</button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;