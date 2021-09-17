const express = require('express');
const router = express.Router();
const { postLogin, getLogout, getUser, postUser, postSchool } = require('../controllers/auth');

router.route('/').get(getUser);

router.route('/new-user').post(postUser);

router.route('/new-school').post(postSchool);

router.route('/login').post(postLogin);

router.route('/logout').get(getLogout);

module.exports = router