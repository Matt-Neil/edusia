const db = require('../db');
const bcrypt = require('bcrypt');
// const handleErrors = (err) => {
//     let errors = { email: "", password: "", name: "" };

//     if (err.code === 11000) {
//         errors.email = 'That email has already been registered';
//         return errors;
//     }

//     if (err.message.includes('User validation failed')) {
//         Object.values(err.errors).forEach(({properties}) => {
//             errors[properties.path] = properties.message;
//         })
//     }

//     return errors;
// }

exports.getSettings = async (req, res, next) => {
    try {
        let user;

        if (res.locals.currentUser.position !== "school") {
            user = await db.query("SELECT picture, password FROM users WHERE id = $1", [res.locals.currentUser.id]);
        } else {
            user = await db.query("SELECT picture, password FROM schools WHERE id = $1", [res.locals.currentUser.id]);
        }

        res.status(201).json({
            success: true,
            data: user.rows[0]
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putSettings = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);

        if (res.locals.currentUser.position !== "school") {
            await db.query("UPDATE users SET picture = $1, password = $2 WHERE id = $3", [req.body.picture, hashedPassword, res.locals.currentUser.id]);
        } else {
            await db.query("UPDATE schools SET picture = $1, password = $2 WHERE id = $3", [req.body.picture, hashedPassword, res.locals.currentUser.id]);
        }

        res.status(201).json({
            success: true
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getDetentions = async (req, res, next) => {
    try {
        const detentions = await db.query("SELECT classes.subject, classes.class_code, detentions.duration, detentions.location, detentions.date FROM detentions INNER JOIN classes ON detentions.class_id = classes.id AND detentions.student_id = $1", [res.locals.currentUser.id]);

        res.status(201).json({
            success: true,
            data: detentions.rows
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await db.query("SELECT classes.subject, classes.class_code, notifications.notification, notifications.expire FROM notifications INNER JOIN classes ON notifications.class_id = classes.id INNER JOIN students_classes ON students_classes.student_id = $1 AND students_classes.class_id = classes.id", [res.locals.currentUser.id]);

        res.status(201).json({
            success: true,
            data: notifications.rows
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getStudentLesson = async (req, res, next) => {
    try {
        let student;

        if (res.locals.currentUser.position === "teacher") {
            student = await db.query("SELECT users.name, users.picture, users.username, users.email, users.id FROM users INNER JOIN students_classes ON students_classes.student_id = $1 AND students_classes.class_id = $2 AND students_classes.student_id = users.id INNER JOIN classes ON classes.id = $2 AND classes.school_id = $3",
                [req.params.id, req.query.class, res.locals.currentUser.school_id]);
        } else {
            student = await db.query("SELECT users.name, users.picture, users.username, users.email, users.id FROM users INNER JOIN students_classes ON students_classes.student_id = $1 AND students_classes.class_id = $2 AND students_classes.student_id = users.id INNER JOIN classes ON classes.id = $2 AND classes.school_id = $3",
                [req.params.id, req.query.class, res.locals.currentUser.id]);
        }
        
        res.status(201).json({
            success: true,
            data: student.rows[0]
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getStudentDetentions = async (req, res, next) => {
    try {
        let detentions;

        if (res.locals.currentUser.position === "teacher") {
            detentions = await db.query("SELECT detentions.location, detentions.date, detentions.reason, detentions.id FROM detentions LEFT JOIN classes ON detentions.class_id = classes.id AND detentions.student_id = $1 AND detentions.class_id = $2 AND classes.school_id = $3 AND detentions.date < $4 ORDER BY detentions.date DESC LIMIT 10",
                [req.params.id, req.query.class, res.locals.currentUser.school_id, req.query.date]);
        } else {
            detentions = await db.query("SELECT detentions.location, detentions.date, detentions.reason, detentions.id FROM detentions LEFT JOIN classes ON detentions.class_id = classes.id AND detentions.student_id = $1 AND detentions.class_id = $2 AND classes.school_id = $3 AND detentions.date < $4 ORDER BY detentions.date DESC LIMIT 10",
                [req.params.id, req.query.class, res.locals.currentUser.school_id, req.query.date]);
        }

        console.log(detentions.rows)
        
        res.status(201).json({
            success: true,
            data: detentions.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postStudentDetentions = async (req, res, next) => {
    try {
        await db.query("INSERT INTO detentions (class_id, student_id, location, date, reason) VALUES ($1, $2, $3, $4, $5, $6) returning *",
                [req.body.class_id, req.body.student_id, req.body.duration, req.body.location, req.body.date, req.body.reason]);
        
        res.status(201).json({
            success: true
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putStudentDetentions = async (req, res, next) => {
    try {
        await db.query("UPDATE detentions SET location = $1, reason = $2, date = $3 WHERE id = $4 returning *", 
            [req.body.location, req.body.reason, req.body.date, req.body.id]);
        
        res.status(201).json({
            success: true
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.deleteStudentDetentions = async (req, res, next) => {
    try {
        let detentions;

        if (res.locals.currentUser.position === "teacher") {
            detentions = await db.query("SELECT detentions.duration, detentions.location, detentions.date, detentions.reason, detentions.id FROM detentions INNER JOIN classes ON detentions.class_id = classes.id AND detentions.student_id = $1 AND detentions.class_id = $2 AND classes.school_id = $3 AND detentions.date < $4 ORDER BY detentions.date DESC LIMIT 10",
                [req.params.id, req.query.class, res.locals.currentUser.school_id, req.query.date]);
        } else {
            detentions = await db.query("SELECT detentions.duration, detentions.location, detentions.date, detentions.reason, detentions.id FROM detentions INNER JOIN classes ON detentions.class_id = classes.id AND detentions.student_id = $1 AND detentions.class_id = $2 AND classes.school_id = $3 AND detentions.date < $4 ORDER BY detentions.date DESC LIMIT 10",
                [req.params.id, req.query.class, res.locals.currentUser.school_id, req.query.date]);
        }
        
        res.status(201).json({
            success: true,
            data: detentions.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getStudentNotes = async (req, res, next) => {
    try {
        let notes;

        if (res.locals.currentUser.position === "teacher") {
            notes = await db.query("SELECT notes.note, notes.created, notes.id FROM notes LEFT JOIN classes ON notes.class_id = classes.id AND notes.student_id = $1 AND notes.class_id = $2 AND classes.school_id = $3 AND notes.created < $4 ORDER BY notes.created DESC LIMIT 10",
                [req.params.id, req.query.class, res.locals.currentUser.school_id, req.query.date]);
        } else {
            notes = await db.query("SELECT notes.note, notes.created, notes.id FROM notes LEFT JOIN classes ON notes.class_id = classes.id AND notes.student_id = $1 AND notes.class_id = $2 AND classes.school_id = $3 AND notes.created < $4 ORDER BY notes.created DESC LIMIT 10",
                [req.params.id, req.query.class, res.locals.currentUser.id, req.query.date]);
        }
        
        res.status(201).json({
            success: true,
            data: notes.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postStudentNotes = async (req, res, next) => {
    try {
        await db.query("INSERT INTO notes (class_id, student_id, note, created) VALUES ($1, $2, $3, $4) returning *",
                [req.body.class_id, req.body.student_id, req.body.note, req.body.created]);
        
        res.status(201).json({
            success: true
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putStudentNotes = async (req, res, next) => {
    try {
        await db.query("UPDATE notes SET note = $1 WHERE id = $2 returning *", 
            [req.body.note, req.body.id]);
        
        res.status(201).json({
            success: true
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.deleteStudentNotes = async (req, res, next) => {
    try {
        console.log(req.body.note_id)
        await db.query("DELETE FROM notes WHERE id = $1",
            [req.body.id]);
        
        res.status(201).json({
            success: true
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getStudentsLesson = async (req, res, next) => {
    try {
        let students;

        if (res.locals.currentUser.position === "teacher") {
            students = await db.query("SELECT users.name, users.picture, users.username, users.id FROM users INNER JOIN students_classes ON students_classes.class_id = $1 AND students_classes.student_id = users.id INNER JOIN classes ON classes.id = $1 AND (classes.teacher_id = $2 OR classes.school_id = $2)",
                [req.params.id, res.locals.currentUser.id]);
        } else {
            students = await db.query("SELECT users.name, users.picture, users.username, users.id FROM users INNER JOIN students_classes ON students_classes.class_id = $1 AND students_classes.student_id = users.id INNER JOIN classes ON classes.id = $1 AND (classes.teacher_id = $2 OR classes.school_id = $2)",
                [req.params.id, res.locals.currentUser.id]);
        }
        
        res.status(201).json({
            success: true,
            data: students.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getStudentsSchool = async (req, res, next) => {
    try {
        let students;

        if (req.query.id === undefined) {
            students = await db.query("SELECT name, picture, username, id FROM users WHERE school_id = $1 AND position = 'student' ORDER BY id ASC LIMIT 10", [req.params.id]);
        } else {
            students = await db.query("SELECT name, picture, username, id FROM users WHERE school_id = $1 AND position = 'student' AND id > $2 ORDER BY id ASC LIMIT 10", [req.params.id, req.query.id]);
        }

        res.status(201).json({
            success: true,
            data: students.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getTeachersSchool = async (req, res, next) => {
    try {
        let teachers;

        if (req.query.id === undefined) {
            teachers = await db.query("SELECT name, picture, username, id FROM users WHERE school_id = $1 AND position = 'teacher' ORDER BY id ASC LIMIT 10", [req.params.id]);
        } else {
            teachers = await db.query("SELECT name, picture, username, id FROM users WHERE school_id = $1 AND position = 'teacher' AND id > $2 ORDER BY id ASC LIMIT 10", [req.params.id, req.query.id]);
        }

        res.status(201).json({
            success: true,
            data: teachers.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const user = await db.query("SELECT find.name, find.picture, find.username, find.email, find.id, find.position FROM users AS find INNER JOIN users AS joined ON find.id = $1 AND ((joined.id = $2 AND joined.school_id = find.school_id) OR find.school_id = $2)", 
            [req.params.id, res.locals.currentUser.id]);

        if (res.locals.currentUser.position !== "student") {
            let lessons;

            if (user.rows[0].position === "teacher") {
                if (res.locals.currentUser.position === "teacher") {
                    lessons = await db.query("SELECT classes.subject, classes.class_code, classes.id FROM classes INNER JOIN users ON classes.teacher_id = $1 AND users.id = $2 AND users.school_id = classes.school_id", 
                        [user.rows[0].id, res.locals.currentUser.id]);
                } else {
                    lessons = await db.query("SELECT classes.subject, classes.class_code, classes.id FROM classes WHERE classes.teacher_id = $1 AND classes.school_id = $2", 
                        [user.rows[0].id, res.locals.currentUser.id]);
                }
            } else {
                if (res.locals.currentUser.position === "teacher") {
                    lessons = await db.query("SELECT classes.subject, classes.class_code, classes.id FROM classes INNER JOIN students_classes ON students_classes.student_id = $1 AND students_classes.class_id = classes.id INNER JOIN users ON users.id = $2 AND users.school_id = classes.school_id",
                        [user.rows[0].id, res.locals.currentUser.id])
                } else {
                    lessons = await db.query("SELECT classes.subject, classes.class_code, classes.id FROM classes INNER JOIN students_classes ON students_classes.student_id = $1 AND students_classes.class_id = classes.id AND classes.school_id = $2",
                        [user.rows[0].id, res.locals.currentUser.id])
                }
            }

            res.status(201).json({
                success: true,
                data: {
                    user: user.rows[0],
                    classes: lessons.rows
                }
            })
        } else {
            res.status(201).json({
                success: true,
                data: {
                    user: user.rows[0]
                }
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getUserEdit = async (req, res, next) => {
    try {
        let user;

        if (res.locals.currentUser.id === "teacher") {
            user = await db.query("SELECT find.name, find.picture, find.username, find.email FROM users AS find INNER JOIN users AS joined ON find.id = $1 AND ((joined.id = $2 AND joined.school_id = find.school_id) OR find.school_id = $2)", 
                [req.params.id, res.locals.currentUser.id]);
        } else {
            user = await db.query("SELECT name, picture, username, email, password, position FROM users WHERE id = $1 AND school_id = $2", [req.params.id, res.locals.currentUser.id]);
        }
        
        res.status(201).json({
            success: true,
            data: user.rows[0]
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postUser = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);

        const users = await db.query("INSERT INTO users (name, email, username, password, picture, position, school_id) VALUES ($1, $2, $3, $4, $5, $6, $7) returning *", 
            [req.body.name, req.body.email, req.body.username, hashedPassword, req.body.picture, req.body.position, req.params.id]);

        await db.query("UPDATE users SET tokens = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(username, '')) WHERE id = $1", [users.rows[0].id]);

        res.status(201).json({
            success: true
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putUser = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);

        const users = await db.query("UPDATE users SET name = $1, email = $2, username = $3, password = $4, picture = $5, position = $6 WHERE id = $7 returning *", 
            [req.body.name, req.body.email, req.body.username, hashedPassword, req.body.picture, req.body.position, req.params.id]);

        await db.query("UPDATE users SET tokens = to_tsvector('english', coalesce(name, '') || ' ' || coalesce(username, '')) WHERE id = $1", [users.rows[0].id]);

        res.status(201).json({
            success: true
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        await db.query("DELETE FORM users WHERE id = $1", [req.params.id]);

        res.status(201).json({
            success: true
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}