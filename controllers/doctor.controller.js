const hospitalModel = require("../models/index.model");
const utils = require("../utils/utilsIndex");

const createDoctor = async (req, res) => {

  // Run this directly in MongoDB shell or via a temporary route
  try {
    const { doctor_Name, doctor_Email, doctor_Contact, doctor_Address, doctor_Department, doctor_CNIC, doctor_Type, doctor_Specialization, doctor_Qualifications, doctor_LicenseNumber, doctor_Fee, doctor_Contract, } = req.body;

    const doctor_Identifier = await utils.generateUniqueDoctorId(doctor_Name);

    const existingDoctor = await hospitalModel.Doctor.findOne({
      $or: [
        { doctor_Identifier },
        { doctor_CNIC: { $ne: null, $eq: doctor_CNIC } },
        { doctor_Contact: { $ne: null, $eq: doctor_Contact } },
        doctor_Email ? { doctor_Email } : false
      ].filter(Boolean) // Remove false values
    });

    if (existingDoctor) {
      let conflicts = [];

      if (existingDoctor.doctor_Identifier === doctor_Identifier) conflicts.push('ID');
      if (existingDoctor.doctor_CNIC === doctor_CNIC) conflicts.push('CNIC');
      if (existingDoctor.doctor_Contact === doctor_Contact) conflicts.push('contact');
      if (doctor_Email && existingDoctor.doctor_Email === doctor_Email) conflicts.push('email');

      return res.status(409).json({
        success: false,
        message: `Doctor with matching ${conflicts.join(', ')} already exists`,
        conflicts,
      });
    }

    const doctor_ImagePath = req.files?.doctor_Image
      ? `/uploads/doctor/images/${req.files.doctor_Image[0].filename}`
      : null;
    const doctor_AgreementPath = req.files?.doctor_Agreement
      ? `/uploads/doctor/agreements/${req.files.doctor_Agreement[0].filename}`
      : null;


    const newDoctor = await hospitalModel.Doctor.create({
      doctor_Identifier,
      doctor_Image: { filePath: doctor_ImagePath },
      doctor_Name,
      doctor_Email,
      doctor_Contact,
      doctor_Address,
      doctor_Department,
      doctor_CNIC,
      doctor_Type,
      doctor_Specialization,
      doctor_Qualifications,
      doctor_LicenseNumber,
      doctor_Fee,
      doctor_Contract: {
        ...doctor_Contract,
        doctor_Agreement: { filePath: doctor_AgreementPath },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Doctor created successfully",
      information: { newDoctor },
    });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await hospitalModel.Doctor.find({ deleted: false });

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

    const doctor = await hospitalModel.Doctor.findOne({
      _id: doctorId,
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

    const patients = await hospitalModel.Patient.find({
      "patient_HospitalInformation.doctor_Name": doctor.doctor_Name,
      "patient_HospitalInformation.doctor_Department": doctor.doctor_Department,
    })
    console.log("Doctor details: ", doctor.doctor_Name);

    // Mapping patients' information with the relevant doctor data
    const mappedPatients = patients.map((patient) => ({
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
    const doctor = await hospitalModel.Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor Not Found",
      });
    }

    const {
      doctor_Name,
      doctor_Email,
      doctor_Contact,
      doctor_Address,
      doctor_Department,
      doctor_CNIC,
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

    // Build update data
    const updateData = {
      doctor_Name: doctor_Name !== undefined ? doctor_Name : doctor.doctor_Name,
      doctor_Email: doctor_Email !== undefined ? doctor_Email : doctor.doctor_Email,
      doctor_Contact: doctor_Contact !== undefined ? doctor_Contact : doctor.doctor_Contact,
      doctor_Address: doctor_Address !== undefined ? doctor_Address : doctor.doctor_Address,
      doctor_Department: doctor_Department !== undefined ? doctor_Department : doctor.doctor_Department,
      doctor_CNIC: doctor_CNIC !== undefined ? doctor_CNIC : doctor.doctor_CNIC,
      doctor_Type: doctor_Type !== undefined ? doctor_Type : doctor.doctor_Type,
      doctor_Specialization: doctor_Specialization !== undefined ? doctor_Specialization : doctor.doctor_Specialization,
      doctor_Qualifications: doctor_Qualifications !== undefined ? doctor_Qualifications : doctor.doctor_Qualifications,
      doctor_LicenseNumber: doctor_LicenseNumber !== undefined ? doctor_LicenseNumber : doctor.doctor_LicenseNumber,
      doctor_Fee: doctor_Fee !== undefined ? doctor_Fee : doctor.doctor_Fee,
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
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedDoctor) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the doctor",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      information: updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
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
    });

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
