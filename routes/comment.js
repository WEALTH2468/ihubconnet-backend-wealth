const express = require("express");
const auth = require("../middlewares/auth")
const router = express.Router();

const commentCtrl = require('../controllers/comment');

router.post('/', commentCtrl.addComment);
router.delete('/:id', auth, commentCtrl.deleteComment);
router.get('/:id', auth, commentCtrl.getComments);
router.get('/', auth, commentCtrl.getAllComments);
router.patch('/:id', auth, commentCtrl.editComment);

module.exports = router;