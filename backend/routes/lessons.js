const express = require('express');
const router = express.Router();
const { getLesson, getLessonsTeacher, getLessonsSchool, updateLesson, deleteLesson, addLesson } = require('../controllers/lessons');

router.route('/:id/teacher').get(getLessonsTeacher);

router.route('/:id/school').get(getLessonsSchool);

router.route('/:id').get(getLesson).put(updateLesson).delete(deleteLesson).post(addLesson);

module.exports = router;