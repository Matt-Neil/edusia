import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import homeworkAPI from "../API/homework"
import classesAPI from "../API/classes"
import usersAPI from "../API/users"
import searchAPI from "../API/search"
import HomeworkCard from '../Components/HomeworkCard'
import UserCard from '../Components/UserCard'
import ClassCard from "../Components/ClassCard"
import { CompletedContext } from '../Contexts/completedContext';
import { ExpiredContext } from '../Contexts/expiredContext';

const Home = ({currentUser}) => {
    const [homework, setHomework] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchPhrase, setSearchPhrase] = useState("");
    const [displaySearch, setDisplaySearch] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [options, setOptions] = useState("students");
    const [finishedHomework, setFinishedHomework] = useState(false);
    const [finishedSearch, setFinishedSearch] = useState(false);
    const [finishedStudents, setFinishedStudents] = useState(false);
    const [finishedTeachers, setFinishedTeachers] = useState(false);
    const [finishedClasses, setFinishedClasses] = useState(false);
    const {completed, changeCompleted} = useContext(CompletedContext);
    const {expired, changeExpired} = useContext(ExpiredContext);

    useEffect(() => {
        const fetchData = async () => {
            switch (currentUser.position) {
                case "student":
                    const homework = await homeworkAPI.get("/student?date=2020-01-01T00:15:00.000Z");

                    if (homework.data.data.length < 10) {
                        setFinishedHomework(true);
                    }

                    setHomework(homework.data.data);
                    setLoaded(true);
                    break;
                case "teacher":
                    try {
                        const classes = await classesAPI.get(`/${currentUser.id}/teacher`);
            
                        setClasses(classes.data.data);
                        setLoaded(true);
                    } catch (err) {}
                    break;
                case "school":
                    try {
                        const classes = await classesAPI.get(`/${currentUser.id}/school`);
                        const teachers = await usersAPI.get(`/teachers/${currentUser.id}/school`);
                        const students = await usersAPI.get(`/students/${currentUser.id}/school`);

                        if (classes.data.data.length < 10) {
                            setFinishedClasses(true);
                        }

                        if (teachers.data.data.length < 10) {
                            setFinishedTeachers(true);
                        }

                        if (students.data.data.length < 10) {
                            setFinishedStudents(true);
                        }
            
                        setClasses(classes.data.data);
                        setTeachers(teachers.data.data);
                        setStudents(students.data.data);
                        setLoaded(true);
                    } catch (err) {}
                    break;
            }
        }
        fetchData();
    }, [])

    const loadMoreHomework = async () => {
        if (currentUser.position === "student" && homework.length !== 0 && !finishedHomework) {
            try {
                const loadHomework = await homeworkAPI.get(`/student?date=${homework[homework.length-1].deadline}`);

                if (loadHomework.data.data.length < 10) {
                    setFinishedHomework(true);
                }
    
                setHomework(homeworkPrevious => [...homeworkPrevious, ...loadHomework.data.data]);
                setLoaded(true);
            } catch (err) {}
        }
    };

    const loadMoreTeachers = async () => {
        if (currentUser.position === "school" && teachers.length !== 0 && !finishedTeachers) {
            try {
                const loadTeachers = await usersAPI.get(`/teachers/${currentUser.id}/school?id=${teachers[teachers.length-1].id}`);

            if (loadTeachers.data.data.length < 10) {
                setFinishedTeachers(true);
            }

            setTeachers(teachersPrevious => [...teachersPrevious, ...loadTeachers.data.data]);
            } catch (err) {}
        }
    };

    const loadMoreStudents = async () => {
        if (currentUser.position === "school" && students.length !== 0 && !finishedStudents) {
            try {
                const loadStudents = await usersAPI.get(`/students/${currentUser.id}/school?id=${students[students.length-1].id}`);

                if (loadStudents.data.data.length < 10) {
                    setFinishedStudents(true);
                }

                setStudents(studentsPrevious => [...studentsPrevious, ...loadStudents.data.data]);
            } catch (err) {}
        }
    };

    const loadMoreClasses = async () => {
        if (currentUser.position === "school" && classes.length !== 0 && !finishedClasses) {
            try {
                const loadClasses = await classesAPI.get(`/${currentUser.id}/school?id=${classes[classes.length-1].id}`);
    
                if (loadClasses.data.data.length < 10) {
                    setFinishedClasses(true);
                }
    
                setClasses(classesPrevious => [...classesPrevious, ...loadClasses.data.data]);
            } catch (err) {}
        }
    };

    const loadMoreSearch = async () => {
        if (currentUser.position === "school" && searchResults.length !== 0 && !finishedSearch) {
            try {
                const results = await searchAPI.get(`?phrase=${searchPhrase}&type=${options}&id=${searchResults[searchResults.length-1].id}`);
    
                if (results.data.data.length < 10) {
                    setFinishedSearch(true);
                }
    
                setSearchResults(resultsPrevious => [...resultsPrevious, ...results.data.data]);
            } catch (err) {console.log(err)}
        }
    };

    const search = async (e) => {
        e.preventDefault();

        const results = await searchAPI.get(`?phrase=${searchPhrase}&type=${options}`);

        setSearchResults(results.data.data);
        setDisplaySearch(true);
    }
    
    const cancelSearch = () => {
        setDisplaySearch(false);
        setSearchPhrase("");
    }

    const checkDeadline = (deadline) => {
        if (deadline > new Date().toISOString()) {
            return false;
        } else {
            return true;
        }
    }

    return (
        <>
            {loaded &&
                <>
                    {currentUser.position === "student" &&
                        <>
                            <div className="toolbar">
                                <select>All Subjects</select>
                                <select>All Classes</select>
                                <select>Sort by Due Date</select>
                                <button onClick={() => {changeCompleted()}}>Show Completed</button>
                                <button onClick={() => {changeExpired()}}>Show Expired</button>
                            </div>
                            <div className="innerBody">
                                {completed && expired &&
                                    <>
                                        { homework && homework.map((homeworkReducer, i) => {
                                            return <HomeworkCard homeworkReducer={homeworkReducer} key={i} />
                                        })}
                                    </>
                                }
                                {completed && !expired &&
                                    <>
                                        { homework && homework.filter((homeworkFilter) => !checkDeadline(homeworkFilter.deadline)).map((homeworkReducer, i) => {
                                            return <HomeworkCard homeworkReducer={homeworkReducer} key={i} />
                                        })}
                                    </>
                                }
                                {!completed && expired &&
                                    <>
                                        { homework && homework.filter((homeworkFilter) => homeworkFilter.completed === false).map((homeworkReducer, i) => {
                                            return <HomeworkCard homeworkReducer={homeworkReducer} key={i} />
                                        })}
                                    </>
                                }
                                {!completed && !expired &&
                                    <>
                                        { homework && homework.filter((homeworkFilter) => homeworkFilter.completed === false && !checkDeadline(homeworkFilter.deadline)).map((homeworkReducer, i) => {
                                            return <HomeworkCard homeworkReducer={homeworkReducer} key={i} />
                                        })}
                                    </>
                                }
                                <div className="finished">
                                    {!finishedHomework &&
                                        <p className="loadMore text4" onClick={() => {loadMoreHomework()}}>Load more</p>
                                    }
                                </div>
                            </div>
                        </>
                    }
                    {currentUser.position === "teacher" &&
                        <>
                            <div className="innerBody">
                                <div className="userPageRows">
                                    { classes && classes.map((classesReducer, i) => {
                                        return <ClassCard classesReducer={classesReducer} key={i} />
                                    })}
                                </div>
                            </div>
                        </>
                    }
                    {currentUser.position === "school" &&
                        <>
                            <div className="toolbar">
                                <Link to={`/home/add-student`}>Add Student</Link>
                                <Link to={`/home/add-teacher`}>Add Teacher</Link>
                                <Link to={`/home/add-class`}>Add Class</Link>
                                <select onChange={e => {setOptions(e.target.value)}}>
                                    <option value="students">Students</option>
                                    <option value="teachers">Teachers</option>
                                    <option value="classes">Classes</option>
                                </select>
                                <button onClick={() => {cancelSearch()}}>Cancel Search</button>
                                <form className="loginBody" method="POST" onSubmit={search}>
                                    <div className="multipleInput">
                                        <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Search for students, teachers or classes..." value={searchPhrase} onChange={e => {setSearchPhrase(e.target.value)}} />
                                    </div>
                                    <div className="formSubmit">
                                        <input className="loginButton text4" type="submit" value="Search" />
                                    </div>
                                </form>
                            </div>
                            <div className="innerBody">
                                {displaySearch ?
                                    <>
                                        {options === "students" &&
                                            <>
                                                <div className="userPageRows">
                                                    { searchResults && searchResults.map((userReducer, i) => {
                                                        return <UserCard userReducer={userReducer} key={i} />
                                                    })}
                                                </div>
                                                <div className="finished">
                                                    {!finishedSearch &&
                                                        <p className="loadMore text4" onClick={() => {loadMoreSearch()}}>Load more</p>
                                                    }
                                                </div>
                                            </>
                                        }
                                        {options === "teachers" &&
                                            <>
                                                <div className="userPageRows">
                                                    { searchResults && searchResults.map((userReducer, i) => {
                                                        return <UserCard userReducer={userReducer} key={i} />
                                                    })}
                                                </div>
                                                <div className="finished">
                                                    {!finishedSearch &&
                                                        <p className="loadMore text4" onClick={() => {loadMoreSearch()}}>Load more</p>
                                                    }
                                                </div>
                                            </>
                                        }
                                        {options === "classes" &&
                                            <>
                                                <div className="userPageRows">
                                                    { searchResults && searchResults.map((userReducer, i) => {
                                                        return <ClassCard userReducer={userReducer} key={i} />
                                                    })}
                                                </div>
                                                <div className="finished">
                                                    {!finishedSearch &&
                                                        <p className="loadMore text4" onClick={() => {loadMoreSearch()}}>Load more</p>
                                                    }
                                                </div>
                                            </>
                                        }
                                    </>
                                :
                                    <>
                                        {options === "students" &&
                                            <>
                                                <div className="userPageRows">
                                                    { students && students.map((userReducer, i) => {
                                                        return <UserCard userReducer={userReducer} key={i} />
                                                    })}
                                                </div>
                                                <div className="finished">
                                                    {!finishedStudents &&
                                                        <p className="loadMore text4" onClick={() => {loadMoreStudents()}}>Load more</p>
                                                    }
                                                </div>
                                            </>
                                        }
                                        {options === "teachers" &&
                                            <>
                                                <div className="userPageRows">
                                                    { teachers && teachers.map((userReducer, i) => {
                                                        return <UserCard userReducer={userReducer} key={i} />
                                                    })}
                                                </div>
                                                <div className="finished">
                                                    {!finishedTeachers &&
                                                        <p className="loadMore text4" onClick={() => {loadMoreTeachers()}}>Load more</p>
                                                    }
                                                </div>
                                            </>
                                        }
                                        {options === "classes" &&
                                            <>
                                                <div className="userPageRows">
                                                    { classes && classes.map((classesReducer, i) => {
                                                        return <ClassCard classesReducer={classesReducer} key={i} />
                                                    })}
                                                </div>
                                                <div className="finished">
                                                    {!finishedClasses &&
                                                        <p className="loadMore text4" onClick={() => {loadMoreClasses()}}>Load more</p>
                                                    }
                                                </div>
                                            </>
                                        }
                                    </>
                                }
                            </div>
                        </>
                    }
                </>
            }
        </>
    )
}

export default Home
