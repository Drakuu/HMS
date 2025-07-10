import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
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
} from '@mui/icons-material';

const ReceptionSidebar = () => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    {
      name: 'Dashboards',
      icon: <DashboardIcon className="text-lg" />,
      links: [
        { href: '/receptiondashboard', label: 'Reception Dashboard' },
        { href: '/hr-dashboard', label: 'HR Dashboard' },
        { href: '/patient-dashboard', label: 'Patient Dashboard' },
        { href: '/admin-dashboard', label: 'Admin Dashboard' },
      ],
    },
    {
      name: 'HR',
      icon: <GroupsIcon className="text-lg" />,
      links: [
        { href: '/departments', label: 'Departments' },
        { href: '/staff', label: 'Staff' },
        { href: '/doctors', label: 'Doctors' },
      ],
    },
    {
      name: 'Wards',
      icon: <RoomIcon className="text-lg" />,
      links: [{ href: '/ward-management', label: 'Ward Management' }],
    },
    {
      name: 'Pharmacy',
      icon: <PharmacyIcon className="text-lg" />,
      links: [
        { href: '/Med-list', label: 'Medicine List' },
        { href: '/prescription-management', label: 'Prescription Management' },
        { href: '/stock-management', label: 'Stock Management' },
      ],
    },
    {
      name: 'Appointments',
      icon: <AppointmentsIcon className="text-lg" />,
      links: [{ href: '/patient-appointment', label: 'Appointments' }],
    },
    {
      name: 'OPD',
      icon: <HospitalIcon className="text-lg" />,
      links: [
        { href: '/opd/newopd', label: 'New OPD' },
        { href: '/OPD/manage', label: 'Manage OPD' },
      ],
    },
    {
      name: 'IPD',
      icon: <IPDIcon className="text-lg" />,
      links: [
        { href: '/ipd/Admitted', label: 'Admission list' },
        { href: '/ipd/ssp', label: 'SSP Admissions' },
        { href: '/ipd/private', label: 'Private Admissions' },
      ],
    },
    {
      name: 'OT',
      icon: <OTIcon className="text-lg" />,
      links: [{ href: '/OTMain', label: 'OT Schedule' }],
    },
    {
      name: 'Accounts',
      icon: <AccountsIcon className="text-lg" />,
      links: [{ href: '/account/bill-list', label: 'Bill list' }],
    },
    {
      name: 'Inventory',
      icon: <InventoryIcon className="text-lg" />,
      links: [{ href: '/inventory', label: 'Inventory' }],
    },
    {
      name: 'Calendar',
      icon: <CalendarIcon className="text-lg" />,
      links: [{ href: '/calendar', label: 'Calendar' }],
    },
  ];

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
    setActiveMenu(menuName); // Set the clicked menu as active
    setActiveSubMenu(null); // Reset the active submenu on menu toggle
  };

  const handleSubMenuClick = (submenuName) => {
    setActiveSubMenu(submenuName);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="w-64 h-screen bg-primary-500 text-white flex flex-col shadow-lg">
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
              className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                activeMenu === menu.name
                  ? 'bg-primary-600'
                  : 'hover:bg-primary-600'
              }`}
              onClick={() => toggleMenu(menu.name)}
            >
              <div className="flex items-center">
                <span className="mr-3">{menu.icon}</span>
                <span className="font-medium">{menu.name}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  expandedMenus[menu.name] ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Submenu Items */}
            {expandedMenus[menu.name] && (
              <div className="pl-9 py-2 space-y-1">
                {menu.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.href}
                    onClick={() => handleSubMenuClick(link.label)} // Set submenu as active when clicked
                    className={`block px-3 py-2 text-sm transition-colors rounded ${
                      activeSubMenu === link.label
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

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-white font-medium transition-colors">
          That's it
        </button>
      </div>
    </div>
  );
};

export default ReceptionSidebar;
