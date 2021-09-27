import React, {useState, useEffect, useContext} from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import classesAPI from "../API/classes"
import usersAPI from '../API/users'
import searchAPI from "../API/search"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import MessageCard from '../Components/MessageCard'

const EditClass = ({currentUser}) => {
    const [classes, setClasses] = useState();
    const [loaded, setLoaded] = useState(false);
    const [teacher_id, setTeacher_id] = useState("");
    const [teacherName, setTeacherName] = useState("");
    const [subject, setSubject] = useState("");
    const [class_code, setClass_code] = useState("");
    const [searchTeacher, setSearchTeacher] = useState("");
    const [searchStudent, setSearchStudent] = useState("");
    const [teachersResults, setTeachersResults] = useState([]);
    const [studentsResults, setStudentsResults] = useState([]);
    const [students, setStudents] = useState([]);
    const classID = useParams().id;
    const {displayUpdatedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);
    const history = useHistory()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classes = await classesAPI.get(`/${classID}`);
                const students = await usersAPI.get(`/students/${classID}/lesson`);

                if (classes.data.data) {
                    setClasses(classes.data.data);
                    setStudents(students.data.data)
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
            setTeacherName(`${classes.name} (${classes.username})`);
            setTeacher_id(classes.teacher_id);
            setSubject(classes.subject);
            setClass_code(classes.class_code);
        }
    }, [loaded])

    const editClass = async (e) => {
        e.preventDefault();

        if (teacher_id === "" || subject === "" || class_code === "" || students === []) {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await classesAPI.put(`/${classID}`, 
                {
                    subject: subject,
                    teacher_id: teacher_id,
                    class_code: class_code
                });

                displayMessageUpdatedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    const appendStudent = async (student) => {
        try {
            if (students.some(value => value.id === student.id)) {
                displayMessageErrorInterval("Student Already in Class")
            } else {
                await classesAPI.post(`/${classID}/school`, {
                    student: student.id
                })
    
                setStudents(studentsPrevious => [...studentsPrevious, student]);
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const removeStudent = async (id) => {
        try {
            await classesAPI.delete(`/${classID}/school?student=${id}`)

            setStudents(students.filter((item) => item.id !== id));
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const addTeacher = (results) => {
        setTeacherName(`${results.name} (${results.username})`);
        setTeacher_id(results.id);
    }

    const searchTeachers = async () => {
        const results = await searchAPI.get(`/${currentUser.id}/teachers?phrase=${searchTeacher}`);

        setTeachersResults(results.data.data);
    }

    const searchStudents = async () => {
        const results = await searchAPI.get(`/${currentUser.id}/students?phrase=${searchStudent}`);

        setStudentsResults(results.data.data);
    }

    const deleteClass = async () => {
        try {
            await classesAPI.delete(`/${classID}`)

            history.replace("/home")
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: "/"}, `Edit Class ${classes.class_code}`]} />
                    <div className="toolbar">
                        <Link to={`/home/add-student`}>Add Student</Link>
                        <Link to={`/home/add-teacher`}>Add Teacher</Link>
                        <Link to={`/home/add-class`}>Add Class</Link>
                        <Link to={`/class/${classID}`}>Cancel Edit</Link>
                        <button onClick={() => {deleteClass()}}>Delete Class</button>
                    </div>
                    <form className="loginBody" method="POST" onSubmit={editClass}>
                        <div className="multipleInput">
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Subject" value={subject} onChange={e => {setSubject(e.target.value)}} />
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Class Code" value={class_code} onChange={e => {setClass_code(e.target.value)}} />
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Search Teacher" value={searchTeacher} onChange={e => {setSearchTeacher(e.target.value)}} />
                            <button type="button" onClick={() => {searchTeachers()}}>Search</button>
                            {teachersResults && teachersResults.map((results, i) => {
                                return (
                                    <div key={i}>
                                        <p>{results.name}</p>
                                        <button type="button" onClick={() => {addTeacher(results)}}>Add</button>
                                    </div>
                                )
                            })}
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Search Student" value={searchStudent} onChange={e => {setSearchStudent(e.target.value)}} />
                            <button type="button" onClick={() => {searchStudents()}}>Search</button>
                            {studentsResults && studentsResults.map((results, i) => {
                                return (
                                    <div key={i}>
                                        <p>{results.name}</p>
                                        <button type="button" onClick={() => {appendStudent(results)}}>Add</button>
                                    </div>
                                )
                            })}
                            <p>{`Teacher: ${teacherName}`}</p>
                        </div>
                        <div className="formSubmit">
                            <input className="loginButton text4" type="submit" value={`Update Class`} />
                        </div>
                    </form>
                    {students && students.map((student, i) => {
                        return (
                            <div key={i}>
                                <p>{student.name}</p>
                                <button type="button" onClick={() => {removeStudent(student.id)}}>Remove</button>
                            </div>
                        )
                    })}
                    {displayUpdatedMessage && <MessageCard message={"Updated"} />}
                    {displayErrorMessage && <MessageCard message={error} />}
                </>
            }
        </>
    )
}

export default EditClass
