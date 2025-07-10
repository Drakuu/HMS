const hospitalModel = require("../models/index.model");

const createStaff = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      designation,
      address,
      city,
      department,
      staffType,
      qualification,
      emergencyContact,
      doctorDetails,
      nurseDetails,
      cleaningStaffDetails,
      adminDetails
    } = req.body;

    // Base data common to all staff
    const staffData = {
      firstName,
      lastName,
      phone,
      email,
      designation,
      address,
      city,
      department,
      staffType,
      qualification,
      emergencyContact,
      isActive: true,
      joiningDate: new Date()
    };

    // Add fields conditionally based on staff type
    if (staffType === 'Doctor') {
      if (!doctorDetails?.specialization || !doctorDetails?.licenseNumber) {
        return res.status(400).json({
          success: false,
          message: "Specialization and license number are required for doctors"
        });
      }
      staffData.doctorDetails = {
        specialization: doctorDetails.specialization,
        licenseNumber: doctorDetails.licenseNumber,
        consultingHours: doctorDetails.consultingHours || '',
        wardRounds: doctorDetails.wardRounds || '',
        procedures: doctorDetails.procedures || []
      };
    }

    else if (staffType === 'Nurse') {
      if (!nurseDetails?.nursingLicense || !nurseDetails?.assignedWard) {
        return res.status(400).json({
          success: false,
          message: "Nursing license and assigned ward are required for nurses"
        });
      }
      staffData.nurseDetails = {
        nursingLicense: nurseDetails.nursingLicense,
        assignedWard: nurseDetails.assignedWard,
        shift: nurseDetails.shift || 'Rotational',
        certifications: nurseDetails.certifications || []
      };
    }

    else if (staffType === 'Cleaning') {
      if (!cleaningStaffDetails?.assignedArea) {
        return res.status(400).json({
          success: false,
          message: "Assigned area is required for cleaning staff"
        });
      }
      staffData.cleaningStaffDetails = {
        assignedArea: cleaningStaffDetails.assignedArea,
        shift: cleaningStaffDetails.shift || 'Rotational',
        cleaningCertification: cleaningStaffDetails.cleaningCertification || false,
        equipmentTraining: cleaningStaffDetails.equipmentTraining || []
      };
    }

    else if (staffType === 'Administrative') {
      if (!adminDetails?.role) {
        return res.status(400).json({
          success: false,
          message: "Role is required for administrative staff"
        });
      }
      staffData.adminDetails = {
        role: adminDetails.role,
        accessLevel: adminDetails.accessLevel || 1,
        systemAccess: adminDetails.systemAccess || []
      };
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type"
      });
    }

    // Save to DB
    const newStaff = await hospitalModel.staff(staffData);
    await newStaff.save();

    res.status(201).json({
      success: true,
      message: `${staffType} staff added successfully`,
      data: {
        id: newStaff._id,
        fullName: `${newStaff.firstName} ${newStaff.lastName}`,
        email: newStaff.email,
        staffType: newStaff.staffType,
        department: newStaff.department
      }
    });

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


//get all stafff//
const getAllStaff = async (req, res) => {
  try {
    const staffList = await hospitalModel.staff.find();
    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching staff",
      error: error.message,
    });
  }
};

//get staff by id//
const getStaffById = async (req, res) => {
  const { id } = req.params;

  try {

    const staff = await hospitalModel.staff.findById(id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }


    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
//update staff by id//
const updateStaffById = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, email, designation, address, city, department, staffType, qualification } = req.body;

  try {
    const staff = await hospitalModel.staff.findById(id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }


    staff.firstName = firstName || staff.firstName;
    staff.lastName = lastName || staff.lastName;
    staff.phone = phone || staff.phone;
    staff.email = email || staff.email;
    staff.designation = designation || staff.designation;
    staff.address = address || staff.address;
    staff.city = city || staff.city;
    staff.department = department || staff.department;
    staff.staffType = staffType || staff.staffType;
    staff.qualification = qualification || staff.qualification;

    await staff.save();


    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createStaff, getAllStaff, getStaffById, updateStaffById };
