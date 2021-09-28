import React, {useState, useEffect, useRef, useContext} from 'react'
import homeworkAPI from "../API/homework"
import fileAPI from "../API/file"
import { useParams, useHistory } from 'react-router-dom';
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import MessageCard from '../Components/MessageCard'
import EditHomework from '../Components/EditHomework';
import UserCard from '../Components/UserCard';
const moment = require('moment');

const Homework = ({currentUser}) => {
    const [expired, setExpired] = useState(false);
    const [completed, setCompleted] = useState();
    const [homework, setHomework] = useState();
    const [submissions, setSubmissions] = useState();
    const [adjustSubmission, setAdjustSubmission] = useState(false);
    const [submissionFile, setSubmissionFile] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [edit, setEdit] = useState(false);
    const timeoutID = useRef(null);
    const homeworkID = useParams().id;
    const classID = useParams().class;
    const history = useHistory();
    const {displayAddedMessage, displayErrorMessage, displayMessageAddedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        fetchData();
    }, [])

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

    const cancelEdit = () => {
        fetchData()
        setEdit(false)
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: "/"}, {text: `Class: ${homework.class_code}`, link: `/class/${classID}`}, `Homework: ${homework.title}`]} />
                    {currentUser.position !== "school" && !expired &&
                        <div className="toolbar">
                            {currentUser.position === "student" &&
                                <>
                                    {completed ?
                                        <button className="buttonOrange toolbarItem" onClick={() => {markComplete()}}>Mark Incomplete</button>
                                    :
                                        <button className="buttonBlue toolbarItem" onClick={() => {markComplete()}}>Mark Complete</button>
                                    }
                                    <button className="buttonBlue toolbarItem" onClick={() => {setAdjustSubmission(true)}}>Add Submission</button>
                                </>
                            }
                            {currentUser.position === "teacher" &&
                                <>
                                    {edit ?
                                        <button className="buttonOrange toolbarItem" onClick={() => {cancelEdit()}}>Cancel</button>
                                    :
                                        <button className="buttonBlue toolbarItem" onClick={() => {setEdit(true)}}>Edit Homework</button>
                                    }
                                    <button className="buttonOrange toolbarItem" onClick={() => {deleteHomework()}}>Delete Homework</button>
                                </>
                            }
                        </div>
                    }
                    <div className="innerBody">
                        {edit ?
                            <EditHomework homework={homework} />
                        :
                            <>
                                {currentUser.position === "student" &&
                                    <div style={{display: 'flex', alignItems: "center", margin: "0 0 30px 0"}}>
                                        <p className="pageTitle" style={{margin: "15px 15px 0 0"}}>{homework.subject}</p>
                                        <p className="pageTitle">({homework.class_code})</p>
                                    </div>
                                }
                                <p className="homeworkTitle">{homework.title}</p>
                                <p>Due: {displayDate()}</p>
                                <p style={{margin: "50px 0 50px 0"}}>{homework.description}</p>
                                {homework.file !== "" &&
                                    <a style={{margin: "25px 0 50px 0"}} className="download" href={`http://localhost:5000/uploads/${homework.file}`} download={homework.file} target="_blank">View Attachment</a>
                                }
                                {currentUser.position !== "student" ?
                                    <>
                                        {submissions && submissions.map((submission, i) => {
                                            return (
                                                <div key={i}>
                                                    {submission.submission !== "" ?
                                                        <div className="cardPair">
                                                            <UserCard user={submission} />
                                                            <a style={{margin: "25px 0 50px 0"}} className="download" href={`http://localhost:5000/uploads/${submission.submission}`} download={submission.submission} target="_blank">View Submission</a>
                                                        </div>
                                                    :
                                                        <div className="cardPair">
                                                            <UserCard user={submission} />
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
                                                <a style={{margin: "25px 15px 50px 0"}} className="download" href={`http://localhost:5000/uploads/${submissions.submission}`} download={submissions.submission} target="_blank">View Submission</a>
                                                <button className="buttonOrange" onClick={() => {removeSubmission()}}>Remove Submission</button>
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
                                        <form style={{margin: "25px 0 0 0"}} method="POST" onSubmit={uploadFile} encType="multipart/form-data">
                                            <div>
                                                <input className="fileInput" type="file" name="uploadedFile" onChange={e => {setSubmissionFile(e.target.files[0])}} />
                                            </div>
                                            <div className="formSubmit">
                                                <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Upload file" />
                                                <button className="buttonOrange" type="button" onClick={() => {removeFile()}}>Remove File</button>
                                            </div>
                                        </form>
                                        <button style={{margin: "25px 0 0 0"}} className="buttonOrange" onClick={() => {setAdjustSubmission(false)}}>Cancel</button>
                                    </>
                                }
                            </>
                        }
                        {displayAddedMessage && <MessageCard message={"Added"} />}
                        {displayErrorMessage && <MessageCard message={error} />}
                    </div>
                </>
            }
        </>
    )
}

export default Homework
