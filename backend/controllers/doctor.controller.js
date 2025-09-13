const hospitalModel = require("../models/index.model");
const utils = require("../utils/utilsIndex");
const bcrypt = require("bcrypt");
const { patient } = require("./index.controller");

const createDoctor = async (req, res) => {
  try {
    // Destructure from form data
    const {
      user_Name,
      user_Email,
      user_Contact,
      user_Address,
      user_CNIC,
      user_Password,
      doctor_Department,
      doctor_Type,
      doctor_Specialization,
      doctor_LicenseNumber,
      doctor_Fee,
      doctor_Qualifications,
      doctor_Contract,
    } = req.body;

    // console.log("request body ", req.body);

    const qualifications = Array.isArray(doctor_Qualifications)
      ? doctor_Qualifications
      : [doctor_Qualifications].filter(Boolean);

    // Validate required fields
    if (!user_Name || !user_Contact || !user_CNIC || !user_Password) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    // Validate contract data exists
    if (!doctor_Contract || typeof doctor_Contract !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Contract data is missing or invalid"
      });
    }
    // Extract and validate contract fields
    const {
      doctor_Percentage,
      hospital_Percentage,
      contract_Time,
      doctor_JoiningDate
    } = doctor_Contract;

    // Generate ID
    const user_Identifier = await utils.generateUniqueDoctorId(user_Name.trim());

    // Handle file uploads
    const doctor_Image = req.files?.doctor_Image?.[0];
    const doctor_Agreement = req.files?.doctor_Agreement?.[0];

    // Create user
    const newUser = await hospitalModel.User.create({
      user_Identifier,
      user_Name,
      user_Email: user_Email && user_Email.trim() !== '' ? user_Email : null,
      user_CNIC,
      user_Password: await bcrypt.hash(user_Password, 10),
      user_Access: 'Doctor',
      user_Address,
      user_Contact,
      isVerified: true,
      isDeleted: false,
    });

    // Create doctor
    const newDoctor = await hospitalModel.Doctor.create({
      user: newUser._id,
      doctor_Department,
      doctor_Type,
      doctor_Specialization,
      doctor_Qualifications,
      doctor_LicenseNumber,
      doctor_Fee: Number(doctor_Fee),
      doctor_Image: doctor_Image ? {
        filePath: `/uploads/doctor/images/${doctor_Image.filename}`
      } : undefined,
      doctor_Contract: {
        doctor_Percentage,
        hospital_Percentage,
        contract_Time,
        doctor_JoiningDate,
        doctor_Agreement: doctor_Agreement ? {
          filePath: `/uploads/doctor/agreements/${doctor_Agreement.filename}`
        } : undefined
      }
    });
    // console.log("New doctor created: ", newDoctor);
    // Update user reference
    await hospitalModel.User.findByIdAndUpdate(newUser._id, {
      doctorProfile: newDoctor._id
    });

    return res.status(201).json({
      success: true,
      data: {
        doctor: newDoctor,
        user: newUser
      }
    });

  } catch (error) {
    console.error('Creation error:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      let fieldName = field;
      if (field === 'user_Email') fieldName = 'email';
      if (field === 'user_CNIC') fieldName = 'CNIC';
      if (field === 'user_Contact') fieldName = 'contact number';

      // Handle null values specifically
      const displayValue = value === null ? 'empty' : value;

      return res.status(409).json({
        success: false,
        message: `This ${fieldName} (${value}) is already registered. Please use a different ${fieldName}.`,
        errorType: 'DUPLICATE_KEY',
        field: fieldName,
        value: value
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the doctor",
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await hospitalModel.Doctor.find({ deleted: false }).populate({
      path: 'user',
      select: 'user_Identifier user_Name user_Email user_CNIC user_Access user_Contact isVerified isDeleted  user_Address' // Only include these fields from User
    });

    if (!doctors || doctors.length === 0) {
      return res.status(200).json({
        success: true,
        status: 404,
        message: "No doctors found",
        information: {
          doctors: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Doctors retrieved successfully",
      information: { doctors },
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    // console.log("the docotr id is ",doctorId)
    const doctor = await hospitalModel.Doctor.findOne({
      _id: doctorId,
      deleted: false,
    }).populate({
      path: 'user',
      select: 'user_Identifier user_Name user_Password user_Email user_CNIC user_Access user_Contact isVerified isDeleted  user_Address' // Only include these fields from User
    });

    if (!doctor) {
      return res.status(404).json({
        success: true,
        status: 404,
        message: "No doctor found",
        information: {
          doctor: [],
          patient: []
        },
      });
    }

    // console.log("Searching for patients with:", {
    //   doctorName: doctor.user.user_Name,
    //   department: doctor.doctor_Department
    // });

    const patients = await hospitalModel.Patient.find({
      "visits.doctor": doctor._id,
    });

    // console.log("Found patients:", patients);

    // console.log("Doctor details with patients: ", patients);

    // Mapping patients' information with the relevant doctor data
    const mappedPatients = patients.map((patient) => ({
      _id: patient._id,
      patient_MRNo: patient.patient_MRNo,
      patient_Name: patient.patient_Name,
      patient_ContactNo: patient.patient_ContactNo,
      patient_Guardian: patient.patient_Guardian,
      patient_CNIC: patient.patient_CNIC,
      patient_Gender: patient.patient_Gender,
      patient_Age: patient.patient_Age,
      patient_DateOfBirth: patient.patient_DateOfBirth,
      patient_Address: patient.patient_Address,
      patient_HospitalInformation: patient.patient_HospitalInformation,
      patient_BloodType: patient.patient_BloodType,
      patient_MaritalStatus: patient.patient_MaritalStatus,
      deleted: patient.deleted,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));

    // If doctor is found, return it in the response
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Doctor retrieved successfully",
      information: {
        doctor,
        patients: mappedPatients,
      },
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Please provide the doctor ID.",
      });
    }

    const doctor = await hospitalModel.Doctor.findById({
      _id: doctorId,
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    await hospitalModel.Doctor.updateOne(
      { _id: doctorId },
      { $set: { deleted: true } }
    );

    return res.status(200).json({
      success: true,
      message: "doctor deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Find the doctor and populate the user data
    const doctor = await hospitalModel.Doctor.findById(doctorId).populate('user');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor Not Found",
      });
    }

    const {
      user_Name,
      user_Email,
      user_Contact,
      user_Address,
      user_Password,
      user_CNIC,
      doctor_Department,
      doctor_Type,
      doctor_Specialization,
      doctor_Qualifications,
      doctor_LicenseNumber,
      doctor_Fee,
      doctor_Contract
    } = req.body;

    // Handle file paths
    const newDoctor_ImagePath = req.files?.doctor_Image?.[0]
      ? `/uploads/doctor/images/${req.files.doctor_Image[0].filename}`
      : doctor.doctor_Image?.filePath;

    const newDoctor_AgreementPath = req.files?.doctor_Agreement?.[0]
      ? `/uploads/doctor/agreements/${req.files.doctor_Agreement[0].filename}`
      : doctor.doctor_Contract?.doctor_Agreement?.filePath;

    // Parse contract data if it's a string
    let parsedContract = doctor.doctor_Contract;
    try {
      if (typeof doctor_Contract === 'string') {
        parsedContract = JSON.parse(doctor_Contract);
      } else if (doctor_Contract) {
        parsedContract = doctor_Contract;
      }
    } catch (e) {
      console.error('Error parsing contract:', e);
    }

    // Update User model (personal information)
    const userUpdateData = {};
    if (user_Name !== undefined) userUpdateData.user_Name = user_Name;
    if (user_Password !== undefined) userUpdateData.user_Password = user_Password.hash ? await bcrypt.hash(user_Password, 10) : doctor.user.user_Password;
    if (user_Email !== undefined) userUpdateData.user_Email = user_Email;
    if (user_Contact !== undefined) userUpdateData.user_Contact = user_Contact;
    if (user_Address !== undefined) userUpdateData.user_Address = user_Address;
    if (user_CNIC !== undefined) userUpdateData.user_CNIC = user_CNIC;

    // Update user if there are changes
    if (Object.keys(userUpdateData).length > 0) {
      await hospitalModel.User.findByIdAndUpdate(
        doctor.user._id,
        userUpdateData,
        { new: true, runValidators: true }
      );
    }

    // Build doctor update data
    const doctorUpdateData = {
      doctor_Department: doctor_Department !== undefined ? doctor_Department : doctor.doctor_Department,
      doctor_Type: doctor_Type !== undefined ? doctor_Type : doctor.doctor_Type,
      doctor_Specialization: doctor_Specialization !== undefined ? doctor_Specialization : doctor.doctor_Specialization,
      doctor_Qualifications: doctor_Qualifications !== undefined ?
        (Array.isArray(doctor_Qualifications) ? doctor_Qualifications : [doctor_Qualifications]) :
        doctor.doctor_Qualifications,
      doctor_LicenseNumber: doctor_LicenseNumber !== undefined ? doctor_LicenseNumber : doctor.doctor_LicenseNumber,
      doctor_Fee: doctor_Fee !== undefined ? Number(doctor_Fee) : doctor.doctor_Fee,
      doctor_Image: { filePath: newDoctor_ImagePath },
      doctor_Contract: {
        doctor_Percentage: parsedContract?.doctor_Percentage ?? doctor.doctor_Contract.doctor_Percentage,
        hospital_Percentage: parsedContract?.hospital_Percentage ?? doctor.doctor_Contract.hospital_Percentage,
        contract_Time: parsedContract?.contract_Time ?? doctor.doctor_Contract.contract_Time,
        doctor_JoiningDate: parsedContract?.doctor_JoiningDate ?? doctor.doctor_Contract.doctor_JoiningDate,
        doctor_Agreement: { filePath: newDoctor_AgreementPath }
      }
    };

    const updatedDoctor = await hospitalModel.Doctor.findByIdAndUpdate(
      doctorId,
      doctorUpdateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'user',
      select: 'user_Identifier user_Name user_Email user_Password user_CNIC user_Access user_Contact isVerified isDeleted user_Address'
    });

    if (!updatedDoctor) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the doctor",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating doctor:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      let fieldName = field;
      if (field === 'user_Email') fieldName = 'email';
      if (field === 'user_CNIC') fieldName = 'CNIC';
      if (field === 'user_Contact') fieldName = 'contact number';

      return res.status(409).json({
        success: false,
        message: `This ${fieldName} (${value}) is already registered. Please use a different ${fieldName}.`,
        errorType: 'DUPLICATE_KEY',
        field: fieldName,
        value: value
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAllDoctorsByDepartmentName = async (req, res) => {
  try {
    const { departmentName } = req.params;
    // console.log("Requested department:", departmentName);
    // console.log("Params:", req.params);

    const department = await hospitalModel.Department.findOne({
      name: departmentName,
      deleted: false
    })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Find all doctors in this department (using department name)
    const doctors = await hospitalModel.Doctor.find({
      doctor_Department: departmentName,
      deleted: false,
    }).populate({
      path: 'user',
      select: 'user_Identifier user_Name user_Email user_CNIC user_Access user_Contact isVerified isDeleted  user_Address' // Only include these fields from User
    });

    return res.status(200).json({
      success: true,
      message: doctors.length ? "Doctors retrieved successfully" : "No doctors found in this department",
      data: {
        department: {
          _id: department._id,
          name: department.name,
        },
        count: doctors.length,
        doctors,
      },
    });

  } catch (error) {
    console.error("Error fetching doctors by department name:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const doctor = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  deleteDoctor,
  updateDoctor,
  getAllDoctorsByDepartmentName,
};
module.exports = doctor;
