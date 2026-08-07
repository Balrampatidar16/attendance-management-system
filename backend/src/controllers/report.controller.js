import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as reportService from '../services/report.service.js';

export const daily = asyncHandler(async (req, res) => {
  const { date, records } = await reportService.getDailyReport(req.user, req.query.date);
  return res.status(200).json(new ApiResponse(200, 'Daily attendance report', { date, records }));
});

export const range = asyncHandler(async (req, res) => {
  const { startDate, endDate, records } = await reportService.getRangeReport(req.user, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Attendance range report', { startDate, endDate, records }));
});

export const exportExcel = asyncHandler(async (req, res) => {
  const { records } = await reportService.resolveReportRecords(req.user, req.query);
  const workbook = reportService.buildExcelWorkbook(records);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
});

export const exportPdf = asyncHandler(async (req, res) => {
  const { records } = await reportService.resolveReportRecords(req.user, req.query);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.pdf"');

  const doc = reportService.buildPdfDocument(records);
  doc.pipe(res);
});
