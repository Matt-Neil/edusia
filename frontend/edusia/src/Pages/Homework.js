import React, {useState, useEffect} from 'react'
import homeworkAPI from "../API/homework"
import { useParams } from 'react-router-dom';
const moment = require('moment');

const Homework = ({currentUser}) => {
    const [homework, setHomework] = useState();
    const [loaded, setLoaded] = useState(false);
    const homeworkID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const homework = await homeworkAPI.get(`/${homeworkID}/single`);

                setHomework(homework.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    const displayDate = () => {
        const date = moment(homework.deadline);
        
        return date.utc().format("HH:mm DD/MM/YYYY")
    }

    return (
        <>
            {loaded &&
                <>
                    {currentUser.position === "student" &&
                        <div className="toolbar">
                            <button>Mark Complete</button>
                            <button>Edit/Add Submission</button>
                        </div>
                    }
                    {currentUser.position === "teacher" &&
                        <div className="toolbar">
                            <button>View Submissions</button>
                            <button>Edit Homework</button>
                            <button>Delete Homework</button>
                        </div>
                    }
                    <div className="innerBody">
                        <p>{homework.class.lesson}</p>
                        <p>{homework.class.subject}</p>
                        <p>{homework.title}</p>
                        <p>{homework.description}</p>
                        <p>{displayDate()}</p>
                    </div>
                </>
            }
        </>
    )
}

export default Homework
