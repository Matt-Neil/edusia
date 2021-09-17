const db = require('../db');

exports.getSearch = async (req, res, next) => {
    try {
        let results;

        if (req.query.id === undefined) {
            switch (req.query.type) {
                case 'classes':
                    results = await db.query("SELECT classes.subject, classes.id, classes.class_code, users.name FROM classes INNER JOIN users ON classes.teacher_id = users.id AND tokens @@ to_tsquery($1) AND school_id = $2",
                        [req.query.phrase, res.locals.currentUser.id]);
                    break;
                case 'teachers':
                    results = await db.query("SELECT name, id, email, username, picture FROM users WHERE tokens @@ to_tsquery($1) AND position = 'teacher' AND school_id = $2",
                        [req.query.phrase, res.locals.currentUser.id]);
                    break;
                case 'students':
                    results = await db.query("SELECT name, id, email, username, picture FROM users WHERE tokens @@ to_tsquery($1) AND position = 'student' AND school_id = $2", 
                        [req.query.phrase, res.locals.currentUser.id]);
                    break;
            }
        } else {
            switch (req.query.type) {
                case 'classes':
                    results = await db.query("SELECT classes.subject, classes.id, classes.class_code, users.name FROM classes INNER JOIN users ON classes.teacher_id = users.id AND tokens @@ to_tsquery($1) AND school_id = $2 AND classes.id > $3 ORDER BY classes.id ASC LIMIT 10",
                        [req.query.phrase, res.locals.currentUser.id, req.query.id]);
                    break;
                case 'teachers':
                    results = await db.query("SELECT name, id, email, username, picture FROM users WHERE tokens @@ to_tsquery($1) AND position = 'teacher' AND school_id = $2 AND id > $3 ORDER BY id ASC LIMIT 10",
                        [req.query.phrase, res.locals.currentUser.id, req.query.id]);
                    break;
                case 'students':
                    results = await db.query("SELECT name, id, email, username, picture FROM users WHERE tokens @@ to_tsquery($1) AND position = 'student' AND school_id = $2 AND id > $3 ORDER BY id ASC LIMIT 10", 
                        [req.query.phrase, res.locals.currentUser.id, req.query.id]);
                    break;
            }
        }

        return res.status(201).json({
            success: true,
            data: results.rows
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}