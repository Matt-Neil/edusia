const express = require('express');
const router = express.Router();
const multerSetup = require('../middleware/multerSetup');
const { removeImage, uploadImage } = require('../controllers/image');

router.route('/remove').put(removeImage);

router.post('/upload', multerSetup, uploadImage);

module.exports = router