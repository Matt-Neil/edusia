const express = require('express');
const router = express.Router();
const { getHomework, getHomeworkStudent, getHomeworkClass, updateHomework, updateSubmission, 
    deleteHomework, deleteSubmission, addHomework, addSubmission, getSubmission } = require('../controllers/homework');

router.route('/student').get(getHomeworkStudent);

router.route('/:id').get(getHomework);

router.route("/").post(addHomework);

router.route('/:id/class').get(getHomeworkClass).put(updateHomework).delete(deleteHomework);

router.route('/submissions/:id').get(getSubmission).put(updateSubmission).delete(deleteSubmission).post(addSubmission);

module.exports = router;