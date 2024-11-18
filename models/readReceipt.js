const mongoose = require('mongoose');

const readReceiptSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  readAt: { type: Date, default: Date.now }
});

const ReadReceipt = mongoose.model('ReadReceipt', readReceiptSchema);
module.exports = ReadReceipt;
