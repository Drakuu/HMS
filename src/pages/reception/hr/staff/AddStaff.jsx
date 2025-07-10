import React, { useState, useEffect } from "react";
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaGraduationCap, FaSearch, FaPlus, FaEdit, FaEye, FaTimes, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { createStaff, getAllStaff, updateStaff, getStaffById } from "../../../../features/staff/staffslice";
import { getallDepartments } from '../../../../features/department/DepartmentSlice';

const staffTypes = ["Doctor", "Nurse", 'Cleaning', 'Administrative'];
const cities = ["Lahore", "Karachi", "Islamabad"];
const shift = ['Morning', 'Evening', 'Night', 'Rotational'];

const AddStaffModal = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    designation: "",
    address: "",
    city: "",
    department: "",
    staffType: "",
    doctorDetails: {
      specialization: '',
      licenseNumber: '',
      consultingHours: '',
      wardRounds: '',
      procedures: '',
    },
    nurseDetails: {
      shift: '',
      assignedWard: '',      
      nursingLicense: '',
      certifications: '',
    },
    cleaningStaffDetails: {
      shift: '',
      assignedArea: '',
      cleaningCertification: '',
      equipmentTraining: '',
    },
    adminDetails: {
      role: '',
      accessLevel: '',
      systemAccess: '',
    },
    qualification: "",
  });

  const dispatch = useDispatch();
  const { staffList } = useSelector((state) => state.staff);
  const { staffDetails } = useSelector((state) => state.staff);
  const { departments } = useSelector((state) => state.department);

  const [isFormOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllStaff());
    dispatch(getallDepartments());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await dispatch(updateStaff({ id: editingStaffId, staffData: form }));
      } else {
        console.log(form);
        await dispatch(createStaff(form));
      }
      
      // Reset form and close it
      setForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        designation: "",
        address: "",
        city: "",
        department: "",
        staffType: "",
        doctorDetails: {
          specialization: '',
          licenseNumber: '',
          consultingHours: '',
          wardRounds: '',
          procedures: '',
        },
        nurseDetails: {
          shift: '',
          assignedWard: '',      
          nursingLicense: '',
          certifications: '',
        },
        cleaningStaffDetails: {
          shift: '',
          assignedArea: '',
          cleaningCertification: false,
          equipmentTraining: '',
        },
        adminDetails: {
          role: '',
          accessLevel: '',
          systemAccess: '',
        },
        qualification: "",
      });
      setIsEditing(false);
      setEditingStaffId(null);
      setFormOpen(false); // Close the form after submission
      
      // Refresh the staff list
      dispatch(getAllStaff());
    } catch (error) {
      console.error("Error submitting staff:", error);
    }
  };

  const handleEdit = (id) => {
    const staffToEdit = staffList.find((staff) => staff._id === id);
    if (staffToEdit) {
      setForm({
        firstName: staffToEdit.firstName,
        lastName: staffToEdit.lastName,
        phone: staffToEdit.phone,
        email: staffToEdit.email,
        designation: staffToEdit.designation,
        address: staffToEdit.address,
        city: staffToEdit.city,
        department: staffToEdit.department,
        staffType: staffToEdit.staffType,
        qualification: staffToEdit.qualification,
        doctorDetails: staffToEdit.doctorDetails || {
          specialization: '',
          licenseNumber: '',
          consultingHours: '',
          wardRounds: '',
          procedures: '',
        },
        nurseDetails: staffToEdit.nurseDetails || {
          shift: '',
          assignedWard: '',      
          nursingLicense: '',
          certifications: '',
        },
        cleaningStaffDetails: staffToEdit.cleaningStaffDetails || {
          shift: '',
          assignedArea: '',
          cleaningCertification: false,
          equipmentTraining: '',
        },
        adminDetails: staffToEdit.adminDetails || {
          role: '',
          accessLevel: '',
          systemAccess: '',
        }
      });
      setIsEditing(true);
      setEditingStaffId(id);
      setFormOpen(true);
    }
  };

    const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine record?')) {
      setDeletedIds(prev => [...prev, id]);
    }
  };

  const handleView = (id) => {
   // setViewStaffId(id);
    dispatch(getStaffById(id));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  //  setViewStaffId(null);
  };

