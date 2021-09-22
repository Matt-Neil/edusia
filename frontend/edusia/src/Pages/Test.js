import React, {useState, useEffect} from 'react'
import { useParams } from 'react-router-dom';
import testsAPI from "../API/tests"

const Test = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [students, setStudents] = useState();
    const [edit, setEdit] = useState();
    const [grades, setGrades] = useState();
    const [test, setTest] = useState();
    const classID = useParams().class;
    const testID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await testsAPI.get(`/${testID}?class=${classID}`)

                for (let i = 0; i < response.data.data.students.length; i++) {
                    setGrades(previousState => Object.assign([], previousState, {[i]: response.data.data.students[i].grade}))
                }

                setEdit(new Array(response.data.data.students.length).fill(false));
                setStudents(response.data.data.students);
                setTest(response.data.data.test);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData()
    }, [])

    const updateGrades = async () => {
        for (let i = 0; i < grades.length; i++) {
            if (grades[i] !== students[i].grade) {
                if (grades[i] === "") {
                    grades[i] = null;
                }
                try {
                    await testsAPI.put(`${testID}/grade`,
                        {
                            grade: grades[i],
                            student: students[i].id
                        }
                    )
                } catch (err) {}
            }
        }
    }

    return (
        <>
            {loaded &&
                <>
                    {students.map((student, i) => {
                        return (
                            <div key={i}>
                                <p>{student.name}</p>
                                {currentUser.position === "school" &&
                                    <>
                                        {student.grade ?
                                            <p>{student.grade}</p>  
                                        :
                                            <p>No Grade</p>  
                                        }
                                    </>
                                }
                                {currentUser.position === "teacher" &&
                                    <>
                                        {edit[i] ?
                                            <>
                                                <form className="loginBody" method="PUT" onSubmit={updateGrades}>
                                                    <div className="multipleInput">
                                                        <input className="textInputLogin text5" type="text" name="grade" placeholder="Grade" value={grades[i]} onChange={e => {setGrades(previousState => Object.assign([], previousState, {[i]: e.target.value}))}} />
                                                    </div>
                                                    <div className="formSubmit">
                                                        <input className="loginButton text4" type="submit" value="Update" />
                                                    </div>
                                                </form>
                                                <button onClick={() => {setEdit(previousState => Object.assign([], previousState, {[i]: false}))}}>Cancel</button>
                                            </>
                                        :
                                            <>
                                                {student.grade ?
                                                    <p>{student.grade}</p>  
                                                :
                                                    <p>No Grade</p>  
                                                }
                                                <button onClick={() => {setEdit(previousState => Object.assign([], previousState, {[i]: true}))}}>Edit Grade</button>
                                            </>
                                        }
                                    </>
                                }
                            </div>
                        )
                    })}
                </>
            }
        </>   
    )
}

export default Test
