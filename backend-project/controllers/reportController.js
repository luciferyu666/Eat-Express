// backend-project/controllers/reportController.js

const PDFDocument = require('pdfkit');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

// 假設有相應的服務來獲取數據
const { getSystemReport, getUserBehaviorReport, getRestaurantPerformanceReport } = require('../services/reportService');

const generateSystemReport = async (req, res) => {
  try {
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    const report = await getSystemReport();
    res.json(report);
  } catch (error) {
    console.error('生成系統運營報表失敗:', error);
    res.status(500).json({ error: '生成系統運營報表失敗' });
  }
};

const generateUserBehaviorReport = async (req, res) => {
  try {
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    const report = await getUserBehaviorReport();
    res.json(report);
  } catch (error) {
    console.error('生成用戶行為報表失敗:', error);
    res.status(500).json({ error: '生成用戶行為報表失敗' });
  }
};

const generateRestaurantPerformanceReport = async (req, res) => {
  try {
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    const report = await getRestaurantPerformanceReport();
    res.json(report);
  } catch (error) {
    console.error('生成餐廳表現報表失敗:', error);
    res.status(500).json({ error: '生成餐廳表現報表失敗' });
  }
};

const exportReport = async (req, res) => {
  const { type } = req.params;
  try {
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    console.log("Entering controllers\\reportController.js");
    let data;
    switch (type) {
      case 'system':
        data = await getSystemReport();
        break;
      case 'userBehavior':
        data = await getUserBehaviorReport();
        break;
      case 'restaurantPerformance':
        data = await getRestaurantPerformanceReport();
        break;
      default:
        console.log("Exiting controllers\\reportController.js with status code");
        console.log("Exiting controllers\\reportController.js with status code");
        console.log("Exiting controllers\\reportController.js with status code");
        console.log("Exiting controllers\\reportController.js with status code");
        return res.status(400).json({ error: '無效的報表類型' });
    }

    // 創建 PDF
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Length': Buffer.byteLength(pdfData),
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment;filename=${type}_report.pdf`,
        })
        .end(pdfData);
    });

    // 添加內容到 PDF
    doc.fontSize(20).text(`${type} Report`, { align: 'center' });
    doc.moveDown();

    // 根據報表類型添加不同內容
    switch (type) {
      case 'system':
        doc.fontSize(14).text('總訂單量:', { continued: true }).text(data.orderCounts.join(', '));
        doc.text('總收入:', { continued: true }).text(data.revenues.join(', '));
        break;
      case 'userBehavior':
        doc.text('活躍用戶數:', data.activeUsers.join(', '));
        break;
      case 'restaurantPerformance':
        doc.text('餐廳表現:', data.performanceData.join(', '));
        break;
      default:
        break;
    }

    doc.end();
  } catch (error) {
    console.error('導出報表失敗:', error);
    res.status(500).json({ error: '導出報表失敗' });
  }
};

module.exports = {
  generateSystemReport,
  generateUserBehaviorReport,
  generateRestaurantPerformanceReport,
  exportReport,
};
