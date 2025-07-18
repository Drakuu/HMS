const hospitalModel = require("../models/index.model");
const utils = require("../utils/utilsIndex")
const bcrypt = require("bcrypt");

const createStaff = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, designation, address, city, department, staffType, qualifications, emergencyContact, doctorDetails, nurseDetails, cleaningStaffDetails, adminDetails, cnic, gender, dateOfBirth, bloodGroup, shift, shiftTiming, salary } = req.body;

    console.log("the staff is ", req.body)
    // 1. Check if email or phone already exists
    const existingStaff = await hospitalModel.staff.findOne({
      $or: [{ email }, { phone }, { cnic }]
    });

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "Staff with this email, phone or CNIC already exists"
      });
    }

    // 2. Hash password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

     // Generate staff ID based on type
    let prefix;
    switch(staffType) {
      case 'Doctor': prefix = 'DOC'; break;
      case 'Nurse': prefix = 'NUR'; break;
      case 'Administrative': prefix = 'ADM'; break;
      case 'Receptionist': prefix = 'REC'; break;
      case 'Cleaning Staff': prefix = 'CLN'; break;
      case 'Lab Technician': prefix = 'LAB'; break;
      default: prefix = 'STF';
    }

    const fullName = `${firstName} ${lastName}`;
    const staffId = await utils.generateUniqueId(fullName, prefix, 'staff');


    // 3. Prepare staff data
    const staffData = {
      staffId, 
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
      designation,
      address,
      city,
      department,
      staffType,
       professionalDetails: {} ,
      qualifications,
      emergencyContact,
      cnic,
      gender,
      dateOfBirth,
      bloodGroup,
      shift,
      shiftTiming,
      salary,
      isActive: true,
      joiningDate: new Date()
    };

    // Add type-specific details
    switch (staffType) {
      case 'Doctor':
        if (!doctorDetails?.specialization || !doctorDetails?.licenseNumber) {
          return res.status(400).json({
            success: false,
            message: "Specialization and license number are required for doctors"
          });
        }
        staffData.professionalDetails = {
          specialization: doctorDetails.specialization,
          licenseNumber: doctorDetails.licenseNumber,
          consultingHours: doctorDetails.consultingHours || '',
          consultationFee: doctorDetails.consultationFee || 0,
          availableDays: doctorDetails.availableDays || [],
          type: doctorDetails.type || 'General',
          isSurgeon: doctorDetails.isSurgeon || false,
          wardRounds: doctorDetails.wardRounds || '',
          contract: doctorDetails.contract || {
            doctorPercentage: 0,
            hospitalPercentage: 0,
            contractDuration: '',
            agreement: ''
          }
        };
        break;

      case 'Nurse':
        if (!nurseDetails?.nursingLicense || !nurseDetails?.assignedWard) {
          return res.status(400).json({
            success: false,
            message: "Nursing license and assigned ward are required for nurses"
          });
        }
        staffData.professionalDetails = {
          assignedWard: nurseDetails.assignedWard,
          nursingLicense: nurseDetails.nursingLicense,
          certifications: nurseDetails.certifications || []
        };
        break;

      case 'Cleaning Staff':
        if (!cleaningStaffDetails?.assignedArea) {
          return res.status(400).json({
            success: false,
            message: "Assigned area is required for cleaning staff"
          });
        }
        staffData.professionalDetails = {
          assignedArea: cleaningStaffDetails.assignedArea,
          cleaningCertification: cleaningStaffDetails.cleaningCertification || false,
          equipmentTraining: cleaningStaffDetails.equipmentTraining || []
        };
        break;

      case 'Administrative':
        if (!adminDetails?.role) {
          return res.status(400).json({
            success: false,
            message: "Role is required for administrative staff"
          });
        }
        staffData.professionalDetails = {
          role: adminDetails.role,
          accessLevel: adminDetails.accessLevel || 1,
          systemAccess: adminDetails.systemAccess || []
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid staff type"
        });
    }

    // 4. Save staff to DB
    const newStaff = await hospitalModel.staff.create(staffData);

    res.status(201).json({
      success: true,
      message: `${staffType} staff added successfully`,
      data: {
        staffId: newStaff._id,
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
        message: "Duplicate value - staff with this information already exists"
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
