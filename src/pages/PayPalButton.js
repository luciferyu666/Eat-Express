import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PayPalButton = ({ orderId, totalAmount }) => {
  return (
    <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID" }}>
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: totalAmount.toString() }
            }]
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(details => {
            console.log('Transaction completed by', details.payer.name.given_name);
            // 更新訂單狀態或跳轉至支付成功頁面
          });
        }}
        onError={(error) => {
          console.error('PayPal checkout error:', error);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;