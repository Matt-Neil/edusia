require("dotenv").config();
const express = require("express");
const users = require('./routes/users');
const homework = require('./routes/homework');
const lessons = require('./routes/lessons');
const search = require('./routes/search');
const file = require('./routes/file');
const auth = require('./routes/auth');
const tests = require('./routes/tests');
const { checkUser } = require('./middleware/auth');
const port = process.env.PORT || 5000;
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');


app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

app.get('*', checkUser);
app.post('*', checkUser);
app.put('*', checkUser);
app.delete('*', checkUser);
app.use('/api/users', users);
app.use('/api/homework', homework);
app.use('/api/lessons', lessons);
app.use('/api/search', search);
app.use('/api/file', file);
app.use('/api/auth', auth);
app.use('/api/tests', tests);

app.listen(port, console.log(`Server running on port ${port}.`));