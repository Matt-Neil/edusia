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

exports.getLesson = async (req, res, next) => {
    try {
        const lesson = await db.query("SELECT classes.subject, classes.class_code, users.name, users.picture, users.email, users.username FROM classes INNER JOIN users ON classes.id = $1 AND (classes.school_id = $2 OR classes.teacher_id = $2) AND users.id = classes.teacher_id", 
            [req.params.id, res.locals.currentUser.id]);
        
        res.status(201).json({
            success: true,
            data: lesson.rows[0]
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getLessonsTeacher = async (req, res, next) => {
    try {
        const lessons = await db.query("SELECT subject, class_code, id FROM classes WHERE teacher_id = $1", [req.params.id]);
        
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
        const lessons = await db.query("SELECT subject, class_code, id FROM classes WHERE school_id = $1", [req.params.id]);
        
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
                [student, classes.rows[0].id]);
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

exports.updateLesson = async (req, res, next) => {
    try {
        await db.query("UPDATE classes SET teacher_id = $1, school_id = $2, subject = $3, class_code = $4 WHERE classes.id = $5 returning *",
            [req.body.teacher_id, req.body.school_id, req.body.subject, req.body.class_code, req.params.id]);
        
        if (!lesson) {
            res.status(404).json({
                success: false,
                error: "Class Not Found."
            })
        } else {
            lesson.teacher = teacher;
            lesson.students = students;
            lesson.classCode = classCode;

            await lesson.save();

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