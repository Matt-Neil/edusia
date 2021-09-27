const jwt = require('jsonwebtoken');
const db = require('../db');
const bcrypt = require('bcrypt');

const maxAge = 30 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'edusia secret', {
        expiresIn: maxAge
    })
}

exports.postLogin = async (req, res, next) => {
    try {
        const user = await db.query("SELECT * FROM users WHERE email = $1", [req.body.email]);

        switch (user.rows.length) {
            case 0:
                const school = await db.query("SELECT * FROM schools WHERE email = $1", [req.body.email]);

                if (school.rows.length === 1) {
                    const auth = await bcrypt.compare(req.body.password, school.rows[0].password);
    
                    if (auth) {
                        const token = createToken(school.rows[0].id);
    
                        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
                        res.status(201).json({
                            success: true,
                            data: school.rows[0]
                        })
                    } else {
                        throw "Wrong Password"
                    }
                } else {
                    throw "Wrong Email"
                }
                break;
            case 1:
                const auth = await bcrypt.compare(req.body.password, user.rows[0].password);
    
                if (auth) {
                    const token = createToken(user.rows[0].id);

                    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
                    res.status(201).json({
                        success: true,
                        data: user.rows[0]
                    })
                } else {
                    throw "Wrong Password"
                }
                break;
            default:
                throw "Wrong Email"
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getLogout = async (req, res, next) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.send("Logged Out");
}

exports.postUser = async (req, res, next) => {
    try {
        const user = await db.query("SELECT * FROM users WHERE username = $1", [req.body.name]);
        
        res.status(201).json({
            success: true,
            data: user.rows[0]
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postSchool = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);

        const user = await db.query("INSERT INTO schools (name, email, password, picture, position) VALUES ($1, $2, $3, $4, $5) returning *", 
            [req.body.name, req.body.email, hashedPassword, req.body.picture, req.body.position]);

        const token = createToken(user.rows[0].id);

        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({
            success: true,
            data: user.rows[0]
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getUser = async (req, res, next) => {
    try {
        res.status(201).json({
            success: true,
            data: res.locals.currentUser
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}
