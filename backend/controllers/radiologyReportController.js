const fs = require("fs");
const path = require("path");
// const RadiologyReport = require("../models/RadiologyReport");
const utils = require("../utils/utilsIndex");
const hospitalModel = require("../models/index.model");

// Utility functions
const loadTemplate = (templateName) => {
  const filePath = path.join(__dirname, "../templates", `${templateName}.html`);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Template ${templateName} not found`);
  }
};

const getAvailableTemplates = async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, "../templates");
    const files = fs.readdirSync(templatesDir);
    const templates = files
      .filter((file) => file.endsWith(".html"))
      .map((file) => file.replace(".html", ""));

    res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available templates",
    });
  }
};

const createReport = async (req, res) => {
  try {
    const { patientMRNO, patientName, age, sex, templateName, referBy, totalAmount, paidAmount, discount, patient_ContactNo } = req.body;
console.log("thde kjdfpatient_ContactNopatient_ContactNo: ",patient_ContactNo)
    if (!templateName) {
      return res.status(400).json({ message: "Template name is required" });
    }
    if (!totalAmount) {
      return res.status(400).json({ message: "totalAmount is required" });
    }

    const patientList = await hospitalModel.Patient.find({ deleted: false }).sort({ createdAt: -1 });
    const patientMrIds = patientList.map(m => m.patient_MRNo);

    const date = new Date();
    const currentDate = date.toISOString().split("T")[0];

    // If MRNO is missing or empty, generate a new one
    let finalMRNO = patientMRNO?.trim();
    if (!finalMRNO) {
      finalMRNO = await utils.generateUniqueMrNo(currentDate);
    } else if (!patientMrIds.includes(finalMRNO)) {
      throw new Error("MRNO not found in any patient");
    }

    const rawTemplate = loadTemplate(templateName);
    const finalHtml = rawTemplate; // fillTemplate(rawTemplate)

    const createdBy = req.user?.id || "defaultDoctorId";
    const performedBy = {
      name: req.user?.user_Name || "Unknown",
      id: req.user?.id || "defaultDoctorId",
    };

    // Calculate billing fields
    const totalPaid = paidAmount || 0;
    const discountAmount = discount || 0;
    const remainingAmount = totalAmount - (totalPaid + discountAmount);
    const paymentStatus = remainingAmount <= 0 ? "paid" : totalPaid > 0 ? "partial" : "pending";

    const saved = await hospitalModel.RadiologyReport.create({
      patientMRNO: finalMRNO,
      patientName,
      patient_ContactNo,
      age,
      sex,
      date,
      finalContent: finalHtml,
      totalAmount,
      totalPaid,
      advanceAmount: totalPaid, // Map paidAmount to advanceAmount for consistency
      discount: discountAmount,
      remainingAmount,
      paymentStatus,
      refundableAmount: totalPaid, // Initially, refundable is totalPaid
      refunded: [],
      referBy,
      performedBy,
      createdBy,
      templateName: `${templateName}.html`,
    });

    // Format response to align with BillsTable.jsx expectations
    const formattedResponse = {
      ...saved._doc,
      patientId: {
        name: saved.patientName,
        patient_ContactNo: saved.patient_ContactNo,
        mrNo: saved.patientMRNO,
        gender: saved.sex,
        contactNo: "", // Add if available in Patient model
      },
      procedures: [{
        name: saved.templateName.replace(".html", ""),
        price: saved.totalAmount,
        advanceAmount: saved.advanceAmount,
        discountAmount: saved.discount,
        status: saved.paymentStatus,
      }],
    };

    res.status(201).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      message: error.message.startsWith("Template")
        ? error.message
        : "Failed to create report.",
    });
  }
};


const getReport = async (req, res) => {

  try {
    const reports = await hospitalModel.RadiologyReport.find().sort({ createdAt: -1 });
    const patientlist = await hospitalModel.Patient.find({deleted:false}).sort({ createdAt: -1 });
    // console.log("sdf", reports);
    res.status(200).json({
      success: true,
      count: reports.length,
      data: {reports,
        totalPatients:patientlist
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports.",
    });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, age, sex, date, finalContent, templateName, patient_ContactNo } =
      req.body;

    const report = await hospitalModel.RadiologyReport.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Update basic fields
    report.patientName = patientName || report.patientName;
    report.patient_ContactNo = patient_ContactNo || report.patient_ContactNo;
    report.age = age || report.age;
    report.sex = sex || report.sex;
    report.date = date || report.date;

    // Handle template change
    if (
      templateName &&
      templateName !== report.templateName.replace(".html", "")
    ) {
      const rawTemplate = loadTemplate(templateName);
      report.finalContent = rawTemplate//fillTemplate(rawTemplate);
      report.templateName = `${templateName}.html`;
    }

    // Manual content update takes precedence
    if (finalContent) {
      report.finalContent = finalContent;
    }

    await report.save();

    res.status(200).json({ message: "Report updated", report });
  } catch (error) {
    console.error("Update report error:", error.message);
    res.status(500).json({ message: "Failed to update report" });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await hospitalModel.RadiologyReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report by ID:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
};

const getRadiologyReportSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate && !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a startDate or endDate'
      });
    }

    // Construct query
    let query = { deleted: false };

    if (startDate && !endDate) {
      const sDate = new Date(startDate);
      query.date = {
        $gte: new Date(sDate.setHours(0, 0, 0, 0)),
        $lt: new Date(sDate.setHours(23, 59, 59, 999))
      };
    } else if (startDate && endDate) {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      query.date = {
        $gte: new Date(sDate.setHours(0, 0, 0, 0)),
        $lte: new Date(eDate.setHours(23, 59, 59, 999))
      };
    }

    // Find matching radiology reports
    const reports = await hospitalModel.RadiologyReport.find(query)
      .sort({ date: 1 })
      .select('patientMRNO patientName patient_ContactNo age sex date templateName referBy createdAt')
      .lean();

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {
    console.error('Error fetching radiology reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAvailableTemplates,
  createReport,
  getReport,
  updateReport,
  getReportById,
  getRadiologyReportSummary,
};
