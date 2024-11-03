const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe('YOUR_STRIPE_SECRET_KEY');  // 替換為您的 Stripe Secret Key

// Stripe 支付意圖處理
router.post('/create-payment-intent', async (req, res) => {
  console.log('处理 POST /create-payment-intent 请求');
  const { amount } = req.body;

  try {
    console.log("Entering routes\\payment.js");
    console.log("Entering routes\\payment.js");
    console.log("Entering routes\\payment.js");
    console.log("Entering routes\\payment.js");
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: error.message });
  }
});

// Stripe 結帳會話處理
router.post('/stripe', async (req, res) => {
  console.log('处理 POST /stripe 请求');
  const { orderId, totalAmount } = req.body;

  try {
    console.log("Entering routes\\payment.js");
    console.log("Entering routes\\payment.js");
    console.log("Entering routes\\payment.js");
    console.log("Entering routes\\payment.js");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `訂單 ${orderId}` },
          unit_amount: totalAmount * 100,  // Stripe 使用以分為單位的金額
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-success?orderId=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/order-cancelled?orderId=${orderId}`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    res.status(500).send('Payment failed');
  }
});

module.exports = router;
