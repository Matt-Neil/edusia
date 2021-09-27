import React from 'react'
const moment = require('moment');

const NotificationCardClass = ({notification}) => {
    const date = moment(notification.expire);

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    return (
        <div className="notificationCardClass">
            <div className="notificationCardClassBox">
                <p className="notificationCardClassTitle">{notification.notification}</p>
            </div>
            <p className="notificationCardClassInfo">{displayDate()}</p>
        </div>
    )
}

export default NotificationCardClass