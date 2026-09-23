const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', roomController.listRooms);
router.get('/my-rooms', requireAuth, roomController.myRooms);
router.get('/rooms/new', requireAuth, roomController.showSubmitForm);
router.post('/rooms/new', requireAuth, upload.array('images', 6), roomController.submitRoom);
router.get('/rooms/:id', roomController.showRoom);
router.post('/rooms/:id/delete', requireAuth, roomController.deleteOwnRoom);

module.exports = router;
