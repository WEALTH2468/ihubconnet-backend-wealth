const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();
const multer = require('../middlewares/multer-config');
const postCtrl = require('../controllers/post');


router.get('/',auth, postCtrl.getPosts);
router.post('/',auth, multer, postCtrl.addPost);
router.delete('/:id', auth, postCtrl.deletePost);
router.patch('/:id', auth, multer, postCtrl.updatePost);
router.patch('/:ids/like',auth, postCtrl.likePost)
router.patch('/:ids/dislike', auth, postCtrl.dislikePost)

module.exports = router;