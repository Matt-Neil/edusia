const db = require('../db');
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

exports.getStudentsSchool = async (req, res, next) => {
    try {
        let students;

        if (req.query.id === undefined) {
            students = await db.query("SELECT name, picture, username, id FROM users WHERE school_id = $1 AND position = 'student' ORDER BY id ASC LIMIT 10", [req.params.id]);
        } else {
            students = await db.query("SELECT name, picture, username, id FROM users WHERE school_id = $1 AND position = 'student' AND id > $2 ORDER BY id ASC LIMIT 10", [req.params.id, req.query.id]);
        }

        console.log(students.rows)

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

exports.getStudent = async (req, res, next) => {
    try {
        const student = await db.query("SELECT name, picture, username, email FROM users WHERE id = $1", [req.params.id]);

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