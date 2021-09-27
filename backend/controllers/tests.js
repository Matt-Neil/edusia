const db = require('../db');

exports.updateTestGrades = async (req, res, next) => {
    try {
        await db.query("UPDATE students_tests SET grade = $1 WHERE students_tests.test_id = $2 AND students_tests.student_id = $3", 
            [req.body.grade, req.params.id, req.body.student]);
            
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

exports.getTests = async (req, res, next) => {
    try {
        const tests = await db.query("SELECT tests.title, tests.date, tests.id FROM tests INNER JOIN classes ON classes.id = tests.class_id AND classes.id = $1 AND (classes.school_id = $2 OR classes.school_id = $3) AND tests.date > $4 ORDER BY tests.date ASC LIMIT $5", 
            [req.params.id, res.locals.currentUser.id, res.locals.currentUser.school_id, new Date(req.query.date), req.query.length]);
        
        res.status(201).json({
            success: true,
            data: tests.rows
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getTest = async (req, res, next) => {
    try {
        const test = await db.query("SELECT tests.title, tests.date, classes.class_code FROM tests INNER JOIN classes ON tests.id = $1 AND tests.class_id = $2 AND (classes.school_id = $3 OR classes.school_id = $4)", 
            [req.params.id, req.query.class, res.locals.currentUser.id, res.locals.currentUser.school_id]);

        const students = await db.query("SELECT students_tests.grade, users.name, users.picture, users.username, users.email, users.id FROM students_tests INNER JOIN tests ON tests.id = students_tests.test_id AND tests.id = $1 AND tests.class_id = $2 INNER JOIN users ON users.id = students_tests.student_id INNER JOIN classes ON tests.class_id = classes.id AND (classes.school_id = $3 OR classes.school_id = $4) ORDER BY users.name",
            [req.params.id, req.query.class, res.locals.currentUser.id, res.locals.currentUser.school_id]);
        
        res.status(201).json({
            success: true,
            data: {
                test: test.rows[0],
                students: students.rows
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.updateTest = async (req, res, next) => {
    try {
        const lesson = await db.query("SELECT classes.subject, classes.class_code, users.name, users.picture, users.email, users.username FROM classes INNER JOIN users ON classes.id = $1 AND (classes.school_id = $2 OR classes.teacher_id = $2) AND users.id = classes.teacher_id", 
            [req.params.id, res.locals.currentUser.id]);
        
        res.status(201).json({
            success: true,
            data: lesson.rows[0]
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.deleteTest = async (req, res, next) => {
    try {
        await db.query("DELETE FROM tests WHERE id = $1",
            [req.params.id])
        
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

exports.postTest = async (req, res, next) => {
    try {
        const test = await db.query("INSERT INTO tests (class_id, title, date) VALUES ($1, $2, $3) returning *",
            [req.params.id, req.body.title, req.body.date])

        {req.body.students.map(async (student) => {
            await db.query("INSERT INTO students_tests (student_id, test_id, grade) VALUES ($1, $2, $3) returning *",
                [student.id, test.rows[0].id, null])
        })}
        
        res.status(201).json({
            success: true,
            data: test.rows[0]
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}