const express = require('express');
const router = express.Router();
const { getHomework, getHomeworkStudent, getHomeworkClass, updateHomework, updateSubmission, putCompleted,
    deleteHomework, addHomework, getSubmissions } = require('../controllers/homework');

router.route('/student').get(getHomeworkStudent);

router.route('/:id').get(getHomework);

router.route('/:id/submissions').get(getSubmissions).put(updateSubmission);;

router.route("/").post(addHomework);

router.route('/:id/completed').put(putCompleted);

router.route('/:id/class').get(getHomeworkClass).put(updateHomework).delete(deleteHomework);

module.exports = router;