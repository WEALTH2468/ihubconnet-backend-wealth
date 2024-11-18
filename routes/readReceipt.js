const express = require('express');
const router = express.Router();
const ReadReceiptController = require('../controllers/readReceipt');

router.post('/readReceipts', ReadReceiptController.addReadReceipt);
router.get('/readReceipts/:messageId', ReadReceiptController.getMessageReadReceipts);

module.exports = router;
