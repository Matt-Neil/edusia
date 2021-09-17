const express = require('express');
const router = express.Router();
const { getStudentsSchool, getTeachersSchool, getStudent } = require('../controllers/users');

router.route('/student/:id').get(getStudent);

router.route('/students/:id/school').get(getStudentsSchool);

router.route('/teachers/:id/school').get(getTeachersSchool);

module.exports = router