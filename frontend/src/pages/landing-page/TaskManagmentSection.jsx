import React from "react";

const TaskManagementSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Streamline Your Workflow</h2>
          <p className="text-lg text-gray-600">Manage tasks efficiently with our intuitive interface and collaborative tools.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          {/* Task Card 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6 w-64">
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm font-medium text-gray-500">Assign New Tasks</div>
              <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                <Plus size={14} className="text-gray-600" />
              </div>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 mb-2 flex items-center">
              <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                <Plus size={12} className="text-gray-400" />
              </div>
              <span className="text-gray-500 text-sm">Assign New Task</span>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 flex items-center">
              <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                <Plus size={12} className="text-gray-400" />
              </div>
              <span className="text-gray-500 text-sm">Assign New Task</span>
            </div>
          </div>
          
          {/* Task Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6 w-64">
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500 mb-1">Choose Your Sprint</div>
              <div className="bg-gradient-to-r from-pink-500 to-primary-500 h-2 rounded-full mb-2"></div>
              <div className="text-xs text-gray-400">55% Complete</div>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Sprint Tasks</div>
                <div className="text-xs text-gray-500">5 tasks remaining</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Media Assets</div>
                <div className="text-xs text-gray-500">3 files uploaded</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Team Members</div>
                <div className="text-xs text-gray-500">5 collaborators</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Summary</div>
                <div className="text-xs text-gray-500">Weekly report</div>
              </div>
            </div>
          </div>
          
          {/* Task Card 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6 w-64">
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Today's Tasks</div>
              <div className="text-3xl font-bold">25</div>
              <div className="text-sm text-gray-500 mb-3">Tasks remaining</div>
              <div className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-primary-500 text-white rounded-md py-2 mb-2">
                <span className="text-xs font-medium">View Pending Tasks</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border border-white"></div>
                <div className="w-6 h-6 rounded-full bg-green-500 border border-white"></div>
                <div className="w-6 h-6 rounded-full bg-yellow-500 border border-white"></div>
                <div className="w-6 h-6 rounded-full bg-red-500 border border-white flex items-center justify-center text-[10px] text-white">+2</div>
              </div>
              <div className="text-xs text-gray-500">Team Effort</div>
            </div>
          </div>
          
          {/* Triangle Accent */}
          <div className="hidden md:block">
            <div className="w-16 h-16">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-primary-500 rotate-45 transform origin-bottom-left"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Define Plus icon
const Plus = ({ size, className }) => {
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
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
};

export default TaskManagementSection;