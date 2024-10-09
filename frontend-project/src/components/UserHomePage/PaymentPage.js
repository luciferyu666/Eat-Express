// src/components/UserHomePage/PaymentPage.js

import React, { useState } from 'react';
import axios from '../../utils/api';

const PaymentPage = () => {
  const [selectedPayment, setSelectedPayment] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const handlePayment = () => {
    if (!selectedPayment) {
      alert('請選擇支付方式');
      return;
    }

    // 假設有一個後端 API 來處理支付請求
    axios
      .post('/payment/initiate', {
        paymentMethod: selectedPayment,
      })
      .then((response) => {
        const { paymentUrl } = response.data;
        window.location.href = paymentUrl; // 跳轉到支付網關
      })
      .catch((error) => {
        console.error('支付失敗:', error);
        setPaymentStatus('支付失敗，請重試。');
      });
  };

  return (
    <div className="mt-4 bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-2">支付頁面</h2>
      <div className="flex flex-col">
        <label className="mb-2">
          <input
            type="radio"
            name="payment"
            value="line_pay"
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="mr-2"
          />
          Line Pay
        </label>
        <label className="mb-2">
          <input
            type="radio"
            name="payment"
            value="paypal"
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="mr-2"
          />
          PayPal
        </label>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          onClick={handlePayment}
        >
          立即支付
        </button>
        {paymentStatus && <p className="text-red-500 mt-2">{paymentStatus}</p>}
      </div>
    </div>
  );
};

export default PaymentPage;