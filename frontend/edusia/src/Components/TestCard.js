import React from 'react'
import { Link } from 'react-router-dom';
const moment = require('moment');

const TestCard = ({test, classID}) => {
    const date = moment(test.date);

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    return (
        <Link className="testCard" to={`/test/${test.id}/${classID}`}>
            <div className="testCardBox">
                <p className="testCardTitle">{test.title}</p>
            </div>
            <p className="testCardInfo">{displayDate()}</p>
        </Link>
    )
}

export default TestCard
