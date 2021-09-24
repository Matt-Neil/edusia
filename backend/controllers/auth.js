const jwt = require('jsonwebtoken');
const db = require('../db');
const bcrypt = require('bcrypt');

const maxAge = 30 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'edusia secret', {
        expiresIn: maxAge
    })
}

const handleErrors = (err) => {
    let errors = { email: "", password: "", name: "" };

    if (err.message === "Incorrect email") {
        errors.email = "Incorrect email"
    }

    if (err.message === "Incorrect password") {
        errors.password = "Incorrect password"
    }

    if (err.code === 11000) {
        errors.email = 'That email has already been registered';
        return errors;
    }

    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

exports.postLogin = async (req, res, next) => {
    try {
        let user;
        
        user = await db.query("SELECT * FROM users WHERE email = $1", [req.body.email]);
            
        if (user.rows.length === 1) {
            const auth = await bcrypt.compare(req.body.password, user.password);
    
            if (auth) {
                const token = createToken(user.rows[0].id);

                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
                res.status(201).json({
                    success: true,
                    data: user.rows[0]
                })
            }
            throw Error("Incorrect password")
        }
        throw Error("Incorrect username")

        // const token = createToken(user.rows[0].id);

        // res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        // res.status(201).json({
        //     success: true,
        //     data: user.rows[0]
        // })

    } catch (err) {
        console.log(err)
        const errors = handleErrors(err);
        res.status(400).json({ errors });
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
        const errors = handleErrors(err);
        res.status(400).json({ errors });
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
        const errors = handleErrors(err);
        res.status(400).json({ errors });
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

// UsersSchema.pre('save', async function (next) {
//     this.password = await bcrypt.hash(this.password.toString(), 10);
    
//     next()
// })
