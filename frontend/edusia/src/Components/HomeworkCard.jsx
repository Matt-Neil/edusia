import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import homeworkAPI from "../API/homework"
const moment = require('moment');

const HomeworkCard = ({homeworkReducer}) => {
    const date = moment(homeworkReducer.deadline);
    const [completed, setCompleted] = useState(homeworkReducer.completed);
    const [expired, setExpired] = useState(true);

    useEffect(() => {
        if (homeworkReducer.deadline > new Date().toISOString()) {
            setExpired(false);
        }
    }, [])

    const displayDate = () => {
        return date.utc().format("HH:mm DD/MM/YYYY")
    }

    const markComplete = async () => {
        try {
            await homeworkAPI.put(`/${homeworkReducer.id}/completed`, {
                state: homeworkReducer.completed
            });

            setCompleted(previousState => !previousState)
        } catch (err) {}
    }

    return (
        <Link to={`/homework/${homeworkReducer.homework_id}`} className="homeworkCard">
            <p className="homeworkCardTitle">{homeworkReducer.title}</p>
            <p className="homeworkCardInfo">{homeworkReducer.subject}</p>
            <p className="homeworkCardInfo">{homeworkReducer.class_code}</p>
            <p className="homeworkCardInfo">{"Due " + displayDate()}</p>
            {completed ?
                <button disabled={expired} onClick={() => {markComplete()}}>Mark Incomplete</button>
            :
                <button disabled={expired} onClick={() => {markComplete()}}>Mark Complete</button>
            }
        </Link>
    )
}

export default HomeworkCard
