const express = require('express');
const router = express.Router();
const { getSearch } = require('../controllers/search');

router.route('/').get(getSearch);

module.exports = router;