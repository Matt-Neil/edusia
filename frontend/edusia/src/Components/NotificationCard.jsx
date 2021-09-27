import React from 'react'
const moment = require('moment');

const NotificationCard = ({notification}) => {
    const date = moment(notification.expire);

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    const displayClass = () => {
        return `${notification.subject} (${notification.class_code})`
    }

    return (
        <div className="notificationCard">
            <div className="notificationCardHeader">
                <p className="notificationCardTitle">{displayClass()}</p>
                <p className="notificationCardInfo">{"Expires: " + displayDate()}</p>
            </div>
            <p className="notificationCardText">{notification.notification}</p>
        </div>
    )
}

export default NotificationCard
