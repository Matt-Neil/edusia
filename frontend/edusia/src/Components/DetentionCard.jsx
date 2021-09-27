import React from 'react'
const moment = require('moment');

const DetentionCard = ({detention}) => {
    const date = moment(detention.date);

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    const displayClass = () => {
        return `${detention.subject} (${detention.class_code})`
    }

    return (
        <div className="detentionCard">
            <p className="detentionCardTitle">{displayClass()}</p>
            <p className="detentionCardInfo">{displayDate()}</p>
            <p className="detentionCardInfo">{detention.location}</p>
        </div>
    )
}

export default DetentionCard
