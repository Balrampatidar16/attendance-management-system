import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Attendance from '../models/Attendance.model.js';
import ApiError from '../utils/ApiError.js';
import { getScopedUserIds, canAccessUser } from './scope.service.js';
import { normalizeDate, parseDateOnly, endOfDayUTC } from '../utils/dateHelper.js';

export const getDailyReport = async (reqUser, dateStr) => {
  const date = parseDateOnly(dateStr) || normalizeDate(new Date());
  const scopedIds = await getScopedUserIds(reqUser);
  const filter = { date, ...(scopedIds && { user: { $in: scopedIds } }) };

  const records = await Attendance.find(filter)
    .populate('user', 'name email employeeId department')
    .sort({ date: 1 });

  return { date, records };
};

export const getRangeReport = async (reqUser, { startDate, endDate, userId }) => {
  const start = parseDateOnly(startDate);
  const end = endOfDayUTC(endDate);
  if (!start || !end) {
    throw new ApiError(400, 'startDate and endDate are required (YYYY-MM-DD)');
  }

  if (userId) {
    const allowed = await canAccessUser(reqUser, userId);
    if (!allowed) {
      throw new ApiError(403, "You cannot access this user's report");
    }
  }

  const scopedIds = await getScopedUserIds(reqUser);
  const filter = {
    date: { $gte: start, $lte: end },
    ...(userId ? { user: userId } : scopedIds ? { user: { $in: scopedIds } } : {}),
  };

  const records = await Attendance.find(filter)
    .populate('user', 'name email employeeId department')
    .sort({ date: 1 });

  return { startDate: start, endDate: end, records };
};

// Used by the export endpoints, which accept either ?date= or ?startDate=&endDate= the same way
// the JSON /daily and /range endpoints do.
export const resolveReportRecords = async (reqUser, query) => {
  if (query.startDate || query.endDate) {
    return getRangeReport(reqUser, query);
  }
  return getDailyReport(reqUser, query.date);
};

const toRow = (record) => {
  const location = record.punchIn?.location;
  const locationLabel = location?.address
    ? location.address
    : location?.latitude
      ? `${location.latitude}, ${location.longitude}`
      : '-';

  return {
    name: record.user?.name || 'Unknown',
    employeeId: record.user?.employeeId || '',
    department: record.user?.department || '',
    date: record.date.toISOString().slice(0, 10),
    punchInTime: record.punchIn?.time ? new Date(record.punchIn.time).toLocaleTimeString() : '-',
    punchOutTime: record.punchOut?.time ? new Date(record.punchOut.time).toLocaleTimeString() : '-',
    workingHours: record.totalWorkingHours,
    workStatus: record.workStatus,
    verificationStatus: record.verificationStatus,
    location: locationLabel,
  };
};

export const buildExcelWorkbook = (records) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Attendance Management System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Attendance Report');
  sheet.columns = [
    { header: 'Employee', key: 'name', width: 24 },
    { header: 'Employee ID', key: 'employeeId', width: 14 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Punch In', key: 'punchInTime', width: 14 },
    { header: 'Punch Out', key: 'punchOutTime', width: 14 },
    { header: 'Working Hours', key: 'workingHours', width: 14 },
    { header: 'Status', key: 'workStatus', width: 14 },
    { header: 'Verification', key: 'verificationStatus', width: 14 },
    { header: 'Location', key: 'location', width: 32 },
  ];
  sheet.getRow(1).font = { bold: true };

  records.forEach((record) => sheet.addRow(toRow(record)));

  return workbook;
};

export const buildPdfDocument = (records, { title = 'Attendance Report' } = {}) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

  const headers = ['Employee', 'Emp ID', 'Date', 'Punch In', 'Punch Out', 'Hours', 'Status', 'Verified'];
  const colWidths = [130, 65, 70, 70, 70, 50, 75, 65];

  const drawRow = (values, y, isHeader = false) => {
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    let x = doc.page.margins.left;
    values.forEach((val, i) => {
      doc.text(String(val), x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });
  };

  doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
  doc.moveDown();

  let y = doc.y;
  drawRow(headers, y, true);
  y += 18;

  records.forEach((record) => {
    if (y > doc.page.height - doc.page.margins.bottom - 20) {
      doc.addPage();
      y = doc.page.margins.top;
      drawRow(headers, y, true);
      y += 18;
    }
    const row = toRow(record);
    drawRow(
      [
        row.name,
        row.employeeId,
        row.date,
        row.punchInTime,
        row.punchOutTime,
        row.workingHours,
        row.workStatus,
        row.verificationStatus,
      ],
      y
    );
    y += 16;
  });

  doc.end();
  return doc;
};
