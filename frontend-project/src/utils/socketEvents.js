import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/utils/socketEvents.js

export const handleOrderStatusUpdate = (data) => {
  // 處理訂單狀態更新的邏輯
  console.log('Order Status Update:', data);
};

export const handleMessage = (message) => {
  // 處理接收到的消息的邏輯
  console.log('Received Message:', message);
};
