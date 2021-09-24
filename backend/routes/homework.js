const express = require('express');
const router = express.Router();
const { getHomework, getHomeworkStudent, getHomeworkClass, updateHomework, updateSubmission, putCompleted,
    deleteHomework, postHomework, getSubmissions } = require('../controllers/homework');

router.route('/student').get(getHomeworkStudent);

router.route('/:id/submissions').get(getSubmissions).put(updateSubmission);;

router.route("/").post(postHomework);

router.route('/:id/completed').put(putCompleted);

router.route('/:id/class').get(getHomeworkClass);

router.route('/:id').get(getHomework).put(updateHomework).delete(deleteHomework);

module.exports = router;