import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/DeliveryHome/Support.js

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@utils/axiosInstance'; // 引入 axiosInstance

// 引入 logger
import PropTypes from 'prop-types'; // 用於類型檢查（可選）
import { ToastContainer, toast } from 'react-toastify'; // 用於顯示通知

const Support = () => {
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 獲取常見問題的函數，使用 useCallback 優化
   */
  const fetchFAQ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/support/faq'); // 假設有一個 API 獲取常見問題
      setFaq(response.data.faq || []); // 根據後端的回應結構調整
    } catch (err) {
      console.error('獲取常見問題失敗:', err); // 使用 logger 記錄錯誤
      setError('無法獲取常見問題，請稍後再試。');
      toast.error('無法獲取常見問題，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchFAQ();
  }, [fetchFAQ]);

  /**
   * 處理聯繫客服的函數
   */
  const contactSupport = useCallback(() => {
    // 打開客服聯繫方式，例如發送郵件或撥打電話
    window.location.href = 'mailto:support@fooddelivery.com';
  }, []);
  return (
    <div className="support bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-8">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">支持與幫助</h2>

      {/* 聯繫客服按鈕 */}
      <button
        onClick={contactSupport}
        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
      >
        聯繫客服
      </button>

      {/* 常見問題解答 */}
      <h3 className="text-xl font-medium mb-4 text-gray-700">常見問題解答</h3>

      {/* 顯示錯誤訊息 */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* 顯示加載指示器 */}
      {loading ? (
        <p className="text-gray-500">正在加載常見問題...</p>
      ) : (
        <ul className="space-y-4">
          {faq.length > 0 ? (
            faq.map((item) => (
              <li key={item.id} className="border-b pb-2">
                <h4 className="font-semibold text-gray-800">{item.question}</h4>
                <p className="text-gray-600 mt-1">{item.answer}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-500">目前沒有常見問題。</p>
          )}
        </ul>
      )}
    </div>
  );
};

// 可選：添加 PropTypes 以增強類型檢查
Support.propTypes = {
  // 如果有其他 props，請在此定義
};
export default Support;
