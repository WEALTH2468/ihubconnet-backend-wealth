const ReadReceipt = require('../models/readReceipt');

const ReadReceiptController = {
  // Add a read receipt for a message
  async addReadReceipt(req, res) {
    try {
      const { messageId, userId } = req.body;
      const newReadReceipt = new ReadReceipt({ messageId, userId });
      await newReadReceipt.save();
      res.status(201).json(newReadReceipt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get read receipts for a message
  async getMessageReadReceipts(req, res) {
    try {
      const messageId = req.params.messageId;
      const readReceipts = await ReadReceipt.find({ messageId });
      res.status(200).json(readReceipts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ReadReceiptController;
