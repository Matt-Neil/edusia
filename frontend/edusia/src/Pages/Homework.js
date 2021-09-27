import React, {useState, useEffect, useRef, useContext} from 'react'
import homeworkAPI from "../API/homework"
import fileAPI from "../API/file"
import { Link, useParams, useHistory } from 'react-router-dom';
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import MessageCard from '../Components/MessageCard'
const moment = require('moment');

const Homework = ({currentUser}) => {
    const [expired, setExpired] = useState(false);
    const [completed, setCompleted] = useState();
    const [homework, setHomework] = useState();
    const [submissions, setSubmissions] = useState();
    const [adjustSubmission, setAdjustSubmission] = useState(false);
    const [submissionFile, setSubmissionFile] = useState("");
    const [loaded, setLoaded] = useState(false);
    const timeoutID = useRef(null);
    const homeworkID = useParams().id;
    const classID = useParams().class;
    const history = useHistory();
    const {displayAddedMessage, displayErrorMessage, displayMessageAddedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const homework = await homeworkAPI.get(`/${homeworkID}`);
                const submissions = await homeworkAPI.get(`/${homeworkID}/submissions`);

                if (homework.data.data) {
                    setHomework(homework.data.data);
                    setSubmissions(submissions.data.data);
                    setLoaded(true);
                } else {
                    history.replace("/home");
                }

                
            } catch (err) {
                displayMessageErrorInterval("Error Loading Page")
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (loaded) {
            if (homework.deadline > new Date().toISOString()) {
                setExpired(false);
            } else {
                setExpired(true);
            }
            setCompleted(submissions.completed);
        }
    }, [loaded])

    useEffect(() => {
        if (loaded && !expired) {
            timeoutID.current = setTimeout(() => {
                if (homework.deadline > new Date().toISOString()) {
                    setExpired(false);
                } else {
                    setExpired(true);
                }
            }, 1000)
            return () => {clearTimeout(timeoutID.current)}
        }
    })

    const uploadFile = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('uploadedFile', submissionFile);

            const uploadResponse = await fileAPI.post("/upload", formData);
            
            setSubmissions(previousState => ({...previousState, submission: uploadResponse.data.data}));

            await homeworkAPI.put(`/${homeworkID}/submissions?type=add`, {
                file: uploadResponse.data.data
            });

            if (submissions.submission !== "") {
                await fileAPI.put('/remove', {file: submissions.submission});
            }

            setAdjustSubmission(false);
            displayMessageAddedInterval();
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const removeFile = async () => {
        try {
            if (submissionFile !== "") {
                const temp = submissions.submission;

                setSubmissions(previousState => ({...previousState, submission: ""}));
                setSubmissionFile("");

                await homeworkAPI.put(`/${homeworkID}/submissions?type=delete`);

                await fileAPI.put('/remove', {file: temp});
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const displayDate = () => {
        const date = moment(homework.deadline);
        
        return date.utc().format("DD/MM/YYYY")
    }

    const markComplete = async () => {
        try {
            setCompleted(previousState => !previousState)

            await homeworkAPI.put(`/${homeworkID}/completed`, {
                state: submissions.completed
            });
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const removeSubmission = async () => {
        try {
            const temp = submissions.submission;

            setSubmissions(previousState => ({...previousState, submission: ""}));

            await homeworkAPI.put(`/${homeworkID}/submissions?type=delete`);

            await fileAPI.put('/remove', {file: temp});
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const deleteHomework = async () => {
        try {
            await homeworkAPI.delete(`/${homeworkID}`)

            history.replace(`/class/${classID}`)
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: "/"}, `Class ${homework.class_code}`]} />
                    {currentUser.position !== "school" &&
                        <div className="toolbar">
                            {currentUser.position === "student" &&
                                <>
                                    {completed ?
                                        <button disabled={expired} onClick={() => {markComplete()}}>Mark Incomplete</button>
                                    :
                                        <button disabled={expired} onClick={() => {markComplete()}}>Mark Complete</button>
                                    }
                                    <button disabled={expired} onClick={() => {setAdjustSubmission(true)}}>Add Submission</button>
                                </>
                            }
                            {currentUser.position === "teacher" &&
                                <>
                                    <Link to={`edit-homework/${homeworkID}`}>Edit Homework</Link>
                                    <button onClick={() => {deleteHomework()}}>Delete Homework</button>
                                </>
                            }
                        </div>
                    }
                    <div className="innerBody">
                        <p>{homework.class}</p>
                        <p>{homework.subject}</p>
                        <p>{homework.title}</p>
                        <p>{homework.description}</p>
                        <p>{displayDate()}</p>
                        {homework.file !== "" &&
                            <a href={`http://localhost:5000/uploads/${homework.file}`} download={homework.file} target="_blank">View Attachment</a>
                        }
                        {currentUser.position !== "student" ?
                            <>
                                {submissions && submissions.map((submission, i) => {
                                    return (
                                        <div key={i}>
                                            {submission.submission !== "" ?
                                                <div>
                                                    <p>{submission.submission}</p>
                                                </div>
                                            :
                                                <div>
                                                    <p>No submission</p>
                                                </div>
                                            }
                                        </div>
                                    )
                                })}
                            </>
                        :
                            <>
                                {submissions.submission !== "" ?
                                    <>
                                        <p>{submissions.submission}</p>
                                        <button onClick={() => {removeSubmission()}}>Remove Submission</button>
                                    </>
                                :
                                    <>
                                        <p>No submission</p>
                                    </>
                                }
                            </>
                        }
                        {adjustSubmission &&
                            <>
                                <form method="POST" onSubmit={uploadFile} encType="multipart/form-data">
                                    <div>
                                        <input className="fileInput" type="file" name="uploadedFile" onChange={e => {setSubmissionFile(e.target.files[0])}} />
                                    </div>
                                    <div>
                                        <input className="pictureUpload text4" type="submit" value="Upload file" />
                                        <button type="button" className="pictureRemove text4" onClick={() => {removeFile()}}>Remove File</button>
                                    </div>
                                </form>
                                <button onClick={() => {setAdjustSubmission(false)}}>Cancel</button>
                            </>
                        }
                    </div>
                    {displayAddedMessage && <MessageCard message={"Added"} />}
                    {displayErrorMessage && <MessageCard message={error} />}
                </>
            }
        </>
    )
}

export default Homework
