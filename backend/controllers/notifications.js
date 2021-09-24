const db = require('../db');

exports.getNotificationsStudent = async (req, res, next) => {
    try {
        const notifications = await db.query("SELECT notifications.expire, notifications.notification FROM notifications INNER JOIN students_classes ON students_classes.id = notifications.class_id AND students_classes.student_id = $1 INNER JOIN classes ON classes.id = notifications.class_id AND classes.school_id = $2 AND notifications.expire > $3 ORDER BY notifications.expire ASC LIMIT 10", 
            [req.params.id, res.locals.currentUser.school_id, new Date(req.query.date)]);   

        res.status(201).json({
            success: true,
            data: notifications.rows
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getNotificationsClass = async (req, res, next) => {
    try {
        const notifications = await db.query("SELECT notifications.id, notifications.expire, notifications.notification FROM notifications INNER JOIN classes ON classes.id = notifications.class_id AND classes.id = $1 AND (classes.school_id = $2 OR classes.school_id = $3) AND notifications.expire > $4 AND notifications.expire > $5 ORDER BY notifications.expire ASC LIMIT 10", 
            [req.params.id, res.locals.currentUser.school_id, res.locals.currentUser.id, new Date(req.query.date), new Date().toISOString()]); 

        res.status(201).json({
            success: true,
            data: notifications.rows
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putNotifications = async (req, res, next) => {
    try {
        await db.query("UPDATE notifications SET expire = $1, notification = $2 WHERE id = $3 returning *",
            [req.body.expire, req.body.notification, req.params.id])

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

exports.postNotifications = async (req, res, next) => {
    try {
        const notification = await db.query("INSERT INTO notifications (class_id, expire, notification) VALUES ($1, $2, $3) returning *",
            [req.body.class_id, req.body.expire, req.body.notification])

        res.status(201).json({
            success: true,
            data: notification.rows[0]
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.deleteNotifications = async (req, res, next) => {
    try {
        await db.query("DELETE FROM notifications WHERE id = $1", [req.params.id])

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