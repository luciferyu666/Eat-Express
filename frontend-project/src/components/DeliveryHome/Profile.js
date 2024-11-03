import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/DeliveryHome/Profile.js

import React, { useState, useEffect, useCallback } from 'react';
import { useDelivery } from '@context/DeliveryContext';
import { getProfile, updateProfile } from '@services/deliveryService'; // 確保這個服務使用 axiosInstance

// 引入 logger
import PropTypes from 'prop-types'; // 用於類型檢查（可選）
import * as Yup from 'yup'; // 用於表單驗證
import { useFormik } from 'formik'; // 用於管理表單狀態

const Profile = () => {
  const { userProfile, setUserProfile } = useDelivery(); // 確保 userProfile 在上下文中提供
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * 獲取用戶個人資料的函數，使用 useCallback 優化
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getProfile(); // 確保 getProfile 使用 axiosInstance
      setUserProfile(profile);
      formik.setValues({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        vehicleType: profile.vehicleType || '',
        workArea: profile.workArea || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err); // 使用 logger 記錄錯誤
      setError('無法獲取個人資料，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }, [setUserProfile]);
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * 使用 Formik 和 Yup 進行表單管理和驗證
   */
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      vehicleType: '',
      workArea: '',
    },
    enableReinitialize: true,
    // 當 initialValues 改變時重新初始化表單
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, '姓名至少需要 3 個字符')
        .max(50, '姓名最多 50 個字符')
        .required('姓名是必填項'),
      email: Yup.string()
        .email('無效的電子郵件地址')
        .required('電子郵件是必填項'),
      phone: Yup.string()
        .matches(/^[0-9\-+() ]+$/, '無效的電話號碼')
        .required('電話是必填項'),
      vehicleType: Yup.string()
        .oneOf(['bike', 'car', 'scooter'], '選擇有效的交通工具')
        .required('交通工具是必填項'),
      workArea: Yup.string().max(100, '工作區域最多 100 個字符'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const updatedProfile = await updateProfile(values); // 確保 updateProfile 使用 axiosInstance
        setUserProfile(updatedProfile);
        setSuccessMessage('個人資料更新成功！');
      } catch (err) {
        console.error('Error updating profile:', err); // 使用 logger 記錄錯誤
        setError('無法更新個人資料，請稍後再試。');
      } finally {
        setLoading(false);
      }
    },
  });
  return (
    <div className="profile bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">個人資料</h2>

      {/* 顯示成功訊息 */}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}

      {/* 顯示錯誤訊息 */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* 顯示加載指示器 */}
      {loading && <p className="text-gray-500 mb-4">正在處理請求...</p>}

      {/* 表單 */}
      <form onSubmit={formik.handleSubmit}>
        {/* 姓名 */}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 font-medium mb-2"
          >
            姓名：
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`w-full p-2 border ${
              formik.touched.name && formik.errors.name
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded`}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
          )}
        </div>

        {/* 電子郵件 */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-2"
          >
            電子郵件：
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            value={formik.values.email}
            disabled // 電子郵件不可編輯
          />
        </div>

        {/* 電話 */}
        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-gray-700 font-medium mb-2"
          >
            電話：
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            className={`w-full p-2 border ${
              formik.touched.phone && formik.errors.phone
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded`}
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.phone && formik.errors.phone && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
          )}
        </div>

        {/* 交通工具 */}
        <div className="mb-4">
          <label
            htmlFor="vehicleType"
            className="block text-gray-700 font-medium mb-2"
          >
            交通工具：
          </label>
          <select
            id="vehicleType"
            name="vehicleType"
            className={`w-full p-2 border ${
              formik.touched.vehicleType && formik.errors.vehicleType
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded`}
            value={formik.values.vehicleType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">選擇交通工具</option>
            <option value="bike">自行車</option>
            <option value="car">汽車</option>
            <option value="scooter">滑板車</option>
          </select>
          {formik.touched.vehicleType && formik.errors.vehicleType && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.vehicleType}
            </p>
          )}
        </div>

        {/* 工作區域偏好 */}
        <div className="mb-4">
          <label
            htmlFor="workArea"
            className="block text-gray-700 font-medium mb-2"
          >
            工作區域偏好：
          </label>
          <input
            type="text"
            id="workArea"
            name="workArea"
            className={`w-full p-2 border ${
              formik.touched.workArea && formik.errors.workArea
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded`}
            value={formik.values.workArea}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.workArea && formik.errors.workArea && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.workArea}
            </p>
          )}
        </div>

        {/* 更新按鈕 */}
        <button
          type="submit"
          className={`w-full bg-blue-500 text-white p-2 rounded ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          {loading ? '更新中...' : '更新資料'}
        </button>
      </form>
    </div>
  );
};

// 可選：添加 PropTypes 以增強類型檢查
Profile.propTypes = {
  // 如果有其他 props，請在此定義
};
export default Profile;
