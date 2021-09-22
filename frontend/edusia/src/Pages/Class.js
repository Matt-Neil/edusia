import React, {useState, useEffect} from 'react'
import { Link, useParams } from 'react-router-dom';
import usersAPI from "../API/users"
import classesAPI from "../API/classes"
import homeworkAPI from "../API/homework"
import testsAPI from "../API/tests"

const Class = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [classes, setClasses] = useState();
    const [students, setStudents] = useState();
    const [tests, setTests] = useState();
    const [homework, setHomework] = useState();
    const [displayStudents, setDisplayStudents] = useState(true);
    const [displayHomework, setDisplayHomework] = useState(false);
    const [displayTests, setDisplayTests] = useState(false);
    const [finishedHomework, setFinishedHomework] = useState(false);
    const [finishedTests, setFinishedTests] = useState(false);
    const classID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classes = await classesAPI.get(`/${classID}`);
                const students = await usersAPI.get(`/students/${classID}/lesson`);
                const tests = await testsAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z`);
                const homework = await homeworkAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z`);

                if (homework.data.data.length < 10) {
                    setFinishedHomework(true);
                }

                if (tests.data.data.length < 10) {
                    setFinishedTests(true);
                }

                setClasses(classes.data.data);
                setStudents(students.data.data);
                setTests(tests.data.data);
                setHomework(homework.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData()
    }, [])

    const loadMoreTests = async () => {
        if (tests.length !== 0 && !finishedTests) {
            try {
                const loadTests = await testsAPI.get(`/${classID}/class?date=${tests[tests.length-1].date}`);

                if (loadTests.data.data.length < 10) {
                    setFinishedTests(true);
                }
    
                setTests(testsPrevious => [...testsPrevious, ...loadTests.data.data]);
            } catch (err) {}
        }
    }

    const loadMoreHomework = async () => {
        if (homework.length !== 0 && !finishedHomework) {
            try {
                const loadHomework = await homeworkAPI.get(`/${classID}/class?date=${homework[homework.length-1].deadline}`);

                if (loadHomework.data.data.length < 10) {
                    setFinishedHomework(true);
                }
    
                setHomework(homeworkPrevious => [...homeworkPrevious, ...loadHomework.data.data]);
            } catch (err) {}
        }
    }

    const changeStudents = () => {
        setDisplayStudents(true);
        setDisplayHomework(false);
        setDisplayTests(false);
    }

    const changeHomework = () => {
        setDisplayStudents(false);
        setDisplayHomework(true);
        setDisplayTests(false);
    }

    const changeTests = () => {
        setDisplayStudents(false);
        setDisplayHomework(false);
        setDisplayTests(true);
    }

    return (
        <>
            {loaded &&
                <>
                    {currentUser.position === "teacher" &&
                        <div className="toolbar">
                            <button onClick={() => {changeStudents()}}>View Students</button>
                            <button onClick={() => {changeHomework()}}>View Homework</button>
                            <button onClick={() => {changeTests()}}>View Tests</button>
                        </div>
                    }
                    {currentUser.position === "school" &&
                        <div className="toolbar">
                            <button onClick={() => {changeStudents()}}>View Students</button>
                            <button onClick={() => {changeHomework()}}>View Homework</button>
                            <button onClick={() => {changeTests()}}>View Tests</button>
                            <Link to={`/home/${classID}/edit-class`}>Edit Class</Link>
                        </div>
                    }
                    {displayStudents &&
                        <>
                            {students && students.map((student, i) => {
                                return (
                                    <div key={i}>
                                        <p>{student.name}</p>
                                    </div>
                                )
                            })}
                        </>
                    }
                    {displayHomework &&
                        <>
                            {homework && homework.map((homework, i) => {
                                return (
                                    <div key={i}>
                                        <p>{homework.title}</p>
                                    </div>
                                )
                            })}
                            <div className="finished">
                                {!finishedHomework &&
                                    <p className="loadMore text4" onClick={() => {loadMoreHomework()}}>Load more</p>
                                }
                            </div>
                        </>
                    }
                    {displayTests &&
                        <>
                            {tests && tests.map((test, i) => {
                                return (
                                    <div key={i}>
                                        <p>{test.title}</p>
                                    </div>
                                )
                            })}
                            <div className="finished">
                                {!finishedTests &&
                                    <p className="loadMore text4" onClick={() => {loadMoreTests()}}>Load more</p>
                                }
                            </div>
                        </>
                    }
                </>
            }      
        </>   
    )
}

export default Class
