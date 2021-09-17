const jwt = require('jsonwebtoken');
const db = require('../db');

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, "edusia secret", async (err, decodedToken) => {
    
            if (err) {
                res.locals.currentUser = null;
                next();
            } else {
                const user = await db.query("SELECT * FROM users WHERE id = $1", [decodedToken.id]);
                
                if (user.rows.length !== 0) {
                    res.locals.currentUser = user.rows[0];
                } else {
                    const school = await db.query("SELECT * FROM schools WHERE id = $1", [decodedToken.id]);

                    if (school.rows.length !== 0) {
                        res.locals.currentUser = school.rows[0];
                    } else {
                        res.locals.currentUser = null;
                    }
                }
                next();
            }
        });
    } else {
        res.locals.currentUser = null;
        next();
    }
}

module.exports = { checkUser }