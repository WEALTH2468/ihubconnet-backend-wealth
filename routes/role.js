const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const roleCtrl = require('../controllers/role');

router.get('/', roleCtrl.getRoles);
router.post('/', auth, roleCtrl.addRole);
router.delete('/:id', auth, roleCtrl.deleteRole);
router.patch('/:id', auth, roleCtrl.updateRole);
module.exports = router;
