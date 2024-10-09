import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';  // Stripe 支付
import PayPalButton from './PayPalButton';  // 引入 PayPal 支付按鈕

const stripePromise = loadStripe('YOUR_STRIPE_PUBLIC_KEY');

const PaymentPage = ({ orderId, totalAmount }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');  // 支付方式
  const [isProcessing, setIsProcessing] = useState(false);  // 支付處理狀態

  // Stripe 支付處理邏輯
  const handleStripePayment = async () => {
    setIsProcessing(true);
    try {
      const stripe = await stripePromise;
      const response = await axios.post('/api/payment/stripe', { orderId, totalAmount });
      const session = response.data;

      // 跳轉到 Stripe 結帳頁面
      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        console.error('Stripe checkout error:', result.error.message);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error in Stripe payment:', error);
      setIsProcessing(false);
    }
  };

  // 支付方式選擇處理
  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
  };

  return (
    <div className="payment-page">
      <h1>選擇支付方式</h1>

      {/* 支付方式選擇 */}
      <div className="payment-options">
        <button
          onClick={() => handlePaymentSelection('stripe')}
          className={selectedPaymentMethod === 'stripe' ? 'selected' : ''}
        >
          信用卡支付（Stripe）
        </button>
        <button
          onClick={() => handlePaymentSelection('paypal')}
          className={selectedPaymentMethod === 'paypal' ? 'selected' : ''}
        >
          PayPal 支付
        </button>
      </div>

      {/* 支付處理 */}
      {selectedPaymentMethod && (
        <div className="payment-process">
          {selectedPaymentMethod === 'stripe' && (
            <button
              onClick={handleStripePayment}
              disabled={isProcessing}
              className="stripe-payment-btn"
            >
              {isProcessing ? '正在處理支付...' : '使用 Stripe 支付'}
            </button>
          )}
          {selectedPaymentMethod === 'paypal' && (
            <PayPalButton orderId={orderId} totalAmount={totalAmount} />
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
