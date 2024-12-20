# Eat-Express
目前正在開發一個類似 **Uber Eats** 食品外送應用程式的系統，提供用戶線上點餐、餐廳接單製作、外送員即時配送的全流程體驗。該應用程式將支援用戶、餐廳、外送員以及管理員四種角色，確保點餐、支付、配送、管理等核心功能的高效執行。

https://quick-eats-two.vercel.app/

## **2. 系統架構概述**

### **2.1 前端**
- **技術選擇**:  
  - **框架**: React.js  
  - **CSS工具**: Tailwind CSS
  - **狀態管理**: Redux  
  - **API 通信**: Axios  
  - **實時數據處理**: WebSocket

### **2.2 後端**
- **技術選擇**:  
  - **伺服器框架**: Node.js（Express）  
  - **資料庫**: MongoDB（NoSQL）  
  - **實時通信**: Socket.IO（WebSocket 支持）  
  - **支付集成**: LinePay
  - **地圖與導航**: Google Maps API  
  - **推送通知**: 
WebSocket 支持實時訂單狀態更新 

## **2.3 架構模式**
- **MVC架構**: 使用 MVC 模式進行設計，確保系統的分層結構清晰。
- **微服務架構（可選）**: 考慮將訂單處理、用戶管理、支付等拆分為微服務進行獨立部署。
