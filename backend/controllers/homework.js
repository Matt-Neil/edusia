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
        const homework = await db.query("SELECT * FROM homework WHERE id = $1", [req.params.id])

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
        const homework = await db.query("SELECT classes.class_code, homework.class_id, students_homework.completed, homework.deadline, students_homework.homework_id, classes.subject, homework.title FROM students_homework INNER JOIN homework ON students_homework.student_id = $1 AND homework.id = students_homework.homework_id AND homework.deadline > $2 INNER JOIN classes ON classes.id = homework.class_id ORDER BY homework.deadline ASC LIMIT 10", [res.locals.currentUser.id, new Date(req.query.date)])
        
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
        const homework = await db.query("SELECT id, title, deadline FROM homework WHERE class_id = $1", [req.params.id])

        res.status(201).json({
            success: true,
            data: homework.rows
        })
    } catch (err) {
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

exports.getSubmission = async (req, res, next) => {
    try {
        if (res.locals.currentUser.position === "student") {
            const submission = await Submissions.findById(req.params.id);

            if (!submission) {
                res.status(404).json({
                    success: false,
                    error: "No Submission Found."
                })
            } else {
                await submission.remove();

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

exports.addSubmission = async (req, res, next) => {
    try {
        if (res.locals.currentUser.position === "student") {
            await Submissions.create(req.body);

            res.status(201).json({
                success: true
            })
        }
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({
            success: false,
            errors: errors
        });
    }
}

exports.updateSubmission = async (req, res, next) => {
    try {
        if (res.locals.currentUser.position === "student") {
            const { file } = req.body;
            const submission = await Submissions.findById(req.params.id);
            
            if (!submission) {
                res.status(404).json({
                    success: false,
                    error: "No Submission Found."
                })
            } else {
                submission.file = file;
                submission.student = submission.student;
    
                await submission.save();
    
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

exports.deleteSubmission = async (req, res, next) => {
    try {
        if (res.locals.currentUser.position === "student") {
            const submission = await Submissions.findById(req.params.id);

            if (!submission) {
                res.status(404).json({
                    success: false,
                    error: "No Submission Found."
                })
            } else {
                await submission.remove();

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