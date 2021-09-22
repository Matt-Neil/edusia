const db = require('../db');
// const handleErrors = (err) => {
//     let errors = { rating: "", title: "", servings: "", description: "", difficulty: "", meal: "" };

//     if (err.message.includes('Recipe validation failed')) {
//         Object.values(err.errors).forEach(({properties}) => {
//             errors[properties.path] = properties.message;
//         })
//     }

//     return errors;
// }

exports.getHomework = async (req, res, next) => {
    try {
        let homework;

        if (res.locals.currentUser !== "student") {
            homework = await db.query("SELECT * FROM homework WHERE id = $1", [req.params.id])
        } else {
            homework = await db.query("SELECT homework.id, homework.teacher, homework.class_id, homework.title, homework.description, homework.deadline, homework.file, students_homework.completed, students_homework.submission FROM homework INNER JOIN students_homework ON homework.id = $1 AND homework.id = students_homework.homework_id AND students_homework.students_id = $2",
                [res.locals.currentUser.id])
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
        const homework = await db.query("SELECT classes.class_code, homework.class_id, students_homework.completed, homework.deadline, students_homework.homework_id, classes.subject, homework.title FROM students_homework INNER JOIN homework ON students_homework.student_id = $1 AND homework.id = students_homework.homework_id AND homework.deadline > $2 INNER JOIN classes ON classes.id = homework.class_id ORDER BY homework.deadline ASC LIMIT 10",
            [res.locals.currentUser.id, new Date(req.query.date)]);

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
        const homework = await db.query("SELECT homework.id, homework.title, homework.deadline FROM homework INNER JOIN classes ON homework.class_id = $1 AND homework.class_id = classes.id AND (classes.teacher_id = $2 OR classes.school_id = $2) AND homework.deadline > $2 ORDER BY homework.deadline ASC LIMIT 10",
            [req.params.id, res.locals.currentUser.id, new Date(req.query.date)])

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

exports.addHomework = async (req, res, next) => {
    try {
        // if (res.locals.currentUser.position === "teacher") {
        //     await Homework.create(req.body);

        //     res.status(201).json({
        //         success: true
        //     })
        // }
        const hwk = await Homework.create(req.body);

        console.log(hwk)

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
        if (res.locals.currentUser.position === "teacher") {
            const { title, description, deadline, file } = req.body;
            const homework = await Homework.findById(req.params.id);
            
            if (!homework) {
                res.status(404).json({
                    success: false,
                    error: "No Homework Found."
                })
            } else {
                homework.title = title;
                homework.description = description;
                homework.deadline = deadline;
                homework.file = file;
                homework.teacher = homework.teacher;
                homework.students = homework.students;
                homework.class = homework.class;
    
                await homework.save();
    
                res.status(201).json({
                    success: true
                })
            }
        }
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
        if (res.locals.currentUser.position === "teacher") {
            const homework = await Homework.findById(req.params.id);

            if (!homework) {
                res.status(404).json({
                    success: false,
                    error: "No Recipe Found."
                })
            } else {
                await homework.remove();

                res.status(201).json({
                    success: true
                })
            }
        }
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
            submissions = await db.query("SELECT students_homework.submission, students_homework.completed FROM students_homework INNER JOIN users ON students_homework.homework_id = $1 AND students_homework.student_id = users.id AND students_homework.student_id = $2",
                [req.params.id, res.locals.currentUser.id]);

            res.status(201).json({
                success: true,
                data: submissions.rows[0]
            })
        } else {
            submissions = await db.query("SELECT students_homework.submission, users.id, users.name, users.username FROM students_homework INNER JOIN users ON students_homework.homework_id = $1 AND users.id = students_homework.student_id",
                [req.params.id]);
            
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