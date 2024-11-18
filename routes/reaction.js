const express = require('express');
const router = express.Router();
const ReactionController = require('../controllers/reaction');

router.post('/', ReactionController.addReaction);
router.get('/:messageId', ReactionController.getMessageReactions);

module.exports = router;
