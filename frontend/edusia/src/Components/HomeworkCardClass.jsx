import React from 'react'
import { Link } from 'react-router-dom'
const moment = require('moment');

const HomeworkCardClass = ({homework}) => {
    const date = moment(homework.deadline);

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    return (
        <Link className="homeworkCardClass" to={`/homework/${homework.homework_id}/${homework.class_id}`}>
            <div className="homeworkCardClassBox">
                <p className="homeworkCardClassTitle">{homework.title}</p>
            </div>
            <p className="homeworkCardClassInfo">{"Due " + displayDate()}</p>
        </Link>
    )
}

export default HomeworkCardClass