const filteredStaff = staffList
  .filter(staff => !deletedIds.includes(staff._id)) // First, exclude deleted staff
  .filter(staff =>
    `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.staffType.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleNestedChange = (field, subfield, value) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value
      }
    }));
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="bg-primary-600 text-white rounded-md px-6 py-8 shadow-md">
        <div className="max-w-9xl mx-auto">
          <div className="flex items-center">
            <div className="h-12 w-1 bg-primary-300 mr-4 rounded-full"></div>
            <div>
              <h1 className="text-3xl font-bold">Staff Management</h1>
              <p className="text-primary-100 mt-1">Manage all hospital staff members and their information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-9xl mx-auto px-6 py-8">
        {/* Search and Add Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff by name, phone, or department..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                setFormOpen(true);
                setIsEditing(false);
                setEditingStaffId(null);
                setForm({
                  firstName: "",
                  lastName: "",
                  phone: "",
                  email: "",
                  designation: "",
                  address: "",
                  city: "",
                  department: "",
                  staffType: "",
                  doctorDetails: {
                    specialization: '',
                    licenseNumber: '',
                    consultingHours: '',
                    wardRounds: '',
                    procedures: '',
                  },
                  nurseDetails: {
                    shift: '',
                    assignedWard: '',     
                    nursingLicense: '',
                    certifications: '',
                  },
                  cleaningStaffDetails: {
                    shift: '',
                    assignedArea: '',
                    cleaningCertification: false,
                    equipmentTraining: '',
                  },
                  adminDetails: {
                    role: '',
                    accessLevel: '',
                    systemAccess: '',
                  },
                  qualification: "",
                });
              }}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaPlus className="-ml-1 mr-2 h-4 w-4" />
              Add New Staff
            </button>
          </div>
        </div>

        {/* Staff Form */}
        {isFormOpen && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="pl-10 border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="pl-10 border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="pl-10 border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="pl-10 border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Designation"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      className="pl-10 border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="pl-10 border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  >
                    <option value="">Select City</option>
                    {cities.map((city, idx) => (
                      <option key={idx} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department*</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type*</label>
                  <select
                    value={form.staffType}
                    onChange={(e) => setForm({ ...form, staffType: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    required
                  >
                    <option value="">Select Staff Type</option>
                    {staffTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Doctor-specific fields */}
                {form.staffType === 'Doctor' && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        placeholder="Specialization"
                        value={form.doctorDetails.specialization}
                        onChange={(e) => handleNestedChange('doctorDetails', 'specialization', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                      <input
                        type="text"
                        placeholder="License Number"
                        value={form.doctorDetails.licenseNumber}
                        onChange={(e) => handleNestedChange('doctorDetails', 'licenseNumber', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consulting Hours</label>
                      <input
                        type="text"
                        placeholder="Consulting Hours"
                        value={form.doctorDetails.consultingHours}
                        onChange={(e) => handleNestedChange('doctorDetails', 'consultingHours', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ward Rounds</label>
                      <input
                        type="text"
                        placeholder="Ward Rounds"
                        value={form.doctorDetails.wardRounds}
                        onChange={(e) => handleNestedChange('doctorDetails', 'wardRounds', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Procedures</label>
                      <input
                        type="text"
                        placeholder="Procedures"
                        value={form.doctorDetails.procedures}
                        onChange={(e) => handleNestedChange('doctorDetails', 'procedures', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>
                  </>
                )}

                {/* Nurse-specific fields */}
                {form.staffType === 'Nurse' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                      <select
                        value={form.nurseDetails.shift}
                        onChange={(e) => handleNestedChange('nurseDetails', 'shift', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      >
                        <option value="">Select Shift</option>
                        {shift.map((item, idx) => (
                          <option key={idx} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Ward</label>
                      <input
                        type="text"
                        placeholder="Assigned Ward"
                        value={form.nurseDetails.assignedWard}
                        onChange={(e) => handleNestedChange('nurseDetails', 'assignedWard', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nursing License</label>
                      <input
                        type="text"
                        placeholder="Nursing License"
                        value={form.nurseDetails.nursingLicense}
                        onChange={(e) => handleNestedChange('nurseDetails', 'nursingLicense', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                      <input
                        type="text"
                        placeholder="Certifications"
                        value={form.nurseDetails.certifications}
                        onChange={(e) => handleNestedChange('nurseDetails', 'certifications', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>
                  </>
                )}

                {/* Cleaning staff-specific fields */}
                {form.staffType === 'Cleaning' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                      <select
                        value={form.cleaningStaffDetails.shift}
                        onChange={(e) => handleNestedChange('cleaningStaffDetails', 'shift', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      >
                        <option value="">Select Shift</option>
                        {shift.map((item, idx) => (
                          <option key={idx} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Area</label>
                      <input
                        type="text"
                        placeholder="Assigned Area"
                        value={form.cleaningStaffDetails.assignedArea}
                        onChange={(e) => handleNestedChange('cleaningStaffDetails', 'assignedArea', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="mt-8">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                        <input
                          type="checkbox"
                          checked={form.cleaningStaffDetails.cleaningCertification}
                          onChange={(e) => handleNestedChange('cleaningStaffDetails', 'cleaningCertification', e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span>Cleaning Certification</span>
                      </label>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Training</label>
                      <input
                        type="text"
                        placeholder="Equipment Training"
                        value={form.cleaningStaffDetails.equipmentTraining}
                        onChange={(e) => handleNestedChange('cleaningStaffDetails', 'equipmentTraining', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>
                  </>
                )}

                {/* Administrative staff-specific fields */}
                {form.staffType === 'Administrative' && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input
                        type="text"
                        placeholder="Role"
                        value={form.adminDetails.role}
                        onChange={(e) => handleNestedChange('adminDetails', 'role', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                      <input
                        type="number"
                        placeholder="Access Level"
                        value={form.adminDetails.accessLevel}
                        onChange={(e) => handleNestedChange('adminDetails', 'accessLevel', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">System Access</label>
                      <input
                        type="text"
                        placeholder="System Access"
                        value={form.adminDetails.systemAccess}
                        onChange={(e) => handleNestedChange('adminDetails', 'systemAccess', e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification*</label>
                  <div className="relative">
                    <FaGraduationCap className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Qualification"
                      value={form.qualification}
                      onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                      className="pl-10 border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 mt-4 flex justify-end space-x-4">
                  <button 
                    type="submit" 
                    className="bg-primary-600 text-white py-2 px-6 rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    {isEditing ? "Update Staff" : "Add Staff"}
                  </button>

                  <button 
                    onClick={() => setFormOpen(false)}
                    type="button"
                    className="border border-gray-300 text-gray-700 py-2 px-6 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-250 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}


        {/* Staff List Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <tr key={staff._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{staff.firstName} {staff.lastName}</div>
                        <div className="text-xs text-gray-500">{staff.designation}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          staff.department === "Medical" ? "bg-blue-100 text-blue-800" :
                          staff.department === "Admin" ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {staff.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.staffType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(staff._id)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <FaEdit className="inline mr-1" /> Edit
                        </button>
                        <button
                         onClick={() => handleDelete(staff._id)}
                         
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          <FaTrash className="inline mr-1" /> Delete
                        </button>
                        <button
                          onClick={() => handleView(staff._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'No staff members match your search.' : 'No staff members found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff Details Modal */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] max-w-4xl w-full mx-4 border border-gray-200 overflow-hidden transform transition-all duration-200 scale-[0.98] animate-[scaleIn_0.2s_ease-out_forwards]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100">
        <h2 className="text-2xl font-bold text-primary-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Staff Record Details
        </h2>
        <button 
          onClick={closeModal} 
          className="text-gray-500 hover:text-red-500 text-2xl transition-all duration-200 hover:scale-110 focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[70vh] overflow-y-auto">
        {/* Basic Info */}
        <div className="space-y-2">
          <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Full Name</p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-lg font-medium text-gray-800">{staffDetails?.firstName} {staffDetails?.lastName}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Phone</p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-lg font-medium text-gray-800">{staffDetails?.phone}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Email</p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-lg font-medium text-gray-800">{staffDetails?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Designation</p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-lg font-medium text-gray-800">{staffDetails?.designation || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Department</p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-lg font-medium text-gray-800">{staffDetails?.department || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Staff Type</p>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-lg font-medium text-gray-800">{staffDetails?.staffType || 'N/A'}</p>
          </div>
        </div>

        {/* Doctor-only fields */}
        {staffDetails?.staffType === "Doctor" && (
          <>
            <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Specialization</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.specialization || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Consulting Hours</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.consultingHours || 'N/A'}</p>
              </div>
            </div>

             <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Ward Rounds</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.wardRounds || 'N/A'}</p>
              </div>
            </div>


             <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Procedures</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.procedures || 'N/A'}</p>
              </div>
            </div>
          </>
        )}

         {/* Doctor-only fields */}
        {staffDetails?.staffType === "nurseDetails" && (
          <>
            <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Shift</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.shift || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Assigned Ward</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.assignedWard || 'N/A'}</p>
              </div>
            </div>

             <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Nursing License</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.nursingLicense || 'N/A'}</p>
              </div>
            </div>


             <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Certifications</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.certifications || 'N/A'}</p>
              </div>
            </div>
          </>
        )}

         {/* Doctor-only fields */}
        {staffDetails?.staffType === "cleaningStaffDetails" && (
          <>
            <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Shift</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.shift || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Assigned Area</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?. assignedArea || 'N/A'}</p>
              </div>
            </div>

             <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Cleaning Certification</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.cleaningCertification || 'N/A'}</p>
              </div>
            </div>


             <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Equipment Training</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.equipmentTraining || 'N/A'}</p>
              </div>
            </div>
          </>
        )}

         {/* Doctor-only fields */}
        {staffDetails?.staffType === "adminDetails" && (
          <>
            <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Role</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.role || 'N/A'}</p>
              </div>
            </div>

             <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">Access Level</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.accessLevel || 'N/A'}</p>
              </div>
            </div>


             <div className="space-y-2">
              <p className="text-l font-semibold text-gray-500 uppercase tracking-wider">System Access</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-lg font-medium text-gray-800">{staffDetails?.doctorDetails?.systemAccess || 'N/A'}</p>
              </div>
            </div>
          </>
        )}

      </div>

      <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={closeModal}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
        >
          Close Details
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default AddStaffModal;