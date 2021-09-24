import React, {useState, useEffect, useRef} from 'react'
import { Link } from 'react-router-dom'
import homeworkAPI from "../API/homework"
const moment = require('moment');

const HomeworkCard = ({homeworkReducer}) => {
    const date = moment(homeworkReducer.deadline);
    const [completed, setCompleted] = useState(homeworkReducer.completed);
    const [expired, setExpired] = useState(false);
    const timeoutID = useRef(null);

    useEffect(() => {
        if (!expired) {
            timeoutID.current = setTimeout(() => {
                if (homeworkReducer.deadline > new Date().toISOString()) {
                    setExpired(false);
                }
            }, 1000)
            return () => {clearTimeout(timeoutID.current)}
        }
    })

    const displayDate = () => {
        return date.utc().format("HH:mm DD/MM/YYYY")
    }

    const markComplete = async (e) => {

        try {
            await homeworkAPI.put(`/${homeworkReducer.id}/completed`, {
                state: homeworkReducer.completed
            });

            setCompleted(previousState => !previousState)
        } catch (err) {}
    }

    return (
        <div className="homeworkCard">
            <Link to={`/homework/${homeworkReducer.homework_id}/${homeworkReducer.class_id}`}>
                <p className="homeworkCardTitle">{homeworkReducer.title}</p>
                <p className="homeworkCardInfo">{homeworkReducer.subject}</p>
                <p className="homeworkCardInfo">{homeworkReducer.class_code}</p>
                <p className="homeworkCardInfo">{"Due " + displayDate()}</p>
            </Link>
            {completed ?
                <button disabled={expired} onClick={() => {markComplete()}}>Mark Incomplete</button>
            :
                <button disabled={expired} onClick={e => {window.addEventListener('click', markComplete()); markComplete(e)}}>Mark Complete</button>
            }
        </div>
    )
}

export default HomeworkCard
