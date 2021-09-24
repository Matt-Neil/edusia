const db = require('../db');

exports.getHomework = async (req, res, next) => {
    try {
        let homework;

        if (res.locals.currentUser !== "student") {
            homework = await db.query("SELECT homework.class_id, homework.title, homework.description, homework.deadline, homework.file, classes.class_code FROM homework INNER JOIN classes ON homework.id = $1 AND homework.class_id = classes.id AND (classes.school_id = $2 OR classes.school_id = $3)", 
                [req.params.id, res.locals.currentUser.id, res.locals.currentUser.school_id])
        } else {
            homework = await db.query("SELECT homework.class_id, homework.title, homework.description, homework.deadline, homework.file, students_homework.completed, students_homework.submission, classes.class_code FROM homework INNER JOIN students_homework ON homework.id = $1 AND homework.id = students_homework.homework_id AND students_homework.student_id = $2 INNER JOIN classes ON homework.class_id = classes.id AND classes.school_id = $3",
                [req.params.id, res.locals.currentUser.id, res.locals.currentUser.school_id])
        }

        res.status(201).json({
            success: true,
            data: homework.rows[0]
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getHomeworkStudent = async (req, res, next) => {
    try {
        const homework = await db.query("SELECT homework.id, classes.class_code, homework.class_id, students_homework.completed, homework.deadline, students_homework.homework_id, classes.subject, homework.title FROM students_homework INNER JOIN homework ON students_homework.student_id = $1 AND homework.id = students_homework.homework_id AND homework.deadline > $2 INNER JOIN classes ON classes.id = homework.class_id AND classes.school_id = $3 ORDER BY homework.deadline ASC LIMIT 10",
            [res.locals.currentUser.id, new Date(req.query.date), res.locals.currentUser.school_id]);

        res.status(201).json({
            success: true,
            data: homework.rows
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getHomeworkClass = async (req, res, next) => {
    try {
        const homework = await db.query("SELECT homework.id, homework.title, homework.deadline FROM homework INNER JOIN classes ON homework.class_id = $1 AND homework.class_id = classes.id AND (classes.school_id = $2 OR classes.school_id = $3) AND homework.deadline > $4 ORDER BY homework.deadline ASC LIMIT 10",
            [req.params.id, res.locals.currentUser.id, res.locals.currentUser.school_id, new Date(req.query.date)])

        res.status(201).json({
            success: true,
            data: homework.rows
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postHomework = async (req, res, next) => {
    try {
        const homework = await db.query("INSERT INTO homework (teacher_id, class_id, title, description, deadline, file) VALUES ($1, $2, $3, $4, $5, $6) returning *",
            [req.body.teacher_id, req.body.class_id, req.body.title, req.body.description, req.body.deadline, req.body.file])

        {req.body.students.map(async (student) => {
            await db.query("INSERT INTO students_homework (student_id, homework_id, completed, submission) VALUES ($1, $2, $3, $4) returning *",
                [student.id, homework.rows[0].id, false, ''])
        })}

        res.status(201).json({
            success: true
        })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({
            success: false,
            errors: errors
        });
    }
}

exports.updateHomework = async (req, res, next) => {
    try {
        await db.query("UPDATE homework SET title = $1, description = $2, deadline = $3, file = $4 WHERE id = $5 returning *",
            [req.body.title, req.body.description, req.body.deadline, req.body.file, req.params.id])

        res.status(201).json({
            success: true
        })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({
            success: false,
            errors: errors
        });
    }
}

exports.deleteHomework = async (req, res, next) => {
    try {
        await db.query("DELETE FROM homework WHERE id = $1", [req.params.id])
        
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

exports.putCompleted = async (req, res, next) => {
    try {
        await db.query("UPDATE students_homework SET completed = $1 WHERE homework_id = $2 AND student_id = $3",
            [!req.body.state, req.params.id, res.locals.currentUser.id]);

        res.status(201).json({
            success: true,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getSubmissions = async (req, res, next) => {
    try {
        let submissions;

        if (res.locals.currentUser.position === "student") {
            submissions = await db.query("SELECT students_homework.submission, students_homework.completed FROM students_homework INNER JOIN users ON students_homework.homework_id = $1 AND students_homework.student_id = users.id AND students_homework.student_id = $2 AND users.school_id = $3",
                [req.params.id, res.locals.currentUser.id, res.locals.currentUser.school_id]);

            res.status(201).json({
                success: true,
                data: submissions.rows[0]
            })
        } else {
            submissions = await db.query("SELECT students_homework.submission, users.id, user.picture, users.name, users.username FROM students_homework INNER JOIN users ON students_homework.homework_id = $1 AND users.id = students_homework.student_id AND (users.school_id = $2 OR users.school_id = $3)",
                [req.params.id, res.locals.currentUser.id, res.locals.currentUser.school_id]);
            
            res.status(201).json({
                success: true,
                data: submissions.rows
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.updateSubmission = async (req, res, next) => {
    try {
        switch (req.query.type) {
            case "add":
                await db.query("UPDATE students_homework SET submission = $1 WHERE homework_id = $2 AND student_id = $3", 
                    [req.body.file, req.params.id, res.locals.currentUser.id])
                break;
            case "delete":
                await db.query("UPDATE students_homework SET submission = '' WHERE homework_id = $1 AND student_id = $2", 
                    [req.params.id, res.locals.currentUser.id])
                break;
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