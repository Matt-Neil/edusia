import React from 'react'
import { Link } from 'react-router-dom'
const moment = require('moment');

const HomeworkCard = ({homeworkReducer}) => {
    const date = moment(homeworkReducer.deadline);

    const displayDate = () => {
        return date.utc().format("HH:mm DD/MM/YYYY")
    }

    return (
        <Link to={`/homework/${homeworkReducer.homework_id}`} className="homeworkCard">
            <p className="homeworkCardTitle">{homeworkReducer.title}</p>
            <p className="homeworkCardInfo">{homeworkReducer.subject}</p>
            <p className="homeworkCardInfo">{homeworkReducer.class_code}</p>
            <p className="homeworkCardInfo">{"Due " + displayDate()}</p>
            <button>Completed</button>
        </Link>
    )
}

export default HomeworkCard
