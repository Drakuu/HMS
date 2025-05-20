import React from "react";
import { 
  BarChart3, 
  PieChart, 
  Settings, 
  Search, 
  Bell, 
  Home, 
  Users, 
  MessageSquare, 
  Edit,
  MoreVertical, 
  ChevronRight, 
  ArrowRight,
  PenTool
} from "lucide-react";

const DashboardShowcaseSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Dashboard Interface</h2>
          <p className="text-lg text-gray-600">Experience the intuitive analytics dashboard that transforms your data into actionable insights.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dashboard Preview Left */}
          <div className="rounded-lg overflow-hidden shadow-xl bg-white p-4 relative">
            <div className="flex items-center justify-between mb-4 border-b pb-4">
              <div className="flex items-center">
                <div className="bg-primary-600 w-8 h-8 rounded-md flex items-center justify-center mr-2">
                  <BarChart3 size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-lg">Analytics Dashboard</h3>
              </div>
              <div className="flex gap-2">
                <Search size={18} className="text-gray-500" />
                <Bell size={18} className="text-gray-500" />
                <Circle size={18} className="text-gray-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-primary-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">Revenue</div>
                <div className="text-xl font-bold">$8,350.92</div>
                <div className="text-xs text-green-500 flex items-center">+12.5% <ChevronRight size={14} className="rotate-90" /></div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">Users</div>
                <div className="text-xl font-bold">2,459</div>
                <div className="text-xs text-green-500 flex items-center">+8.2% <ChevronRight size={14} className="rotate-90" /></div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">Conversion</div>
                <div className="text-xl font-bold">72%</div>
                <div className="text-xs text-green-500 flex items-center">+4.3% <ChevronRight size={14} className="rotate-90" /></div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Monthly Progress</h4>
                <div className="flex items-center text-sm text-primary-600">
                  <span>View Details</span>
                  <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="h-[140px] flex items-end justify-between px-2">
                  {/* Simple Chart Bars */}
                  <div className="w-1/12 bg-primary-500 h-[30%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[60%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[45%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[80%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[65%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[40%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[55%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[75%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[90%] rounded-t-sm"></div>
                  <div className="w-1/12 bg-primary-500 h-[70%] rounded-t-sm"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Tasks</h5>
                  <MoreVertical size={16} className="text-gray-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" checked readOnly />
                    <span className="text-sm line-through text-gray-500">Research market trends</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Update user interface</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Prepare quarterly report</span>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Top Products</h5>
                  <MoreVertical size={16} className="text-gray-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Product A</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Product B</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Product C</span>
                    <span className="text-sm font-medium">17%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview Right */}
          <div className="rounded-lg overflow-hidden shadow-xl bg-white relative">
            <div className="bg-primary-700 h-16 flex items-center px-4">
              <div className="w-12 bg-primary-800 h-full flex items-center justify-center">
                <PenTool size={20} className="text-white" />
              </div>
              <div className="flex-1 h-full flex flex-col justify-center px-4">
                <div className="text-white text-lg font-bold">Report Dashboard</div>
              </div>
              <div className="flex gap-3">
                <Bell size={18} className="text-white" />
                <Settings size={18} className="text-white" />
              </div>
            </div>
            
            <div className="flex h-[420px]">
              <div className="w-12 bg-primary-800 flex flex-col items-center py-4 space-y-6">
                <Home size={18} className="text-gray-300" />
                <BarChart3 size={18} className="text-white" />
                <PieChart size={18} className="text-gray-300" />
                <Users size={18} className="text-gray-300" />
                <MessageSquare size={18} className="text-gray-300" />
              </div>
              
              <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Weekly Stats</h3>
                  <div className="flex items-center gap-3">
                    <Search size={18} className="text-gray-500" />
                    <Edit size={18} className="text-gray-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Total Sales</div>
                    <div className="text-xl font-bold">$12,426</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-green-500">+16.2%</div>
                      <div className="w-12 h-6 relative">
                        <div className="absolute bottom-0 left-0 w-1 bg-primary-300 h-[30%] rounded"></div>
                        <div className="absolute bottom-0 left-2 w-1 bg-primary-400 h-[50%] rounded"></div>
                        <div className="absolute bottom-0 left-4 w-1 bg-primary-500 h-[70%] rounded"></div>
                        <div className="absolute bottom-0 left-6 w-1 bg-primary-600 h-[90%] rounded"></div>
                        <div className="absolute bottom-0 left-8 w-1 bg-primary-700 h-[60%] rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Visitors</div>
                    <div className="text-xl font-bold">8,295</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-green-500">+8.4%</div>
                      <div className="w-12 h-6 relative">
                        <div className="absolute bottom-0 left-0 w-1 bg-blue-300 h-[50%] rounded"></div>
                        <div className="absolute bottom-0 left-2 w-1 bg-blue-400 h-[80%] rounded"></div>
                        <div className="absolute bottom-0 left-4 w-1 bg-blue-500 h-[60%] rounded"></div>
                        <div className="absolute bottom-0 left-6 w-1 bg-blue-600 h-[40%] rounded"></div>
                        <div className="absolute bottom-0 left-8 w-1 bg-blue-700 h-[70%] rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Orders</div>
                    <div className="text-xl font-bold">1,420</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-green-500">+4.9%</div>
                      <div className="w-12 h-6 relative">
                        <div className="absolute bottom-0 left-0 w-1 bg-indigo-300 h-[20%] rounded"></div>
                        <div className="absolute bottom-0 left-2 w-1 bg-indigo-400 h-[40%] rounded"></div>
                        <div className="absolute bottom-0 left-4 w-1 bg-indigo-500 h-[80%] rounded"></div>
                        <div className="absolute bottom-0 left-6 w-1 bg-indigo-600 h-[50%] rounded"></div>
                        <div className="absolute bottom-0 left-8 w-1 bg-indigo-700 h-[30%] rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Conversion Rate</h4>
                    <div className="bg-primary-100 text-primary-700 text-sm font-medium px-2 py-1 rounded">
                      72%
                    </div>
                  </div>
                  
                  <div className="h-[100px] relative">
                    {/* Line Chart Visualization */}
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <path 
                        d="M0,80 C20,70 40,90 60,80 C80,70 100,20 120,30 C140,40 160,90 180,70 C200,50 220,30 240,20 C260,10 280,20 300,10" 
                        fill="none" 
                        stroke="#9061F9" 
                        strokeWidth="2"
                      />
                      <path 
                        d="M0,80 C20,70 40,90 60,80 C80,70 100,20 120,30 C140,40 160,90 180,70 C200,50 220,30 240,20 C260,10 280,20 300,10" 
                        fill="url(#gradient)" 
                        fillOpacity="0.2" 
                        stroke="none"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#9061F9" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#9061F9" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-1"></div>
                      <span className="text-xs text-gray-500">Current</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                      <span className="text-xs text-gray-500">Previous</span>
                    </div>
                  </div>
                  <button className="text-xs bg-primary-600 text-white px-3 py-1 rounded">Export Data</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Define Circle icon since it wasn't imported
const Circle = ({ size, className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
  );
};

export default DashboardShowcaseSection;