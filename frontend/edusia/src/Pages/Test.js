import React, {useState, useEffect, useContext} from 'react'
import { useHistory, useParams } from 'react-router-dom';
import testsAPI from "../API/tests"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import MessageCard from '../Components/MessageCard'
import StudentCard from '../Components/StudentCard'

const Test = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [students, setStudents] = useState();
    const [edit, setEdit] = useState([]);
    const [updateGrades, setUpdateGrades] = useState([]);
    const [grades, setGrades] = useState([]);
    const [test, setTest] = useState();
    const classID = useParams().class;
    const testID = useParams().id;
    const {displayUpdatedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);
    const history = useHistory()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (currentUser.position === "student") {
                    history.replace("/home");
                } else {
                    const test = await testsAPI.get(`/${testID}?class=${classID}`)

                    if (test.data.data) {
                        for (let i = 0; i < test.data.data.students.length; i++) {
                            setGrades(previousState => Object.assign([], previousState, {[i]: test.data.data.students[i].grade}))
                        }

                        for (let i = 0; i < test.data.data.students.length; i++) {
                            setUpdateGrades(previousState => Object.assign([], previousState, {[i]: test.data.data.students[i].grade}))
                        }

                        setEdit(new Array(test.data.data.students.length).fill(false));
                        setStudents(test.data.data.students);
                        setTest(test.data.data.test);
                        setLoaded(true);
                    } else {
                        history.replace("/home");
                    }
                }
            } catch (err) {
                displayMessageErrorInterval("Error Loading Page")
            }
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
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const cancelGrade = (i) => {
        setUpdateGrades(previousState => Object.assign([], previousState, {[i]: grades[i]}))
        setEdit(previousState => Object.assign([], previousState, {[i]: false}))
    }
    
    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: "/"}, {text: `Class: ${test.class_code}`, link: `/class/${classID}`}, `Test: ${test.title}`]} />
                    <div className="innerBody">
                        <p className="pageTitle">Test Results</p>
                        {students.map((student, i) => {
                            return (
                                <div className="cardPair" key={i}>
                                    <StudentCard user={student} classID={classID} />
                                    {edit[i] ?
                                        <>
                                            <form method="PUT" onSubmit={updateGrade} id={i}>
                                                <input style={{margin: "15px 15px 15px 0"}} className="textInput" type="text" name="grade" placeholder="Grade" value={updateGrades[i]} onChange={e => {setUpdateGrades(previousState => Object.assign([], previousState, {[i]: e.target.value}))}} />
                                                <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Update" />
                                                <button className="buttonOrange" onClick={() => {cancelGrade(i)}}>Cancel</button>
                                            </form>
                                        </>
                                    :
                                        <div className="cardPair">
                                            {grades[i] ?
                                                <p>Grade: {grades[i]}</p>  
                                            :
                                                <p>No Grade</p>  
                                            }
                                            {currentUser.id === test.teacher_id && <button style={{margin: "0 0 0 15px"}} className="buttonBlue" onClick={() => {setEdit(previousState => Object.assign([], previousState, {[i]: true}))}}>Update Grade</button>}
                                        </div>
                                    }
                                </div>
                            )
                        })}
                        {displayUpdatedMessage && <MessageCard message={"Updated"} />}
                        {displayErrorMessage && <MessageCard message={error} />}
                    </div>
                </>
            }
        </>   
    )
}

export default Test
