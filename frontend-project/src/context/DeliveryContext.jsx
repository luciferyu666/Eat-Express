import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/context/DeliveryContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '@utils/axiosInstance';
import { ROLES } from '@utils/constants';
// 移除自定义的 logger 模块导入
// import logger from "../utils/logger";

/**
 * 定义角色枚举
 * @readonly
 * @enum {string}
 */
export const Roles = Object.freeze({
  DELIVERY_PERSON: 'delivery-person',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  RESTAURANT_OWNER: 'restaurant-owner',
});

/**
 * 创建 Context
 */
export const DeliveryContext = createContext(undefined);

/**
 * 提供 Context 的组件
 *
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} Provider 组件
 */
export const DeliveryProvider = ({ children }) => {
  const [currentOrders, setCurrentOrders] = useState([]);
  const [route, setRoute] = useState(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  /**
   * 定义更新位置的函数
   * @param {Location} newLocation - 新的位置
   */
  const updateLocation = useCallback(async (newLocation) => {
    try {
      await axiosInstance.patch('/delivery-person/location', {
        currentLocation: newLocation,
      });
      // 可以选择在后端触发 Socket.IO 事件来通知其他用户
    } catch (error) {
      console.error('更新位置失败:', error);
      setError('无法更新位置');
    }
  }, []);

  /**
   * 初始化 Socket.IO 连接
   */
  useEffect(() => {
    const token = sessionStorage.getItem('authToken'); // 确保 token 已存在

    if (!token) {
      console.error('缺少 authToken，无法建立 Socket.IO 连接');
      setError('缺少授权令牌，请重新登录');
      return;
    }
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    if (!BACKEND_URL) {
      console.error('REACT_APP_BACKEND_URL 未配置');
      setError('服务器配置错误，请联系管理员');
      return;
    }
    const newSocket = io(BACKEND_URL, {
      auth: {
        token,
      },
      transports: ['websocket'], // 使用 WebSocket 传输
    });
    setSocket(newSocket);

    // 监听连接事件
    newSocket.on('connect', () => {
      console.info('成功建立 Socket.IO 连接');
    });
    newSocket.on('disconnect', (reason) => {
      console.warn(`Socket.IO 连接断开，原因: ${reason}`);
    });
    newSocket.on('connect_error', (error) => {
      console.error(`Socket.IO 连接错误: ${error.message}`);
    });

    // 清理函数
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  /**
   * 获取用户资料
   */
  useEffect(() => {
    let isMounted = true; // 防止组件卸载后更新状态

    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/delivery-person/profile');
        if (isMounted) {
          setUserProfile(response.data);
          setIsOnline(response.data.availability);
          setLocation(response.data.currentLocation || { lat: 0, lng: 0 });
        }
      } catch (err) {
        console.error('获取用户资料失败:', err);
        if (isMounted) {
          setError('无法获取用户资料');
        }
      }
    };
    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 获取并更新位置
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('浏览器不支持 Geolocation');
      setError('无法获取位置：浏览器不支持 Geolocation');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = {
          lat: latitude,
          lng: longitude,
        };
        setLocation(newLocation);
        updateLocation(newLocation);
      },
      (err) => {
        console.error('获取位置失败:', err);
        setError('无法获取位置');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [updateLocation]);

  /**
   * 获取当前订单
   */
  const fetchCurrentOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        '/delivery-person/current-orders'
      );
      setCurrentOrders(response.data.orders);
    } catch (error) {
      console.error('获取当前订单失败:', error);
      setError('无法获取当前订单');
    }
  }, []);

  /**
   * 在初始化时获取订单
   */
  useEffect(() => {
    fetchCurrentOrders();
  }, [fetchCurrentOrders]);

  /**
   * Socket.IO 事件处理
   */
  useEffect(() => {
    if (!socket || !userProfile) return;

    const handleOrderAssigned = (order) => {
      setCurrentOrders((prevOrders) => [...prevOrders, order]);
      setNotifications((prev) => [
        ...prev,
        {
          id: order._id,
          message: '有新订单被分配给您',
          type: 'order',
          timestamp: new Date(),
        },
      ]);
    };

    const handleOrderStatusUpdated = (updatedOrder) => {
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      setNotifications((prev) => [
        ...prev,
        {
          id: updatedOrder._id,
          message: '订单状态已更新',
          type: 'status',
          timestamp: new Date(),
        },
      ]);
    };

    const handleRouteUpdated = (newRoute) => {
      setRoute(newRoute);
      setNotifications((prev) => [
        ...prev,
        {
          id: 'route',
          message: '配送路径已更新',
          type: 'route',
          timestamp: new Date(),
        },
      ]);
    };

    const handleNewOrder = (order) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: order._id,
          message: '有新的订单',
          type: 'order',
          timestamp: new Date(),
        },
      ]);
    };

    const handleDeliveryPersonStatusUpdate = ({ userId, status }) => {
      if (userId === userProfile.userId) {
        setIsOnline(status);
        setNotifications((prev) => [
          ...prev,
          {
            id: 'status',
            message: `您的在线状态已更新为 ${status ? '在线' : '离线'}`,
            type: 'status',
            timestamp: new Date(),
          },
        ]);
      }
    };

    socket.on('orderAssigned', handleOrderAssigned);
    socket.on('orderStatusUpdated', handleOrderStatusUpdated);
    socket.on('routeUpdated', handleRouteUpdated);
    socket.on('newOrder', handleNewOrder);
    socket.on('deliveryPersonStatusUpdate', handleDeliveryPersonStatusUpdate);

    // 清除事件监听器
    return () => {
      socket.off('orderAssigned', handleOrderAssigned);
      socket.off('orderStatusUpdated', handleOrderStatusUpdated);
      socket.off('routeUpdated', handleRouteUpdated);
      socket.off('newOrder', handleNewOrder);
      socket.off(
        'deliveryPersonStatusUpdate',
        handleDeliveryPersonStatusUpdate
      );
    };
  }, [socket, userProfile]);

  /**
   * 更新在线状态
   */
  const toggleOnlineStatus = useCallback(async () => {
    const newStatus = !isOnline;
    try {
      const payload = { status: newStatus };

      // 如果用户是管理员，可能需要传递 personId
      if (userProfile?.role === ROLES.ADMIN && userProfile?.personId) {
        payload.personId = userProfile.personId; // 根据具体情况调整
      }
      const response = await axiosInstance.patch(
        '/delivery-person/status',
        payload
      );
      setIsOnline(response.data.status);
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              availability: response.data.status,
            }
          : null
      );
      setNotifications((prev) => [
        ...prev,
        {
          id: 'status',
          message: `您的在线状态已更新为 ${
            response.data.status ? '在线' : '离线'
          }`,
          type: 'status',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('更新在线状态失败:', error);
      setError('无法更新在线状态');
    }
  }, [isOnline, userProfile]);

  /**
   * 标记通知为已读
   * @param {string} id - 通知ID
   */
  const markNotificationAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  /**
   * 清除所有通知
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * 提供给子组件的 context 值
   */
  const contextValue = useMemo(
    () => ({
      currentOrders,
      route,
      location,
      notifications,
      isOnline,
      toggleOnlineStatus,
      userProfile,
      error,
      fetchCurrentOrders,
      updateLocation,
      setRoute,
      markNotificationAsRead,
      clearNotifications,
      socket,
    }),
    [
      currentOrders,
      route,
      location,
      notifications,
      isOnline,
      toggleOnlineStatus,
      userProfile,
      error,
      fetchCurrentOrders,
      updateLocation,
      setRoute,
      markNotificationAsRead,
      clearNotifications,
      socket,
    ]
  );

  return (
    <DeliveryContext.Provider value={contextValue}>
      {children}
    </DeliveryContext.Provider>
  );
};

/**
 * 使用 DeliveryContext 的自定义 Hook
 * @returns {DeliveryContextType} DeliveryContext 的值
 */
export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery 必须在 DeliveryProvider 内使用');
  }
  return context;
};
