const db = require('../db');

exports.getSearch = async (req, res, next) => {
    try {
        let results;

        if (req.query.id === undefined) {
            switch (req.query.type) {
                case 'classes':
                    results = await db.query("SELECT classes.subject, classes.id, classes.class_code FROM classes WHERE tokens @@ to_tsquery($1) AND school_id = $2",
                        [req.query.phrase.replace(' ', ' & '), res.locals.currentUser.id]);
                    break;
                case 'teachers':
                    results = await db.query("SELECT name, id, username, picture FROM users WHERE tokens @@ to_tsquery($1) AND position = 'teacher' AND school_id = $2",
                        [req.query.phrase.replace(' ', ' & '), res.locals.currentUser.id]);
                    break;
                case 'students':
                    results = await db.query("SELECT name, id, email, picture FROM users WHERE tokens @@ to_tsquery($1) AND position = 'student' AND school_id = $2", 
                        [req.query.phrase.replace(' ', ' & '), res.locals.currentUser.id]);
                    break;
                case 'all':
                    results = await db.query("SELECT name, id, email, picture FROM users WHERE tokens @@ to_tsquery($1) AND school_id = $2", 
                        [req.query.phrase.replace(' ', ' & '), res.locals.currentUser.id]);
                    break;
            }
        } else {
            switch (req.query.type) {
                case 'classes':
                    results = await db.query("SELECT classes.subject, classes.id, classes.class_code FROM classes WHERE tokens @@ to_tsquery($1) AND school_id = $2 AND classes.id > $3 ORDER BY classes.id ASC LIMIT 10",
                        [req.query.phrase.replace(' ', ' & '), res.locals.currentUser.id, req.query.id]);
                    break;
                case 'teachers':
                    results = await db.query("SELECT name, id, username, picture FROM users WHERE tokens @@ to_tsquery($1) AND position = 'teacher' AND school_id = $2 AND id > $3 ORDER BY id ASC LIMIT 10",
                        [req.query.phrase.replace(' ', ' & '), res.locals.currentUser.id, req.query.id]);
                    break;
                case 'students':
                    results = await db.query("SELECT name, id, email, username, picture FROM users WHERE tokens @@ to_tsquery($1) AND position = 'student' AND school_id = $2 AND id > $3 ORDER BY id ASC LIMIT 10", 
                        [req.query.phrase.replace(' ', ' & '), res.locals.currentUser.id, req.query.id]);
                    break;
                case 'all':
                    results = await db.query("SELECT name, id, email, username, picture FROM users WHERE tokens @@ to_tsquery($1) AND school_id = $2 AND id > $3 ORDER BY id ASC LIMIT 10", 
                        [req.query.phrase.replace(' ', ' & '), res.locals.currentUser.id, req.query.id]);
                    break;
            }
        }

        return res.status(201).json({
            success: true,
            data: results.rows
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getSearchTeachers = async (req, res, next) => {
    try {
        const results = await db.query("SELECT name, id, picture, username FROM users WHERE tokens @@ to_tsquery($1) AND position = 'teacher' AND school_id = $2",
            [req.query.phrase.replace(' ', ' & '), req.params.id]);

        return res.status(201).json({
            success: true,
            data: results.rows
        })
    } catch (err) {

        console.log(err)
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getSearchStudents = async (req, res, next) => {
    try {
        const results = await db.query("SELECT name, id, picture, username FROM users WHERE tokens @@ to_tsquery($1) AND position = 'student' AND school_id = $2",
            [req.query.phrase.replace(' ', ' & '), req.params.id]);

        return res.status(201).json({
            success: true,
            data: results.rows
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}