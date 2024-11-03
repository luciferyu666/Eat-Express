import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/hooks/useSocket.js

import { useEffect, useContext, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@utils/socket';
import { UserContext } from '@context/UserContext';
// import logger from "../utils/logger";

/**
 * 自定义 Hook，用于管理与 Socket.IO 服务器的连接。
 * 依赖于用户的认证状态（user 和 user.token）来建立或断开连接。
 * @returns {SocketIOClient.Socket | null} 返回 Socket 实例或 null
 */
const useSocket = () => {
  const { user } = useContext(UserContext);
  const socketRef = useRef(null);

  useEffect(() => {
    let socket;

    if (user && user.token) {
      // 检查是否已存在连接，避免重复连接
      if (!socketRef.current) {
        // 建立 Socket 连接
        connectSocket(user.token);
        socketRef.current = getSocket();
        socket = socketRef.current;

        if (socket) {
          // 监听 'connect' 事件
          const handleConnect = () => {
            logger.info('成功建立 Socket.IO 连接');
          };

          // 监听 'disconnect' 事件
          const handleDisconnect = (reason) => {
            logger.warn(`Socket.IO 连接断开，原因: ${reason}`);
          };

          // 监听 'connect_error' 事件
          const handleConnectError = (error) => {
            logger.error(`Socket.IO 连接错误: ${error.message}`);
          };

          // 监听自定义事件（根据需求添加）
          const handleMessage = (data) => {
            logger.info('接收到消息:', data);
            // 处理消息逻辑
          };

          const handleOrderStatusUpdate = (data) => {
            logger.info('订单状态更新:', data);
            // 处理订单状态更新逻辑
          };

          // 注册事件监听器
          socket.on('connect', handleConnect);
          socket.on('disconnect', handleDisconnect);
          socket.on('connect_error', handleConnectError);
          socket.on('message', handleMessage);
          socket.on('orderStatusUpdate', handleOrderStatusUpdate);

          // 清理函数
          const cleanup = () => {
            if (socket) {
              socket.off('connect', handleConnect);
              socket.off('disconnect', handleDisconnect);
              socket.off('connect_error', handleConnectError);
              socket.off('message', handleMessage);
              socket.off('orderStatusUpdate', handleOrderStatusUpdate);
            }
            disconnectSocket();
            socketRef.current = null;
          };

          // 返回清理函数，在组件卸载或依赖项变化时调用
          return cleanup;
        }
      }
    } else {
      // 如果用户未认证，确保 Socket 断开连接
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
    }

    // 清理函数，确保断开连接
    return () => {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
    };
  }, [user]);

  // 返回 Socket 实例，供组件内部使用
  return socketRef.current;
};

export default useSocket;
