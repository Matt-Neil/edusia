import React, {useState, useContext} from 'react'
import classesAPI from "../API/classes"
import searchAPI from "../API/search"
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from './MessageCard'
import UserCard from './UserCard';

const AddClass = ({currentUser}) => {
    const [teacher, setTeacher] = useState("");
    const [subject, setSubject] = useState("");
    const [class_code, setClass_code] = useState("");
    const [searchTeacher, setSearchTeacher] = useState("");
    const [searchStudent, setSearchStudent] = useState("");
    const [teachersResults, setTeachersResults] = useState([]);
    const [displaySearchTeacher, setDisplaySearchTeacher] = useState(false);
    const [displaySearchStudent, setDisplaySearchStudent] = useState(false);
    const [studentsResults, setStudentsResults] = useState([]);
    const [students, setStudents] = useState([]);
    const {displayAddedMessage, displayMessageAddedInterval, displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    const addClass = async (e) => {
        e.preventDefault();
        
        if (teacher.id === "" || subject === "" || class_code === "" || students === []) {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await classesAPI.post(`/${currentUser.id}`, 
                {
                    subject: subject,
                    teacher_id: teacher.id,
                    class_code: class_code,
                    students: students,
                    school_id: currentUser.id
                });

                setSubject("");
                setTeacher("");
                setClass_code("");
                setStudents([]);
                setSearchStudent("");
                setSearchTeacher("");
                setTeachersResults([]);
                setStudentsResults([]);
                displayMessageAddedInterval();
            } catch (err) {
                displayMessageErrorInterval("Error Loading Page")
            }
        }
    }

    const appendStudent = (student) => {
        setStudents(studentsPrevious => [...studentsPrevious, student]);
    }

    const removeStudent = (student) => {
        setStudents(students.filter(item => item !== student));
    }

    const addTeacher = (results) => {
        setTeacher(results);
    }

    const searchTeachers = async () => {
        const results = await searchAPI.get(`/${currentUser.id}/teachers?phrase=${searchTeacher}`);

        setTeachersResults(results.data.data);
        setDisplaySearchStudent(false)
        setDisplaySearchTeacher(true)
    }

    const searchStudents = async () => {
        const results = await searchAPI.get(`/${currentUser.id}/students?phrase=${searchStudent}`);

        setStudentsResults(results.data.data);
        setDisplaySearchTeacher(false)
        setDisplaySearchStudent(true)
    }

    return (
        <>
            <form method="POST" onSubmit={addClass}>
                <input className="textInput" type="text" name="teacher" placeholder="Search Teachers" value={searchTeacher} onChange={e => {setSearchTeacher(e.target.value)}} />
                <button style={{margin: "0 25px 0 15px"}} className="buttonBlue" type="button" onClick={() => {searchTeachers()}}>Search</button>
                <input className="textInput" type="text" name="student" placeholder="Search Students" value={searchStudent} onChange={e => {setSearchStudent(e.target.value)}} />
                <button style={{margin: "0 0  0 15px"}} className="buttonBlue" type="button" onClick={() => {searchStudents()}}>Search</button>
                <div className="form">
                    <input style={{margin: "25px 0 0 0"}} className="textInput" type="text" name="subject" placeholder="Subject" value={subject} onChange={e => {setSubject(e.target.value)}} />
                    <input className="textInput" type="text" name="class_code" placeholder="Class Code" value={class_code} onChange={e => {setClass_code(e.target.value)}} />
                </div>
                <p style={{margin: "15px 0 0 0"}} className="pageTitle">Search Results:</p>
                {displaySearchTeacher && teachersResults && teachersResults.map((results, i) => {
                    return (
                        <div className="cardPair" key={i}>
                            <UserCard user={results} />
                            <button className="buttonBlue" type="button" onClick={() => {addTeacher(results)}}>Add</button>
                        </div>
                    )
                })}
                {displaySearchStudent && studentsResults && studentsResults.map((results, i) => {
                    return (
                        <div className="cardPair" key={i}>
                            <UserCard user={results} />
                            <button className="buttonBlue" type="button" onClick={() => {appendStudent(results)}}>Add</button>
                        </div>
                    )
                })}
                <p style={{margin: "40px 0 0 0"}} className="pageTitle">Class Teacher:</p>
                {teacher ?
                    <UserCard user={teacher} />
                :
                    <p>No Teacher Selected</p>
                }
                <p style={{margin: "40px 0 0 0"}} className="pageTitle">Students:</p>
                {students.length === 0 ?
                    <p>No Students Selected</p>
                :
                    <>
                        {students && students.map((student, i) => {
                            return (
                                <div className="cardPair" key={i}>
                                    <UserCard user={student} />
                                    <button className="buttonOrange" type="button" onClick={() => {removeStudent(student)}}>Remove</button>
                                </div>
                            )
                        })}
                    </>
                }
                <div style={{margin: "40px 0 0 0"}} className="formSubmit">
                    <input className="buttonBlue" type="submit" value={`Add Class`} />
                </div>
            </form>
            {displayAddedMessage && <MessageCard message={"Added"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default AddClass
