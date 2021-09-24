import React, {useState, useEffect, useContext} from 'react'
import { useParams } from 'react-router-dom';
import testsAPI from "../API/tests"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';

const Test = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [students, setStudents] = useState();
    const [edit, setEdit] = useState([]);
    const [updateGrades, setUpdateGrades] = useState([]);
    const [grades, setGrades] = useState([]);
    const [test, setTest] = useState();
    const classID = useParams().class;
    const testID = useParams().id;
    const {displayUpdatedMessage, displayMessageUpdatedInterval} = useContext(MessageContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await testsAPI.get(`/${testID}?class=${classID}`)

                for (let i = 0; i < response.data.data.students.length; i++) {
                    setGrades(previousState => Object.assign([], previousState, {[i]: response.data.data.students[i].grade}))
                }

                for (let i = 0; i < response.data.data.students.length; i++) {
                    setUpdateGrades(previousState => Object.assign([], previousState, {[i]: response.data.data.students[i].grade}))
                }

                setEdit(new Array(response.data.data.students.length).fill(false));
                setStudents(response.data.data.students);
                setTest(response.data.data.test);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData()
    }, [])

    const updateGrade = async (e) => {
        e.preventDefault();

        try {
            if (updateGrades[e.target.id] === "") {
                updateGrades[e.target.id] = null;
            }

            await testsAPI.put(`${testID}/grade`,
                {
                    grade: updateGrades[e.target.id],
                    student: students[e.target.id].id
                }
            )

            setGrades(previousState => Object.assign([], previousState, {[e.target.id]: updateGrades[e.target.id]}));
            setEdit(previousState => Object.assign([], previousState, {[e.target.id]: false}));
            displayMessageUpdatedInterval();
        } catch (err) {}
    }

    const cancelGrade = (i) => {
        setUpdateGrades(previousState => Object.assign([], previousState, {[i]: grades[i]}))
        setEdit(previousState => Object.assign([], previousState, {[i]: false}))
    }
    
    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: ""}, {text: `Class ${test.class_code}`, link: `/class/${classID}`}, test.title]} />
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
                                                <form className="loginBody" method="PUT" onSubmit={updateGrade} id={i}>
                                                    <div className="multipleInput">
                                                        <input className="textInputLogin text5" type="text" name="grade" placeholder="Grade" value={updateGrades[i]} onChange={e => {setUpdateGrades(previousState => Object.assign([], previousState, {[i]: e.target.value}))}} />
                                                    </div>
                                                    <div className="formSubmit">
                                                        <input className="loginButton text4" type="submit" value="Update" />
                                                    </div>
                                                </form>
                                                <button onClick={() => {cancelGrade(i)}}>Cancel</button>
                                            </>
                                        :
                                            <>
                                                {grades[i] ?
                                                    <p>{grades[i]}</p>  
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
                    {displayUpdatedMessage && <p>Updated</p>}
                </>
            }
        </>   
    )
}

export default Test
