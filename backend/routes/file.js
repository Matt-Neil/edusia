const express = require('express');
const router = express.Router();
const multerSetup = require('../middleware/multerSetup');
const { removeFile, uploadFile } = require('../controllers/file');

router.route('/remove').put(removeFile);

router.post('/upload', multerSetup, uploadFile);

module.exports = router