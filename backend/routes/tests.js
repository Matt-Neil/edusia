const express = require('express');
const router = express.Router();
const { getTests, getTest, updateTest, deleteTest, postTest, updateTestGrades } = require('../controllers/tests');

router.route('/:id/class').get(getTests);

router.route('/:id/grade').put(updateTestGrades);

router.route('/:id').get(getTest).put(updateTest).delete(deleteTest).post(postTest);

module.exports = router;