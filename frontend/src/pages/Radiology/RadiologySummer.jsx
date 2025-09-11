import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchRadiologyReportsByDate } from '../../features/Radiology/RadiologySlice';
import { Button } from '@mui/material';
import ReactDOMServer from 'react-dom/server';
import PrintRadiologySummary from './PrintRadiologySummer';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Assignment as ReportIcon,
  LocalHospital as DoctorIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(0, 150, 137, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 150, 137, 0.15)',
  transition: 'transform 0.3s ease',
  '&:hover': { transform: 'translateY(-4px)' },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: 'transparent',
  borderRadius: '12px',
  overflow: 'hidden',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(0, 150, 137, 0.3)' },
    '&:hover fieldset': { borderColor: '#009689' },
    '&.Mui-focused fieldset': { borderColor: '#009689' },
  },
  '& .MuiInputBase-input': { color: '#333' },
}));

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

const formatAge = (age) => {
  if (!age) return 'N/A';
  if (typeof age === 'string' && age.includes('years')) return age;
  if (typeof age === 'string' && age.includes('-')) {
    try {
      const birthDate = new Date(age);
      const now = new Date();
      let years = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) years--;
      return `${years} years`;
    } catch {
      return 'N/A';
    }
  }
  return s(age);
};
// ----------------------------------

