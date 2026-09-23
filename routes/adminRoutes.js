const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth, requireAdmin);

router.get('/', adminController.dashboard);
router.get('/rooms', adminController.listRooms);
router.post('/rooms/:id/approve', adminController.approveRoom);
router.post('/rooms/:id/reject', adminController.rejectRoom);
router.get('/users', adminController.listUsers);
router.post('/users/:id/role', adminController.setUserRole);

module.exports = router;
