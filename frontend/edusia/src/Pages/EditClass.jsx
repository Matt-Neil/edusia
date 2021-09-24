import React, {useState, useEffect, useContext} from 'react'
import { Link, useParams } from 'react-router-dom'
import classesAPI from "../API/classes"
import searchAPI from "../API/search"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';

const EditClass = ({currentUser}) => {
    const [classes, setClasses] = useState();
    const [loaded, setLoaded] = useState(false);
    const [teacher_id, setTeacher_id] = useState("");
    const [subject, setSubject] = useState("");
    const [class_code, setClass_code] = useState("");
    const [searchTeacher, setSearchTeacher] = useState("");
    const [searchStudent, setSearchStudent] = useState("");
    const [teachersResults, setTeachersResults] = useState([]);
    const [studentsResults, setStudentsResults] = useState([]);
    const [students, setStudents] = useState([]);
    const classID = useParams().id;
    const {displayUpdatedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await classesAPI.get(`/${classID}`);
    
                setClasses(response.data.data);
                setLoaded(true);
            } catch (err) {
                displayMessageErrorInterval("Error Loading Page")
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (loaded) {
            setTeacher_id(classes.teacher_id);
            setSubject(classes.Subject);
            setClass_code(classes.class_code);
            setStudents(classes.students);
        }
    }, [loaded])

    const addClass = async (e) => {
        e.preventDefault();

        if (teacher_id === "" || subject === "" || class_code === "" || students === []) {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await classesAPI.post(`/${currentUser.id}`, 
                {
                    subject: subject,
                    teacher_id: teacher_id,
                    class_code: class_code,
                    students: students,
                    school_id: currentUser.id
                });

                displayMessageUpdatedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    const appendStudent = (student) => {
        setStudents(studentsPrevious => [...studentsPrevious, student]);
    }

    const removeStudent = (student) => {
        setStudents(students.filter(item => item !== student));
    }

    const searchTeachers = async () => {
        const results = await searchAPI.get(`/${currentUser.id}/teachers?phrase=${searchTeacher}`);

        setTeachersResults(results.data.data);
    }

    const searchStudents = async () => {
        const results = await searchAPI.get(`/${currentUser.id}/students?phrase=${searchStudent}`);

        setStudentsResults(results.data.data);
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: ""}, {text: `Class ${classes.class_code}`, link: `/class/${classID}`}, "Edit Class"]} />
                    <div className="toolbar">
                        <Link to={`/home/add-student`}>Add Student</Link>
                        <Link to={`/home/add-teacher`}>Add Teacher</Link>
                        <Link to={`/home/add-class`}>Add Class</Link>
                        <Link to={`/home`}>Return Home</Link>
                    </div>
                    <form className="loginBody" method="POST" onSubmit={addClass}>
                        <div className="multipleInput">
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Subject" value={subject} onChange={e => {setSubject(e.target.value)}} />
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Class Code" value={class_code} onChange={e => {setClass_code(e.target.value)}} />
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Search Teacher" value={searchTeacher} onChange={e => {setSearchTeacher(e.target.value)}} />
                            <button type="button" onClick={() => {searchTeachers()}}>Search</button>
                            {teachersResults && teachersResults.map((results, i) => {
                                return (
                                    <div key={i}>
                                        <p>{results.name}</p>
                                        <button type="button" onClick={() => {setTeacher_id(results.id)}}>Add</button>
                                    </div>
                                )
                            })}
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Search Student" value={searchStudent} onChange={e => {setSearchStudent(e.target.value)}} />
                            <button type="button" onClick={() => {searchStudents()}}>Search</button>
                            {studentsResults && studentsResults.map((results, i) => {
                                return (
                                    <div key={i}>
                                        <p>{results.name}</p>
                                        <button type="button" onClick={() => {appendStudent(results.id)}}>Add</button>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="formSubmit">
                            <input className="loginButton text4" type="submit" value={`Add Class`} />
                        </div>
                    </form>
                    <p>{"Teacher: " + teacher_id}</p>
                    {students && students.map((student, i) => {
                        return (
                            <div key={i}>
                                <p>{student}</p>
                                <button type="button" onClick={() => {removeStudent(student)}}>Remove</button>
                            </div>
                        )
                    })}
                    {displayUpdatedMessage && <p>Updated</p>}
                    {displayErrorMessage && <p>{error}</p>}
                </>
            }
        </>
    )
}

export default EditClass
