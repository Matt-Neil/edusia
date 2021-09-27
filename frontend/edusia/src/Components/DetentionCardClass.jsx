import React from 'react'
const moment = require('moment');

const DetentionCard = ({detention}) => {
    const date = moment(detention.date);

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    return (
        <div className="detentionCardClass">
            <div className="detentionCardClassBox">
                <p className="detentionCardClassTitle">{detention.reason}</p>
            </div>
            <p style={{margin: "0 30px 0 0"}} className="detentionCardClassInfo">{displayDate()}</p>
            <p className="detentionCardClassInfo">{detention.location}</p>
        </div>
    )
}

export default DetentionCard
