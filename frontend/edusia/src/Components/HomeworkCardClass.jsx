import React from 'react'
import { Link } from 'react-router-dom'
const moment = require('moment');

const HomeworkCardClass = ({homework, classID}) => {
    const date = moment(homework.deadline);

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    return (
        <Link className="homeworkCardClass" to={`/homework/${homework.id}/${classID}`}>
            <div className="homeworkCardClassBox">
                <p className="homeworkCardClassTitle">{homework.title}</p>
            </div>
            <p className="homeworkCardClassInfo">{"Due " + displayDate()}</p>
        </Link>
    )
}

export default HomeworkCardClass
