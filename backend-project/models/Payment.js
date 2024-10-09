 // models/Payment.js
 const mongoose = require('mongoose');

 const paymentSchema = new mongoose.Schema({
   orderId: {
     type: String,
     required: true,
     unique: true,
   },
   amount: {
     type: Number,
     required: true,
   },
   currency: {
     type: String,
     required: true,
   },
   status: {
     type: String,
     required: true,
     enum: ['pending', 'completed', 'failed'],
     default: 'pending',
   },
   createdAt: {
     type: Date,
     default: Date.now,
   },
 });

 const Payment = mongoose.model('Payment', paymentSchema);
 module.exports = Payment;