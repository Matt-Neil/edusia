import React, {useState, useEffect, useRef} from 'react'
import { Link } from 'react-router-dom'
import homeworkAPI from "../API/homework"
const moment = require('moment');

const HomeworkCard = ({homeworkReducer}) => {
    const date = moment(homeworkReducer.deadline);
    const [expired, setExpired] = useState(false);
    const [completed, setCompleted] = useState(homeworkReducer.completed);
    const timeoutID = useRef(null);

    useEffect(() => {
        if (homeworkReducer.deadline < new Date().toISOString()) {
            setExpired(true)
        }
    }, [])

    useEffect(() => {
        if (!expired) {
            timeoutID.current = setTimeout(() => {
                if (homeworkReducer.deadline > new Date().toISOString()) {
                    setExpired(false);
                } else {
                    setExpired(true)
                }
            }, 1000)
            return () => {clearTimeout(timeoutID.current)}
        }
    })

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    const markComplete = async () => {
        try {
            setCompleted(previousState => !previousState);

            await homeworkAPI.put(`/${homeworkReducer.id}/completed`, {
                state: completed
            });
        } catch (err) {}
    }

    return (
        <div className="homeworkCard">
            <Link className="homeworkCardLink" to={`/homework/${homeworkReducer.homework_id}/${homeworkReducer.class_id}`}>
                <p className="homeworkCardTitle">{homeworkReducer.title}</p>
                <div className="homeworkCardBox">
                    <p className="homeworkCardInfo">{homeworkReducer.subject}</p>
                    <p className="homeworkCardInfo">{homeworkReducer.class_code}</p>
                    <p className="homeworkCardInfo">{"Due " + displayDate()}</p>
                </div>
            </Link>
            <input className="homeworkCardButton" type="checkbox" checked={completed} disabled={expired} onChange={() => {markComplete()}} />
        </div>
    )
}

export default HomeworkCard
