const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const multer = require('../middlewares/multer-config');
const userCtrl = require('../controllers/user');

router.get('/users/:id', auth, userCtrl.getUsers);
router.get('/chatsidebarusers/:id', auth, userCtrl.getUsersForChatSideBar)
router.get('/refresh', auth, userCtrl.refresh);
router.post('/addUser', userCtrl.addUser);
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.delete('/delete/:id', userCtrl.delete);
router.patch('/update/:id', auth, multer, userCtrl.update);
router.post('/forgetpassword', userCtrl.forgetpassword);
router.patch('/reset-password/:token', multer, userCtrl.reset_password);

module.exports = router;
