const express = require('express');
const router = express.Router();
const { getStudentsSchool, getTeachersSchool, getUserEdit, postUser, putUser, deleteUser, getSettings, putSettings, getDetentions, getNotifications,
    getStudentsLesson, getStudentLesson, getUser, getStudentNotes, getStudentDetentions, postStudentNotes, putStudentNotes, deleteStudentNotes,
    postStudentDetentions, putStudentDetentions, deleteStudentDetentions, deleteSchool } = require('../controllers/users');

router.route('/settings').get(getSettings).put(putSettings);

router.route('/detentions').get(getDetentions);

router.route('/notifications').get(getNotifications);

router.route('/student/:id/lesson').get(getStudentLesson);

router.route('/student/:id/lesson/detentions').get(getStudentDetentions).post(postStudentDetentions).put(putStudentDetentions).delete(deleteStudentDetentions);

router.route('/student/:id/lesson/notes').get(getStudentNotes).post(postStudentNotes).put(putStudentNotes).delete(deleteStudentNotes);

router.route('/students/:id/lesson').get(getStudentsLesson);

router.route('/students/:id/school').get(getStudentsSchool);

router.route('/teachers/:id/school').get(getTeachersSchool);

router.route('/:id/edit').get(getUserEdit).put(putUser).delete(deleteUser);

router.route('/:id').get(getUser).post(postUser).delete(deleteSchool);

module.exports = router