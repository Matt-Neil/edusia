const fs = require('fs');

exports.removeFile = async (req, res, next) => {
    const path = `uploads/${req.body.file}`

    fs.unlink(path, (err) => {
        if (err) {
            console.log(err);
            return
        }
    })
}

exports.uploadFile = async (req, res, next) => {
    try {
        res.status(201).json({
            success: true,
            data: req.file.filename
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}