const RadiologySummary = () => {
  const { date } = useParams();
  const dispatch = useDispatch();
  const { filteredReports, status } = useSelector((state) => state.radiology);
  const [searchTerm, setSearchTerm] = useState('');

  let startDate = null;
  let endDate = null;

  if (date) {
    const parts = date.split('_');
    if (parts.length === 2) {
      startDate = parts[0];
      endDate = parts[1];
    } else if (parts.length === 1) {
      startDate = parts[0];
    }
  }

  useEffect(() => {
    const dateRange = { startDate, endDate };
    dispatch(fetchRadiologyReportsByDate(dateRange));
  }, [dispatch, startDate, endDate]);

  const baseReports = Array.isArray(filteredReports) ? filteredReports : [];

  const filteredData = baseReports.filter((report) => {
    const q = s(searchTerm).toLowerCase();
    if (!q) return true;
    return (
      s(report?.patientName).toLowerCase().includes(q) ||
      s(report?.patientMRNO).toLowerCase().includes(q) ||
      s(report?.referBy).toLowerCase().includes(q)
    );
  });

  const getStatusColor = (st) => {
    switch (st) {
      case 'pending':
        return 'warning';
      case 'completed':
      case 'paid':
        return 'success';
      case 'cancelled':
      case 'refunded':
        return 'error';
      case 'partial':
        return 'info';
      default:
        return 'info';
    }
  };

  const preparePrintData = (reports) => {
    if (!reports || reports.length === 0) return [];
    return reports.map((report) => ({
      ...report,
      age: formatAge(report.age),
      templateName: formatTemplates(report.templateName),
      sex: report.sex
        ? report.sex.charAt(0).toUpperCase() + report.sex.slice(1).toLowerCase()
        : 'N/A',
    }));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for printing');
      return;
    }

    const preparedData = preparePrintData(filteredData);

    const printContent = ReactDOMServer.renderToStaticMarkup(
      <PrintRadiologySummary
        reports={preparedData}
        dateRange={{ startDate, endDate }}
      />
    );

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Radiology Reports Summary</title>
          <style>
            /* You can keep or add your print styles here */
            body { font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>${printContent}</body>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 200);
          };
        </script>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDateSafe = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
    } catch {
      try {
        return new Date(dateString).toLocaleString();
      } catch {
        return s(dateString);
      }
    }
  };

  return (
    <Box
      sx={{ p: 4, background: '#FFFFFF', minHeight: '100vh', color: '#333' }}
    >
      <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: '#009689', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              Radiology Dashboard
            </Typography>
            <Box>
              {['refresh', 'print'].map((action) => (
                <Tooltip
                  key={action}
                  title={action.charAt(0).toUpperCase() + action.slice(1)}
                >
                  <IconButton
                    component={motion.button}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      color: '#009689',
                      background: 'rgba(0, 150, 137, 0.1)',
                      mr: 1,
                      '&:hover': { background: 'rgba(0, 150, 137, 0.2)' },
                    }}
                    onClick={
                      action === 'print'
                        ? handlePrint
                        : () => window.location.reload()
                    }
                  >
                    {action === 'refresh' ? <RefreshIcon /> : <PrintIcon />}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Box>
        </motion.div>

        <StyledCard>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <StyledTextField
              variant="outlined"
              size="small"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#009689' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />

            {/* FIX: Tooltip must wrap a single child only */}
            <Tooltip title="Filter">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  color: '#009689',
                  background: 'rgba(0, 150, 137, 0.1)',
                  '&:hover': { background: 'rgba(0, 150, 137, 0.2)' },
                }}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>

            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                px: 3,
                py: 1,
                fontWeight: 'bold',
                borderRadius: '999px',
                color: '#009688',
                backgroundColor: 'rgba(0, 150, 137, 0.1)',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(0, 150, 137, 0.2)' },
              }}
            >
              Total Patients: {filteredData.length}
            </Button>
          </Box>

          {status === 'loading' && (
            <LinearProgress
              sx={{
                backgroundColor: 'rgba(0,150,137,0.1)',
                '& .MuiLinearProgress-bar': { backgroundColor: '#009689' },
              }}
            />
          )}

          <StyledTableContainer>
            <Table
              sx={{
                minWidth: 650,
                '& th, & td': {
                  color: '#333',
                  borderColor: 'rgba(0,150,137,0.1)',
                },
              }}
            >
              <TableHead>
                <TableRow>
                  {[
                    'Token #',
                    'MR No.',
                    'Patient',
                    'Test',
                    'Referred By',
                    'Date/Time',
                    'Status',
                    'Actions',
                  ].map((header) => (
                    <TableCell key={header}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="#009689"
                      >
                        {header}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredData.map((report, index) => (
                    <motion.tr
                      key={report._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>#{index + 1}</TableCell>

                      <TableCell>
                        <Chip
                          label={report.patientMRNO}
                          size="small"
                          sx={{
                            background: 'rgba(0,150,137,0.1)',
                            color: '#009689',
                            '&:hover': { background: 'rgba(0,150,137,0.2)' },
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 1,
                              background: 'rgba(0,150,137,0.1)',
                              '& svg': { color: '#009689' },
                            }}
                          >
                            {s(report.sex).toLowerCase() === 'female' ? (
                              <FemaleIcon />
                            ) : (
                              <MaleIcon />
                            )}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              color="#333"
                            >
                              {report.patientName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="rgba(0,0,0,0.6)"
                            >
                              {formatAge(report.age)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ReportIcon sx={{ mr: 1, color: '#009689' }} />
                          <Typography variant="body2" color="#333">
                            {formatTemplates(report.templateName)}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DoctorIcon sx={{ mr: 1, color: '#009689' }} />
                          <Typography variant="body2" color="#333">
                            {report.referBy || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon sx={{ mr: 1, color: '#009689' }} />
                          <Typography variant="body2" color="#333">
                            {formatDateSafe(report.date)}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={s(
                            report.paymentStatus || report.status || 'pending'
                          )}
                          color={getStatusColor(
                            s(
                              report.paymentStatus || report.status || 'pending'
                            )
                          )}
                          size="small"
                          sx={{
                            background: 'rgba(0,150,137,0.1)',
                            color: '#009689',
                            '&:hover': { background: 'rgba(0,150,137,0.2)' },
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        {['primary', 'secondary'].map((color, idx) => (
                          <IconButton
                            key={idx}
                            size="small"
                            component={motion.button}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            sx={{
                              color: color === 'primary' ? '#009689' : '#333',
                              '&:hover': { background: 'rgba(0,150,137,0.1)' },
                            }}
                          >
                            {idx === 0 ? <PersonIcon /> : <ReportIcon />}
                          </IconButton>
                        ))}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </StyledTableContainer>
        </StyledCard>

        {filteredData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 200,
              }}
            >
              <Typography variant="h6" color="rgba(0,0,0,0.6)">
                No reports found for the selected criteria
              </Typography>
            </Box>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default RadiologySummary;
