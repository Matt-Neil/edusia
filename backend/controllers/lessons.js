const db = require('../db');

exports.getLesson = async (req, res, next) => {
    try {
        const lesson = await db.query("SELECT classes.subject, classes.class_code, users.name, users.picture, users.username, classes.teacher_id FROM classes INNER JOIN users ON classes.id = $1 AND (classes.school_id = $2 OR classes.school_id = $3) AND users.id = classes.teacher_id", 
            [req.params.id, res.locals.currentUser.id, res.locals.currentUser.school_id]);
        
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

exports.getLessonsTeacher = async (req, res, next) => {
    try {
        const lessons = await db.query("SELECT subject, class_code, id FROM classes WHERE teacher_id = $1 AND school_id = $2", 
            [req.params.id, res.locals.currentUser.school_id]);
        
        res.status(201).json({
            success: true,
            data: lessons.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getLessonsSchool = async (req, res, next) => {
    try {
        const lessons = await db.query("SELECT subject, class_code, id FROM classes WHERE school_id = $1 AND $1 = $2",
            [req.params.id, res.locals.currentUser.id]);
        
        res.status(201).json({
            success: true,
            data: lessons.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postLesson = async (req, res, next) => {
    try {
        const classes = await db.query("INSERT INTO classes (teacher_id, school_id, subject, class_code) VALUES ($1, $2, $3, $4) returning *",
            [req.body.teacher_id, req.body.school_id, req.body.subject, req.body.class_code]);
        
        await db.query("UPDATE classes SET tokens = to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(class_code, '')) WHERE id = $1", [classes.rows[0].id]);

        {req.body.students.map(async (student) => {
            await db.query("INSERT INTO students_classes (student_id, class_id) VALUES ($1, $2) returning *",
                [student.id, classes.rows[0].id]);
        })}

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

exports.updateLesson = async (req, res, next) => {
    try {
        await db.query("UPDATE classes SET teacher_id = $1, subject = $2, class_code = $3 WHERE classes.id = $4 returning *",
            [req.body.teacher_id, req.body.subject, req.body.class_code, req.params.id]);

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

exports.deleteLesson = async (req, res, next) => {
    try {
        await db.query("DELETE FROM classes WHERE classes.id = $1", [req.params.id]);
        
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

exports.addStudentsLesson = async (req, res, next) => {
    try {
        await db.query("INSERT INTO students_classes (student_id, class_id) VALUES ($1, $2) returning *", 
            [req.body.student, req.params.id]);

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

exports.deleteStudentsLesson = async (req, res, next) => {
    try {
        await db.query("DELETE FROM students_classes WHERE student_id = $1 and class_id = $2", 
            [req.query.student, req.params.id]);

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