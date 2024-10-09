const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

// CSV 報表生成
async function generateCSV(data) {
  const fields = ['totalOrders', 'totalRevenue', 'successRate', 'averageDeliveryTime'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(data);

  const filePath = path.join(__dirname, `../exports/report-${Date.now()}.csv`);
  fs.writeFileSync(filePath, csv);

  return `https://your-server.com/exports/${path.basename(filePath)}`;
}

// Excel 報表生成
async function generateExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Report');

  sheet.columns = [
    { header: 'Total Orders', key: 'totalOrders', width: 15 },
    { header: 'Total Revenue', key: 'totalRevenue', width: 15 },
    { header: 'Success Rate (%)', key: 'successRate', width: 20 },
    { header: 'Average Delivery Time (mins)', key: 'averageDeliveryTime', width: 25 },
  ];

  sheet.addRow(data);

  const filePath = path.join(__dirname, `../exports/report-${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  return `https://your-server.com/exports/${path.basename(filePath)}`;
}

module.exports = { generateCSV, generateExcel };