import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  Dashboard as DashboardIcon,
  Groups as GroupsIcon,
  LocalHospital as HospitalIcon,
  MeetingRoom as RoomIcon,
  LocalPharmacy as PharmacyIcon,
  CalendarToday as CalendarIcon,
  Schedule as AppointmentsIcon,
  SingleBed as IPDIcon,
  Build as OTIcon,
  AttachMoney as AccountsIcon,
  Inventory as InventoryIcon,
  Science as LabIcon,
  Settings as AdminIcon,
} from '@mui/icons-material';

const DynamicSidebar = ({ userRole, isOpen, toggleSidebar }) => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
console.log("The dat in routeing is : ", userRole)
  // Get the base path based on user role
  const getBasePath = () => {
    switch (userRole?.toLowerCase()) {
      case 'admin': return '/admin';
      case 'receptionist': return '/receptionist';
      case 'lab': return '/lab';
      default: return '/';
    }
  };

  const basePath = getBasePath();

  // Role-specific menu configurations
  const menuConfigurations = {
    admin: [
      {
        name: 'Dashboards',
        icon: <DashboardIcon className="text-lg" />,
        links: [
          { href: 'dashboard', label: 'Admin Dashboard' },
          { href: 'hr-dashboard', label: 'HR Dashboard' },
        ],
      },
      {
        name: 'System Settings',
        icon: <AdminIcon className="text-lg" />,
        links: [
          { href: '/admin/system/users', label: 'User Management' },
          { href: '/admin/system/settings', label: 'System Settings' },
        ],
      },
    ],
    receptionist: [
      {
        name: 'Dashboards',
        icon: <DashboardIcon className="text-lg" />,
        links: [
          { href: 'dashboard', label: 'Reception Dashboard' },
          { href: 'hr-dashboard', label: 'HR Dashboard' },
          { href: 'patient-dashboard', label: 'Patient Dashboard' },
          { href: 'admin-dashboard', label: 'Admin Dashboard' },
        ],
      },
      {
        name: 'HR',
        icon: <GroupsIcon className="text-lg" />,
        links: [
          { href: 'departments', label: 'Departments' },
          { href: 'staff', label: 'Staff' },
          { href: 'doctors', label: 'Doctors' },
        ],
      },
      {
        name: 'Wards',
        icon: <RoomIcon className="text-lg" />,
        links: [{ href: 'ward-management', label: 'Ward Management' }],
      },
      {
        name: 'Pharmacy',
        icon: <PharmacyIcon className="text-lg" />,
        links: [
          { href: 'Med-list', label: 'Medicine List' },
          { href: 'prescription-management', label: 'Prescription Management' },
          { href: 'stock-management', label: 'Stock Management' },
        ],
      },
      {
        name: 'Appointments',
        icon: <AppointmentsIcon className="text-lg" />,
        links: [{ href: 'patient-appointment', label: 'Appointments' }],
      },
      {
        name: 'OPD',
        icon: <HospitalIcon className="text-lg" />,
        links: [
          { href: 'opd/newopd', label: 'New OPD' },
          { href: 'OPD/manage', label: 'Manage OPD' },
        ],
      },
      {
        name: 'IPD',
        icon: <IPDIcon className="text-lg" />,
        links: [
          { href: 'ipd/Admitted', label: 'Admission list' },
          { href: 'ipd/ssp', label: 'SSP Admissions' },
          { href: 'ipd/private', label: 'Private Admissions' },
        ],
      },
      {
        name: 'OT',
        icon: <OTIcon className="text-lg" />,
        links: [{ href: 'OTMain', label: 'OT Schedule' }],
      },
      {
        name: 'Accounts',
        icon: <AccountsIcon className="text-lg" />,
        links: [{ href: 'account/bill-list', label: 'Bill list' }],
      },
      {
        name: 'Inventory',
        icon: <InventoryIcon className="text-lg" />,
        links: [{ href: 'inventory', label: 'Inventory' }],
      },
      {
        name: 'Calendar',
        icon: <CalendarIcon className="text-lg" />,
        links: [{ href: 'calendar', label: 'Calendar' }],
      },
    ],
    lab: [
      {
        name: 'Dashboards',
        icon: <DashboardIcon className="text-lg" />,
        links: [
          { href: 'dashboard', label: 'Lab Dashboard' },
        ],
      },
      {
        name: 'Test Managment',
        icon: <LabIcon className="text-lg" />,
        links: [
          { href: 'add-test', label: 'Add Test' },
          { href: 'all-tests', label: 'All Test' },
        ],
      },
      {
        name: 'Patient Managment',
        icon: <LabIcon className="text-lg" />,
        links: [
          { href: 'patient-test', label: 'Patients Test' },
          { href: 'all-patients', label: 'All patients' },
        ],
      },
      {
        name: 'Billing Managment',
        icon: <LabIcon className="text-lg" />,
        links: [
          { href: 'test-billing', label: 'Patients Bills' },
          // { href: 'all-bills', label: 'All bills' },
        ],
      },
      {
        name: 'Report Managment',
        icon: <LabIcon className="text-lg" />,
        links: [
          { href: 'test-report', label: 'Patients Reports' },
          { href: 'all-reports', label: 'All reports' },
        ],
      },
      {
        name: 'Sample Managment',
        icon: <LabIcon className="text-lg" />,
        links: [
          { href: 'sample-collection', label: 'Patients Samples' },
          { href: 'all-samples', label: 'All samples' },
        ],
      },
    ],
  };

  // Add base path to all links
  const menuItems = (menuConfigurations[userRole?.toLowerCase()] || [])
    .map(menu => ({
      ...menu,
      links: menu.links.map(link => ({
        ...link,
        href: `${basePath}/${link.href}`
      }))
    }));

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
    setActiveMenu(menuName);
    setActiveSubMenu(null);
  };

  const handleSubMenuClick = (submenuName) => {
    setActiveSubMenu(submenuName);
    if (isOpen) toggleSidebar();
  };

  return (
    <div className={`fixed lg:relative z-30 h-full w-64 bg-primary-600 text-white flex flex-col shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-primary-600 flex items-center justify-center">
        <h1 className="text-xl py-1.5 font-semibold">Al-Shahbaz Hospital</h1>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        {menuItems.map((menu, index) => (
          <div key={index} className="mb-1">
            {/* Main Menu Item */}
            <div
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${activeMenu === menu.name
                ? 'bg-primary-700'
                : 'hover:bg-primary-700'
                }`}
              onClick={() => toggleMenu(menu.name)}
            >
              <div className="flex items-center">
                <span className="mr-3">{menu.icon}</span>
                <span className="font-medium">{menu.name}</span>
              </div>
              {menu.links.length > 0 && (
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedMenus[menu.name] ? 'rotate-180' : ''
                    }`}
                />
              )}
            </div>

            {/* Submenu Items */}
            {expandedMenus[menu.name] && menu.links.length > 0 && (
              <div className="pl-9 py-2 space-y-1">
                {menu.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.href}
                    onClick={() => handleSubMenuClick(link.label)}
                    className={`block px-3 py-2 text-sm transition-colors rounded ${activeSubMenu === link.label
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-primary-600 text-white'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-primary-400 text-center">
        <p className="text-lg font-medium tracking-wide">Logged in as: {userRole}</p>
      </div>
    </div>
  );
};

export default DynamicSidebar;