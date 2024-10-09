// src/components/PaymentPage.js
import React, { useState } from 'react';
import axios from 'axios';

const PaymentPage = ({ totalAmount }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handlePayment = async () => {
    try {
      const response = await axios.post('/api/payments', { method: paymentMethod, amount: totalAmount });
      // 假設返回的是支付鏈接
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className="payment-page">
      <h1>支付</h1>
      <p>總金額: {totalAmount} 元</p>
      <div>
        <label>
          <input
            type="radio"
            value="stripe"
            checked={paymentMethod === 'stripe'}
            onChange={() => setPaymentMethod('stripe')}
          />
          Stripe
        </label>
        <label>
          <input
            type="radio"
            value="paypal"
            checked={paymentMethod === 'paypal'}
            onChange={() => setPaymentMethod('paypal')}
          />
          PayPal
        </label>
      </div>
      <button onClick={handlePayment}>立即支付</button>
    </div>
  );
};

export default PaymentPage;