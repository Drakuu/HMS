const fs = require('fs');
const path = require('path');
// const RadiologyReport = require("../models/RadiologyReport");
const utils = require('../utils/utilsIndex');
const hospitalModel = require('../models/index.model');

// Utility functions
const loadTemplate = (templateName) => {
  const filePath = path.join(__dirname, '../templates', `${templateName}.html`);
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Template ${templateName} not found`);
  }
};

const getAvailableTemplates = async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../templates');
    const files = fs.readdirSync(templatesDir);
    const templates = files
      .filter((file) => file.endsWith('.html'))
      .map((file) => file.replace('.html', ''));

    res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available templates',
    });
  }
};

// ---- helpers ----
const normalizeTemplates = (t) => {
  const list = Array.isArray(t) ? t : [t];
  return list.filter(Boolean).map((x) => {
    const name = String(x).trim();
    return name.toLowerCase().endsWith('.html') ? name : `${name}.html`;
  });
};

const toStringArray = (v) =>
  (Array.isArray(v) ? v : [v]).map((x) => (x == null ? '' : String(x)));

const genHtmlFromTemplate = (tpl) =>
  `<h2 style="text-align:center;"><strong>${tpl.replace(
    '.html',
    ''
  )}</strong></h2>`;

const safeNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const createReport = async (req, res) => {
  try {
    const {
      patientMRNO,
      patientName,
      patient_ContactNo,
      age, // NOTE: schema is Date; pass DOB/ISO date if you really use it
      sex,
      date, // optional report date
      templateName, // string | string[]
      finalContent, // string | string[] (optional now)
      referBy,

      totalAmount, // required (number)
      paidAmount, // legacy field -> we map to advanceAmount
      discount, // number
    } = req.body;

    // basic validation
    if (
      !templateName ||
      (Array.isArray(templateName) && templateName.length === 0)
    ) {
      return res
        .status(400)
        .json({ message: 'Template name is required', statusCode: 400 });
    }
    if (totalAmount === undefined || totalAmount === null) {
      return res
        .status(400)
        .json({ message: 'totalAmount is required', statusCode: 400 });
    }

    // normalize arrays
    const templateArr = normalizeTemplates(templateName);

    // build/generate finalContent array
    let finalContentArr;
    if (finalContent == null) {
      // auto-generate HTML per template if frontend didn't send it
      finalContentArr = templateArr.map((t) => genHtmlFromTemplate(t));
    } else {
      finalContentArr = toStringArray(finalContent);
      if (finalContentArr.length !== templateArr.length) {
        return res.status(400).json({
          message: 'templateName and finalContent must be the same length.',
          statusCode: 400,
          details: {
            templateCount: templateArr.length,
            contentCount: finalContentArr.length,
          },
        });
      }
    }

    // patient MRNO resolution / generation
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    let finalMRNO = (patientMRNO || '').trim();
    if (!finalMRNO) {
      finalMRNO = await utils.generateUniqueMrNo(currentDate);
    } else {
      // verify MRNO exists in patients (optional)
      const exists = await hospitalModel.Patient.exists({
        deleted: false,
        patient_MRNo: finalMRNO,
      });
    }

    // user
    const createdBy = req.user?.id || null;
    const performedBy = {
      name: req.user?.user_Name || 'Unknown',
      id: req.user?.id || null,
    };

    // billing
    const totalAmt = safeNum(totalAmount);
    const discountAmt = safeNum(discount);
    const totalPaid = safeNum(paidAmount); // we treat this as upfront/advance
    const remainingAmount = Math.max(0, totalAmt - (totalPaid + discountAmt));
    const paymentStatus =
      remainingAmount <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';

    // create report (one document per call)
    const saved = await hospitalModel.RadiologyReport.create({
      patientMRNO: finalMRNO,
      patientName: patientName || '',
      patient_ContactNo: patient_ContactNo || '',
      age: age ? new Date(age) : null, // if this is DOB
      sex: sex || '',
      date: date ? new Date(date) : now,

      templateName: templateArr, // array
      finalContent: finalContentArr, // array

      referBy: referBy || '',
      deleted: false,

      // Billing Info
      totalAmount: totalAmt,
      discount: discountAmt,
      advanceAmount: totalPaid, // map paidAmount -> advanceAmount for consistency
      paidAfterReport: 0,
      totalPaid: totalPaid,
      remainingAmount,
      refundableAmount: totalPaid,
      paymentStatus,

      refunded: [],
      history: [
        {
          action: 'created',
          performedBy: performedBy.name || 'Unknown',
          createdAt: now,
        },
      ],

      performedBy,
      createdBy,
      createdAt: now,
      updatedAt: now,
    });

    // shape response (kept close to your prior format)
    const formattedResponse = {
      ...saved.toObject(),
      patientId: {
        name: saved.patientName,
        patient_ContactNo: saved.patient_ContactNo,
        mrNo: saved.patientMRNO,
        gender: saved.sex,
        contactNo: saved.patient_ContactNo || '',
      },
      procedures: saved.templateName.map((t) => ({
        name: t.replace('.html', ''),
        price: null, // if you need per-procedure prices, send them and sum on total
        advanceAmount: null,
        discountAmount: null,
        status: saved.paymentStatus,
      })),
    };

    return res.status(201).json({ success: true, data: formattedResponse });
  } catch (error) {
    console.error('Error creating report:', error);
    const msg = error?.message?.startsWith?.('Template')
      ? error.message
      : error?.message || 'Failed to create report.';
    return res.status(500).json({ message: msg, statusCode: 500 });
  }
};

const getReport = async (req, res) => {
  try {
    const reports = await hospitalModel.RadiologyReport.find().sort({
      createdAt: -1,
    });
    const patientlist = await hospitalModel.Patient.find({
      deleted: false,
    }).sort({ createdAt: -1 });
    // console.log("sdf", reports);
    res.status(200).json({
      success: true,
      count: reports.length,
      data: { reports, totalPatients: patientlist },
    });
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports.',
    });
  }
};

const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientName,
      age,
      sex,
      date,
      finalContent,
      templateName,
      patient_ContactNo,
    } = req.body;

    const report = await hospitalModel.RadiologyReport.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Update basic fields
    report.patientName = patientName || report.patientName;
    report.patient_ContactNo = patient_ContactNo || report.patient_ContactNo;
    report.age = age || report.age;
    report.sex = sex || report.sex;
    report.date = date || report.date;

    // Handle template change
    if (
      templateName &&
      templateName !== report.templateName.replace('.html', '')
    ) {
      const rawTemplate = loadTemplate(templateName);
      report.finalContent = rawTemplate; //fillTemplate(rawTemplate);
      report.templateName = `${templateName}.html`;
    }

    // Manual content update takes precedence
    if (finalContent) {
      report.finalContent = finalContent;
    }

    await report.save();

    res.status(200).json({ message: 'Report updated', report });
  } catch (error) {
    console.error('Update report error:', error.message);
    res.status(500).json({ message: 'Failed to update report' });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await hospitalModel.RadiologyReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report by ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
    });
  }
};

const getRadiologyReportSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate && !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a startDate or endDate',
      });
    }

    // Construct query
    let query = { deleted: false };

    if (startDate && !endDate) {
      const sDate = new Date(startDate);
      query.date = {
        $gte: new Date(sDate.setHours(0, 0, 0, 0)),
        $lt: new Date(sDate.setHours(23, 59, 59, 999)),
      };
    } else if (startDate && endDate) {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      query.date = {
        $gte: new Date(sDate.setHours(0, 0, 0, 0)),
        $lte: new Date(eDate.setHours(23, 59, 59, 999)),
      };
    }

    // Find matching radiology reports
    const reports = await hospitalModel.RadiologyReport.find(query)
      .sort({ date: 1 })
      .select(
        'patientMRNO patientName patient_ContactNo age sex date templateName referBy createdAt'
      )
      .lean();

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching radiology reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// GET /radiology/get-report-by-mrno/:mrno
const getReportByMrno = async (req, res) => {
  try {
    const { mrno } = req.params;
    if (!mrno)
      return res
        .status(400)
        .json({ success: false, message: 'mrno is required' });

    const doc = await hospitalModel.RadiologyReport.findOne({
      patientMRNO: mrno,
      deleted: false,
    }).sort({ updatedAt: -1 });

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'No report found for this MRNO' });
    }
    return res.json({ success: true, data: doc });
  } catch (e) {
    console.error('getReportByMrno error:', e);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch report' });
  }
};

module.exports = {
  getAvailableTemplates,
  createReport,
  getReport,
  updateReport,
  getReportById,
  getRadiologyReportSummary,
  getReportByMrno,
};
