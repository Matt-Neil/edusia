import React, {useState, useEffect} from 'react'
import homeworkAPI from "../API/homework"
import fileAPI from "../API/file"
import { useParams } from 'react-router-dom';
const moment = require('moment');

const Homework = ({currentUser}) => {
    const [expired, setExpired] = useState(true);
    const [completed, setCompleted] = useState();
    const [homework, setHomework] = useState();
    const [submissions, setSubmissions] = useState();
    const [adjustSubmission, setAdjustSubmission] = useState(false);
    const [submissionFile, setSubmissionFile] = useState("");
    const [loaded, setLoaded] = useState(false);
    const homeworkID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const homework = await homeworkAPI.get(`/${homeworkID}`);
                const submissions = await homeworkAPI.get(`/${homeworkID}/submissions`);

                setHomework(homework.data.data);
                setSubmissions(submissions.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (loaded) {
            if (homework.deadline > new Date().toISOString()) {
                setExpired(false);
            }
            setCompleted(submissions.completed);
        }
    }, [loaded])

    const uploadFile = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('uploadedFile', submissionFile);

        try {
            const uploadResponse = await fileAPI.post("/upload", formData);
            
            setSubmissions(previousState => ({...previousState, submission: uploadResponse.data.data}));

            await homeworkAPI.put(`/${homeworkID}/submissions?type=add`, {
                file: uploadResponse.data.data
            });

            if (submissions.submission !== "") {
                await fileAPI.put('/remove', {file: submissions.submission});
            }
        } catch (err) {}
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
        } catch (err) {}
    }

    const displayDate = () => {
        const date = moment(homework.deadline);
        
        return date.utc().format("HH:mm DD/MM/YYYY")
    }

    const markComplete = async () => {
        try {
            await homeworkAPI.put(`/${homeworkID}/completed`, {
                state: submissions.completed
            });

            setCompleted(previousState => !previousState)
        } catch (err) {}
    }

    const removeSubmission = async () => {
        try {
            const temp = submissions.submission;

            setSubmissions(previousState => ({...previousState, submission: ""}));

            await homeworkAPI.put(`/${homeworkID}/submissions?type=delete`);

            await fileAPI.put('/remove', {file: temp});
        } catch (err) {}
    }

    return (
        <>
            {loaded &&
                <>
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
                                <button>Edit Homework</button>
                                <button>Delete Homework</button>
                            </>
                        }
                    </div>
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
                                        <>
                                            {submission.submission !== "" ?
                                                <div key={i}>
                                                    <p>{submission.submission}</p>
                                                </div>
                                            :
                                                <div key={i}>
                                                    <p>No submission</p>
                                                </div>
                                            }
                                        </>
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
                </>
            }
        </>
    )
}

export default Homework
