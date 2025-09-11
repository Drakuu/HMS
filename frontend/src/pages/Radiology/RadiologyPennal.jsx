import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllRadiologyReports,
  fetchAvailableTemplates,
  createRadiologyReport,
  updateRadiologyReport,
} from '../../features/Radiology/RadiologySlice';
import { format } from 'date-fns';
import RadiologyReportForm from './RadiologyReportForm';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  IconButton,
  Collapse,
  Chip,
  Avatar,
  InputAdornment,
  TableFooter,
  TablePagination,
} from '@mui/material';

// Alias the inline date range picker
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// MUI X pickers for the filter fields
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';

import {
  FiEye,
  FiFilter,
  FiX,
  FiSearch,
  FiPlus,
  FiUser,
  FiCalendar,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import doctorList from '../../utils/doctors';
import { motion } from 'framer-motion';

// ---------- SAFE HELPERS ----------
const s = (v) => (v ?? '').toString();

const formatTemplates = (tplArr) => {
  if (!Array.isArray(tplArr)) {
    return s(tplArr).replace('.html', '').replace(/-/g, ' ');
  }
  return tplArr
    .map((t) => s(t).replace('.html', '').replace(/-/g, ' '))
    .filter(Boolean)
    .join(', ');
};

const normalizeTemplates = (t) => {
  const list = Array.isArray(t) ? t : [t];
  return list.filter(Boolean).map((x) => {
    const name = String(x).trim();
    return name.toLowerCase().endsWith('.html') ? name : `${name}.html`;
  });
};
// ----------------------------------

const RadiologyPanel = () => {
  const dispatch = useDispatch();
  const { reports, templates, isLoading, isError, error } = useSelector(
    (state) => state.radiology
  );

  // FIX: correct user selection and guards
  const user = useSelector((state) => state.auth?.user);
  const access = user?.user_Access;
  const isRadiology = access === 'Radiology';
  const isAdmin = access === 'Admin';

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isMRNLocked, setIsMRNLocked] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showSummaryDatePicker, setShowSummaryDatePicker] = useState(false);
  const [summaryDates, setSummaryDates] = useState({
    startDate: new Date(),
    endDate: null,
  });
  const filterRef = useRef(null);

  // Dialog form state: keep arrays to match API
  const [newReport, setNewReport] = useState({
    patientMRNO: '',
    patientName: '',
    patient_ContactNo: '',
    age: null,
    sex: '',
    date: new Date(),
    templateName: [], // array
    finalContent: [], // array (optional; send only if you collect per-template HTML)
    referBy: '',
    totalAmount: '',
    paidAmount: '',
    discount: '',
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    gender: '',
    doctor: '',
    fromDate: null,
    toDate: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchAllRadiologyReports());
    dispatch(fetchAvailableTemplates());
  }, [dispatch]);

  const handleOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewReport({
      patientMRNO: '',
      patientName: '',
      patient_ContactNo: '',
      age: null,
      sex: '',
      date: new Date(),
      templateName: [], // keep arrays on reset
      finalContent: [],
      referBy: '',
      totalAmount: '',
      paidAmount: '',
      discount: '',
    });
    setIsMRNLocked(false);
  };

  // Pagination handlers
  const handleChangePage = (_event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'patientMRNO' && !isMRNLocked) {
      const matchedPatient = (reports?.totalPatients || []).find(
        (p) => s(p?.patient_MRNo) === s(value)
      );

      if (matchedPatient) {
        setNewReport((prev) => ({
          ...prev,
          patientMRNO: value,
          patientName: matchedPatient.patient_Name,
          patient_ContactNo: matchedPatient.patient_ContactNo,
          age: matchedPatient.patient_Age,
          sex: matchedPatient.patient_Gender,
        }));
      } else {
        setNewReport((prev) => ({
          ...prev,
          patientMRNO: value,
          patientName: '',
          patient_ContactNo: '',
          age: null,
          sex: '',
        }));
      }
    } else {
      setNewReport((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAgeChange = (newDate) => {
    setNewReport((prev) => ({
      ...prev,
      age: newDate,
    }));
  };

  const handleSubmit = (formData) => {
    // Normalize template names to array of ".html"
    const templateArr = normalizeTemplates(formData.templateName);

    // If you also collect per-template HTML, ensure same length and attach:
    // const finalContent =
    //   Array.isArray(formData.finalContent) && formData.finalContent.length === templateArr.length
    //     ? formData.finalContent
    //     : undefined; // omit to let backend auto-generate

    const payload = {
      patientMRNO: formData.patientMRNO,
      patientName: formData.patientName,
      patient_ContactNo: formData.patient_ContactNo,
      age: formData.age ? formData.age.toISOString() : null,
      sex: formData.sex,
      date: formData.date
        ? formData.date.toISOString()
        : new Date().toISOString(),
      referBy: formData.referBy,
      templateName: templateArr, // send normalized array
      // ...(finalContent ? { finalContent } : {}), // include only if you have it
      totalAmount: Number(formData.totalAmount) || 0,
      paidAmount: Number(formData.paidAmount) || 0,
      discount: Number(formData.discount) || 0,
    };

    dispatch(createRadiologyReport(payload))
      .unwrap()
      .then(() => {
        handleCloseDialog();
        dispatch(fetchAllRadiologyReports());
      })
      .catch((err) => {
        console.error('Error creating report:', err);
        setErrors({
          submit: 'Failed to create report. Please try again.',
        });
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name) =>
    s(name)
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  // Filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleDateFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      gender: '',
      doctor: '',
      fromDate: null,
      toDate: null,
    });
    setPage(0);
  };

  // Filter reports based on filter criteria
  const filteredReports = (
    Array.isArray(reports?.reports) ? reports.reports : []
  ).filter((report) => {
    // Search term filter
    if (filters.searchTerm) {
      const q = s(filters.searchTerm).toLowerCase();
      const hit =
        s(report?.patientMRNO).toLowerCase().includes(q) ||
        s(report?.patientName).toLowerCase().includes(q) ||
        s(report?.patientCNIC).includes(filters.searchTerm);
      if (!hit) return false;
    }

    // Gender
    if (filters.gender && report.sex !== filters.gender) return false;

    // Doctor
    if (filters.doctor && report.referBy !== filters.doctor) return false;

    // Date range
    const reportDate = new Date(report.date);
    if (filters.fromDate && reportDate < new Date(filters.fromDate))
      return false;
    if (filters.toDate && reportDate > new Date(filters.toDate)) return false;

    return true;
  });

  // Pagination
  const paginatedReports = filteredReports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ padding: 3, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ color: '#111827', fontWeight: 700, letterSpacing: '-0.5px' }}
        >
          Radiology Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search reports..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch color="#6b7280" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '8px',
                backgroundColor: 'white',
                width: '280px',
              },
            }}
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
          />
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FiFilter />}
            sx={{
              borderRadius: '8px',
              borderColor: '#e5e7eb',
              color: '#374151',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                borderColor: '#d1d5db',
                backgroundColor: 'rgba(0,0,0,0.08)',
              },
            }}
          >
            Filters
          </Button>
          <motion.div className="relative">
            <Button
              variant="contained"
              onClick={() => setShowSummaryDatePicker(!showSummaryDatePicker)}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'gray',
                color: 'white',
                textTransform: 'none',
                px: 3,
                marginX: 1,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: '#004B44',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              Summary
            </Button>
            {/* Summary Date Picker Popover */}
            {showSummaryDatePicker && (
              <Box
                sx={{
                  position: 'absolute',
                  zIndex: 1300,
                  right: 0,
                  mt: 1,
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
                  p: 2,
                }}
              >
                <ReactDatePicker
                  selectsRange
                  startDate={summaryDates.startDate}
                  endDate={summaryDates.endDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setSummaryDates({ startDate: start, endDate: end });
                  }}
                  inline
                />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Button
                    onClick={() => setShowSummaryDatePicker(false)}
                    variant="outlined"
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const { startDate, endDate } = summaryDates;
                      const fmt = (d) => format(d, 'yyyy-MM-dd');

                      if (startDate && endDate) {
                        if (isRadiology) {
                          navigate(
                            `/radiology/radiology-summer/${fmt(
                              startDate
                            )}_${fmt(endDate)}`
                          );
                        } else {
                          navigate(
                            `/lab/radiology-summer/${fmt(startDate)}_${fmt(
                              endDate
                            )}`
                          );
                        }
                      } else if (startDate) {
                        if (isRadiology) {
                          navigate(
                            `/radiology/radiology-summer/${fmt(startDate)}`
                          );
                        } else {
                          navigate(`/lab/radiology-summer/${fmt(startDate)}`);
                        }
                      } else {
                        alert('Please select at least one date.');
                      }

                      setShowSummaryDatePicker(false);
                    }}
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: '#009689' }}
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            )}
          </motion.div>
        </Box>
      </Box>

      {/* Filter Section */}
      <Collapse in={showFilters}>
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <Grid container spacing={3}>
            <Grid item className="w-24">
              <TextField
                fullWidth
                size="small"
                label="Gender"
                name="gender"
                select
                value={filters.gender}
                onChange={handleFilterChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              >
                <MenuItem value="">All Genders</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item className="w-24">
              <TextField
                fullWidth
                size="small"
                label="Referred By"
                name="doctor"
                select
                value={filters.doctor}
                onChange={handleFilterChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              >
                <MenuItem value="">All Doctors</MenuItem>
                {doctorList.map((doctor, index) => (
                  <MenuItem key={index} value={doctor}>
                    {doctor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MUIDatePicker
                  label="From Date"
                  value={filters.fromDate}
                  onChange={(newValue) =>
                    handleDateFilterChange('fromDate', newValue)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      sx: {
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MUIDatePicker
                  label="To Date"
                  value={filters.toDate}
                  onChange={(newValue) =>
                    handleDateFilterChange('toDate', newValue)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      sx: {
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Button
                onClick={resetFilters}
                startIcon={<FiX />}
                sx={{
                  color: '#6b7280',
                  textTransform: 'none',
                  '&:hover': { color: '#4f46e5' },
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: '#4f46e5' }} />
        </Box>
      )}
      {isError && (
        <Box
          sx={{
            backgroundColor: '#009689',
            color: 'black',
            p: 2,
            borderRadius: '8px',
            mb: 3,
          }}
        >
          <Typography>{error}</Typography>
        </Box>
      )}

      <Paper
        sx={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f9fafb' }}>
              <TableRow>
                <TableCell
                  sx={{
                    color: '#374151',
                    fontWeight: 600,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Patient
                </TableCell>
                <TableCell
                  sx={{
                    color: '#374151',
                    fontWeight: 600,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  MRN
                </TableCell>
                <TableCell
                  sx={{
                    color: '#374151',
                    fontWeight: 600,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Details
                </TableCell>
                <TableCell
                  sx={{
                    color: '#374151',
                    fontWeight: 600,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Procedure
                </TableCell>
                <TableCell
                  sx={{
                    color: '#374151',
                    fontWeight: 600,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Referred By
                </TableCell>
                <TableCell
                  sx={{
                    color: '#374151',
                    fontWeight: 600,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    color: '#374151',
                    fontWeight: 600,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <TableRow
                    key={report._id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { backgroundColor: '#f9fafb' },
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            backgroundColor: '#009689',
                            color: 'white',
                          }}
                        >
                          {getInitials(report.patientName)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            {report.patientName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {report.sex},{' '}
                            {report.age
                              ? new Date(report.age).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'numeric',
                                    day: 'numeric',
                                  }
                                )
                              : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.patientMRNO}
                        size="small"
                        sx={{
                          backgroundColor: '#009689',
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={<FiUser size={14} />}
                          label={report.sex || 'N/A'}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: '#e5e7eb' }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {formatTemplates(report?.templateName)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{report.referBy || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <FiCalendar color="#9ca3af" size={16} />
                        <Typography sx={{ color: '#6b7280' }}>
                          {formatDate(report.date)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          if (isRadiology) {
                            navigate(
                              `/radiology/RediologyPatientDetail/${report._id}`
                            );
                          } else if (isAdmin) {
                            navigate(
                              `/admin/RediologyPatientDetail/${report._id}`
                            );
                          } else {
                            navigate(
                              `/lab/RediologyPatientDetail/${report._id}`
                            );
                          }
                        }}
                        startIcon={<FiEye size={18} />}
                        sx={{
                          color: 'black',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: 'rgba(79, 70, 229, 0.04)',
                            color: '#004B44',
                          },
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <FiSearch size={48} color="#d1d5db" />
                      <Typography variant="h6" sx={{ color: '#6b7280' }}>
                        No reports found
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        Try adjusting your search or filter criteria
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={7}
                  count={filteredReports.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={({
                    onPageChange,
                    page,
                    count,
                    rowsPerPage,
                  }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                      <IconButton
                        onClick={() => onPageChange(null, page - 1)}
                        disabled={page === 0}
                        aria-label="previous page"
                      >
                        <FiChevronLeft />
                      </IconButton>
                      <IconButton
                        onClick={() => onPageChange(null, page + 1)}
                        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                        aria-label="next page"
                      >
                        <FiChevronRight />
                      </IconButton>
                    </Box>
                  )}
                  sx={{
                    '& .MuiTablePagination-selectLabel': { marginBottom: 0 },
                    '& .MuiTablePagination-displayedRows': { marginBottom: 0 },
                  }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for adding report */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#00897b',
            color: 'white',
            fontWeight: 700,
            py: 2,
            px: 3,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <FiEdit2 size={22} />
          <span>New Radiology Report</span>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <RadiologyReportForm
            formData={newReport}
            setFormData={setNewReport}
            errors={errors}
            setErrors={setErrors}
            templates={templates}
            onCancel={handleCloseDialog}
            onSubmit={handleSubmit}
            totalPatients={reports.totalPatients || []}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RadiologyPanel;
