const Appointment = require('../models/appointment.model');
// const generateUniqueMrNo = require('../utils/generateUniqueMrNo');
const utils = require('../utils/utilsIndex');
const createAppointment = async (req, res) => {
    try {
        const {
            patientName,
            appointmentPatientCNIC,
            appointmentDate,  // Make sure this is passed in format "YYYY-MM-DD"
            appointmentTime,
            appointmentDoctorName,
            appointmentType,
            appointmentStatus,
            message
        } = req.body;

        const MRNOappointment = await utils.generateUniqueMrNo(appointmentDate);
        const token = await utils.generateUniqueToken(appointmentDate);
        
        const newAppointment = new Appointment({
            patientName,
            appointmentPatientCNIC,
            appointmentMRNO: MRNOappointment,
            appointmentDate,
            appointmentTime,
            appointmentDoctorName,
            appointmentType,
            appointmentStatus,
            token: token,
            message
        });

        const savedAppointment = await newAppointment.save();
        return res.status(200).json({
            success: true,
            message: "Appointment created successfully",
            information: savedAppointment,
        });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the appointment",
            error: error.message,
        });
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({});
        return res.status(200).json({
            success: true,
            message: "Appointments retrieved successfully",
            information: appointments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving appointments",
            error: error.message,
        });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true }
        );
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        res.json({ success: true, appointment });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the appointment",
            error: error.message,
        });
    }
};

const restoreAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { deleted: false },
            { new: true }
        );
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        res.json({ success: true, appointment });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while restoring the appointment",
            error: error.message,
        });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            patientName,
            appointmentPatientCNIC,
            appointmentDate,
            appointmentTime,
            appointmentDoctorName,
            appointmentType,
            appointmentStatus,
            message
        } = req.body;

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            {
                patientName,
                appointmentPatientCNIC,
                appointmentDate,
                appointmentTime,
                appointmentDoctorName,
                appointmentType,
                appointmentStatus,
                message
            },
            { new: true, runValidators: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment updated successfully",
            information: updatedAppointment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the appointment",
            error: error.message,
        });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    updateAppointment,
    deleteAppointment,
    restoreAppointment
};
