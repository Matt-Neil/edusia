const express = require('express');
const router = express.Router();
const { getSearch, getSearchTeachers, getSearchStudents } = require('../controllers/search');

router.route('/').get(getSearch);

router.route('/:id/teachers').get(getSearchTeachers);

router.route('/:id/students').get(getSearchStudents);

module.exports = router;