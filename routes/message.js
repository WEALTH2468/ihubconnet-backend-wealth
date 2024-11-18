const express = require('express');
const router = express.Router();
const MessageController = require("../controllers/message")
const userCtrl = require('../controllers/user');

const auth = require("../middlewares/auth")

router.post('/send/:contactId', auth, MessageController.sendMessage);
router.patch('/isRead/:contactId', auth, MessageController.isRead);
router.get('/messages/:contactId', auth, MessageController.getMessages);
router.get("/", auth, MessageController.getChats );
router.get("/contacts", auth, userCtrl.getUsersForChatSideBar );

module.exports = router;