import React, {useState, useEffect, useContext} from 'react'
import { Link, useHistory, useParams } from 'react-router-dom';
import usersAPI from "../API/users"
import classesAPI from "../API/classes"
import homeworkAPI from "../API/homework"
import testsAPI from "../API/tests"
import notificationsAPI from "../API/notifications"
import DatePicker from 'react-datepicker'
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import StudentCard from '../Components/StudentCard';
import HomeworkCardClass from '../Components/HomeworkCardClass';
import TestCard from '../Components/TestCard';
import NotificationCardClass from '../Components/NotificationCardClass';
import MessageCard from '../Components/MessageCard'
import EditClass from '../Components/EditClass';
import AddHomework from '../Components/AddHomework';
import AddTests from '../Components/AddTests';
import AddNotifications from '../Components/AddNotifications';

const Class = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [classes, setClasses] = useState();
    const [students, setStudents] = useState();
    const [tests, setTests] = useState([]);
    const [testsLength, setTestsLength] = useState(0);
    const [homeworkLength, setHomeworkLength] = useState(0);
    const [notificationsLength, setNotificationsLength] = useState(0);
    const [addHomework, setAddHomework] = useState(false);
    const [addTests, setAddTests] = useState(false);
    const [addNotifications, setAddNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [editClass, setEditClass] = useState(false);
    const [editNotifications, setEditNotifications] = useState([]);
    const [editTests, setEditTests] = useState([]);
    const [updateNotifications, setUpdateNotifications] = useState([]);
    const [updateTests, setUpdateTests] = useState([]);
    const [homework, setHomework] = useState();
    const [displayStudents, setDisplayStudents] = useState(true);
    const [displayHomework, setDisplayHomework] = useState(false);
    const [displayTests, setDisplayTests] = useState(false);
    const [displayNotifications, setDisplayNotifications] = useState(false);
    const [finishedHomework, setFinishedHomework] = useState(false);
    const [finishedTests, setFinishedTests] = useState(false);
    const [finishedNotifications, setFinishedNotifications] = useState(false);
    const {displayUpdatedMessage, displayDeletedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageDeletedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);
    const classID = useParams().id;
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (currentUser.position === "student") {
                    history.replace("/home");
                } else {
                    const classes = await classesAPI.get(`/${classID}`);
                    const students = await usersAPI.get(`/students/${classID}/lesson`);
                    const tests = await testsAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z&length=10`);
                    const homework = await homeworkAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z$length=10`);
                    const notifications = await notificationsAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z&length=10`)

                    if (classes.data.data) {
                        homework.data.data.reverse()
                        tests.data.data.reverse()
                        notifications.data.data.reverse()

                        if (homework.data.data.length < 10) {
                            setFinishedHomework(true);
                        }

                        if (tests.data.data.length < 10) {
                            setFinishedTests(true);
                        }

                        if (notifications.data.data.length < 10) {
                            setFinishedNotifications(true);
                        }
                        
                        for (let i = 0; i < tests.data.data.length; i++) {
                            setUpdateTests(previousState => Object.assign([], previousState, {[i]: tests.data.data[i]}))
                        }

                        for (let i = 0; i < notifications.data.data.length; i++) {
                            setUpdateNotifications(previousState => Object.assign([], previousState, {[i]: notifications.data.data[i]}))
                        }

                        setTestsLength(tests.data.data.length);
                        setHomeworkLength(homework.data.data.length);
                        setNotificationsLength(notifications.data.data.length)
                        setEditNotifications(new Array(notifications.data.data.length).fill(false));
                        setEditTests(new Array(tests.data.data.length).fill(false));
                        setClasses(classes.data.data);
                        setStudents(students.data.data);
                        setTests(tests.data.data);
                        setHomework(homework.data.data);
                        setNotifications(notifications.data.data);
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

    const loadMoreTests = async () => {
        if (tests.length !== 0 && !finishedTests) {
            try {
                const loadTests = await testsAPI.get(`/${classID}/class?date=${tests[tests.length-1].date}`);

                loadTests.data.data.reverse()

                if (loadTests.data.data.length < 10) {
                    setFinishedTests(true);
                }
    
                setTests(testsPrevious => [...testsPrevious, ...loadTests.data.data]);
            } catch (err) {
                displayMessageErrorInterval("Error Loading Tests")
            }
        }
    }

    const loadMoreHomework = async () => {
        if (homework.length !== 0 && !finishedHomework) {
            try {
                const loadHomework = await homeworkAPI.get(`/${classID}/class?date=${homework[homework.length-1].deadline}`);

                loadHomework.data.data.reverse()

                if (loadHomework.data.data.length < 10) {
                    setFinishedHomework(true);
                }
    
                setHomework(homeworkPrevious => [...homeworkPrevious, ...loadHomework.data.data]);
            } catch (err) {
                displayMessageErrorInterval("Error Loading Homework")
            }
        }
    }

    const loadMoreNotifications = async () => {
        if (notifications.length !== 0 && !finishedNotifications) {
            try {
                const loadNotifications = await notificationsAPI.get(`/${classID}/class?date=${notifications[notifications.length-1].expire}`);

                loadNotifications.data.data.reverse()

                if (loadNotifications.data.data.length < 10) {
                    setFinishedNotifications(true);
                }
    
                setNotifications(notificationsPrevious => [...notificationsPrevious, ...loadNotifications.data.data]);
            } catch (err) {
                displayMessageErrorInterval("Error Loading Notifications")
            }
        }
    }

    const changeStudents = () => {
        setDisplayStudents(true);
        setDisplayHomework(false);
        setDisplayTests(false);
        setDisplayNotifications(false);
        setEditClass(false)
        setAddTests(false)
        setAddHomework(false)
        setAddNotifications(false)
    }

    const changeHomework = () => {
        setDisplayStudents(false);
        setDisplayHomework(true);
        setDisplayTests(false);
        setDisplayNotifications(false);
        setEditClass(false)
        setAddTests(false)
        setAddHomework(false)
        setAddNotifications(false)
    }

    const changeTests = () => {
        setDisplayStudents(false);
        setDisplayHomework(false);
        setDisplayTests(true);
        setDisplayNotifications(false);
        setEditClass(false)
        setAddTests(false)
        setAddHomework(false)
        setAddNotifications(false)
    }

    const changeNotifications = () => {
        setDisplayStudents(false);
        setDisplayHomework(false);
        setDisplayTests(false);
        setDisplayNotifications(true);
        setEditClass(false)
        setAddTests(false)
        setAddHomework(false)
        setAddNotifications(false)
    }

    const changeClasses = () => {
        setDisplayStudents(false);
        setDisplayHomework(false);
        setDisplayTests(false);
        setDisplayNotifications(false);
        setEditClass(true)
        setAddTests(false)
        setAddHomework(false)
        setAddNotifications(false)
    }

    const refreshTests = async () => {
        try {
            const response = await testsAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z&length=${testsLength}`);

            response.data.data.reverse()

            for (let i = 0; i < response.data.data.length; i++) {
                setUpdateTests(previousState => Object.assign([], previousState, {[i]: response.data.data[i].note}))
            }
    
            if (response.data.data.length % 10 !== 0) {
                setFinishedTests(true);
            }
    
            setEditTests(new Array(response.data.data.length).fill(false));
            setTests(response.data.data);
            setAddTests(false)
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const refreshNotifications = async () => {
        try {
            const response = await notificationsAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z&length=${notificationsLength}`);

            response.data.data.reverse()

            for (let i = 0; i < response.data.data.length; i++) {
                setUpdateNotifications(previousState => Object.assign([], previousState, {[i]: response.data.data[i]}))
            }

            if (response.data.data.length % 10 !== 0) {
                setFinishedNotifications(true);
            }

            setEditNotifications(new Array(response.data.data.length).fill(false));
            setNotifications(response.data.data);
            setAddNotifications(false)
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const refreshHomework = async () => {
        try {
            const response = await homeworkAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z&length=${homeworkLength}`);

            response.data.data.reverse()

            if (response.data.data.length % 10 !== 0) {
                setFinishedHomework(true);
            }

            setHomework(response.data.data);
            setAddHomework(false)
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const refreshClass = async () => {
        try {
            const response = await classesAPI.get(`/${classID}`);

            setClasses(response.data.data)
            changeStudents()
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const updateTest = async (e) => {
        e.preventDefault();

        const updatedTest = {
            title: updateTests[e.target.id].title,
            date: updateTests[e.target.id].date,
            id: tests[e.target.id].id
        }

        if (updatedTest.title === "" || updatedTest.date === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await testsAPI.put(`/${tests[e.target.id].id}`, updatedTest)

                setTests(previousState => Object.assign([], previousState, {[e.target.id]: updatedTest}));
                setEditTests(previousState => Object.assign([], previousState, {[e.target.id]: false}))
                displayMessageUpdatedInterval()
            } catch (err) {
                console.log(err)
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    const deleteTest = async (id, index) => {
        try {
            await testsAPI.delete(`/${id}`)

            setTests(tests.filter(test => test.id !== id));
            setUpdateTests(updateTests.filter(test => test.id !== id));
            setEditTests(editTests.filter((edit, i) => i !== index));
            displayMessageDeletedInterval()
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const cancelTest = (i) => {
        setUpdateTests(previousState => Object.assign([], previousState, {[i]: tests[i]}))
        setEditTests(previousState => Object.assign([], previousState, {[i]: false}))
    }

    const updateNotification = async (e) => {
        e.preventDefault();

        const updatedNotification = {
            notification: updateNotifications[e.target.id].notification,
            expire: updateNotifications[e.target.id].expire,
            id: notifications[e.target.id].id
        }

        if (updatedNotification.expire === "" || updatedNotification.notification === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await notificationsAPI.put(`/${notifications[e.target.id].id}/class`, updatedNotification)

                setNotifications(previousState => Object.assign([], previousState, {[e.target.id]: updatedNotification}));
                setEditNotifications(previousState => Object.assign([], previousState, {[e.target.id]: false}))
                displayMessageUpdatedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    const deleteNotification = async (id, index) => {
        try {
            await notificationsAPI.delete(`/${id}/class`)

            setNotifications(notifications.filter(notification => notification.id !== id));
            setUpdateNotifications(updateNotifications.filter(notification => notification.id !== id));
            setEditNotifications(editNotifications.filter((edit, i) => i !== index));
            displayMessageDeletedInterval();
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const cancelNotification = (i) => {
        setUpdateNotifications(previousState => Object.assign([], previousState, {[i]: notifications[i]}))
        setEditNotifications(previousState => Object.assign([], previousState, {[i]: false}))
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
                    <Header path={[{text: "Home", link: "/"}, `Class: ${classes.class_code}`]} />
                    <div className="toolbar">
                        <div className="toolbarLeft">
                            <button className="toolbarItem buttonBlue" onClick={() => {changeStudents()}}>View Students</button>
                            <button className="toolbarItem buttonBlue" onClick={() => {changeHomework()}}>View Homework</button>
                            <button className="toolbarItem buttonBlue" onClick={() => {changeTests()}}>View Tests</button>
                            <button className="toolbarItem buttonBlue" onClick={() => {changeNotifications()}}>View Notifications</button>
                        </div>
                        {currentUser.position === "school" &&
                            <>
                                {editClass ?
                                    <button className="buttonOrange toolbarItem" onClick={() => {refreshClass()}}>Cancel</button>
                                :
                                    <button className="buttonBlue toolbarItem" onClick={() => {changeClasses()}}>Edit Class</button>
                                }
                                <button style={{margin: "0 25px 0 25px"}} className="buttonOrange toolbarItem" onClick={() => {deleteClass()}}>Delete Class</button>
                            </>
                        }
                    </div>
                    <div className="innerBody">
                        {editClass ?   
                            <EditClass currentUser={currentUser} data={{classes: classes, students: students}} />
                        :
                            <>
                                {currentUser.position === "school" && !editClass &&
                                    <div className="classInfo">
                                        <p className="classInfoItem">Subject: {classes.subject}</p>
                                        <p className="classInfoItem">Class Code: {classes.class_code}</p>
                                        <Link className="classInfoItem" to={`/user/${classes.teacher_id}`}>Teacher: {classes.name} ({classes.username})</Link>
                                    </div>
                                }
                                {displayStudents &&
                                    <>
                                        <p className="pageTitle">Students</p>
                                        <div className="displayCardsRow">
                                            {students && students.map((student, i) => {
                                                return (
                                                    <div key={i}>
                                                        <StudentCard user={student} classID={classID} />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </>
                                }
                                {displayHomework &&
                                    <>
                                        {addHomework ?
                                            <>
                                                <p className="pageTitle">Add Homework</p>
                                                <AddHomework currentUser={currentUser} classID={classID} students={students} setHomeworkLength={setHomeworkLength} />
                                                <button style={{margin: "50px 0 0 0"}} className="buttonOrange" onClick={() => {refreshHomework()}}>Cancel</button>
                                            </>
                                        :
                                            <>
                                                <p className="pageTitle">Homework</p>
                                                {currentUser.position === "teacher" && currentUser.id === classes.teacher_id &&
                                                    <button style={{margin: "25px 0 0 0"}} className="buttonBlue" onClick={() => {setAddHomework(true)}}>Add Homework</button>
                                                }
                                                <div className="displayCardsRow">
                                                    {homework && homework.map((homework, i) => {
                                                        return <HomeworkCardClass homework={homework} classID={classID} key={i} />
                                                    })}
                                                </div>
                                                <div className="finished">
                                                    {!finishedHomework &&
                                                        <p className="loadMore text4" onClick={() => {loadMoreHomework()}}>Load more</p>
                                                    }
                                                </div>
                                            </>
                                        }
                                    </>
                                }
                                {displayTests &&
                                    <>
                                        {addTests ?
                                            <>
                                                <p className="pageTitle">Add Test</p>
                                                <AddTests classID={classID} students={students} setTestsLength={setTestsLength} />
                                                <button style={{margin: "50px 0 0 0"}} className="buttonOrange" onClick={() => {refreshTests()}}>Cancel</button>
                                            </>
                                        :
                                            <>
                                                <p className="pageTitle">Tests</p>
                                                {currentUser.position === "teacher" && currentUser.id === classes.teacher_id &&
                                                    <button style={{margin: "25px 0 0 0"}} className="buttonBlue" onClick={() => {setAddTests(true)}}>Add Test</button>
                                                }
                                                {tests.map((test, i) => {
                                                    return (
                                                        <div key={i}>
                                                            {editTests[i] && currentUser.position === "teacher" ?
                                                                <>
                                                                    <form method="PUT" onSubmit={updateTest} id={i}>
                                                                        <div className="multipleInput">
                                                                            <textarea className="textAreaInput" type="text" name="title" placeholder="Title" maxLength="100" rows="3" value={updateTests[i].title} onChange={e => {setUpdateTests(previousState => Object.assign([], previousState, {[i]: {
                                                                                id: previousState[i].id,
                                                                                class_id: previousState[i].class_id,
                                                                                title: e.target.value,
                                                                                date: previousState[i].date
                                                                            }}))}} />
                                                                            <DatePicker renderCustomHeader={({
                                                                                            monthDate,
                                                                                            customHeaderCount,
                                                                                            decreaseMonth,
                                                                                            increaseMonth,
                                                                                        }) => (
                                                                                            <div>
                                                                                                <button aria-label="Previous Month"
                                                                                                        type="button"
                                                                                                        className={"react-datepicker__navigation react-datepicker__navigation--previous"}
                                                                                                        style={customHeaderCount === 1 ? { visibility: "hidden" } : null}
                                                                                                        onClick={decreaseMonth}>
                                                                                                    <span className={"react-datepicker__navigation-icon react-datepicker__navigation-icon--previous"}>
                                                                                                        {"<"}
                                                                                                    </span>
                                                                                                </button>
                                                                                                <span className="react-datepicker__current-month">
                                                                                                    {monthDate.toLocaleString("en-GB", {
                                                                                                        month: "long",
                                                                                                        year: "numeric",
                                                                                                    })}
                                                                                                </span>
                                                                                                <button aria-label="Next Month"
                                                                                                        type="button"
                                                                                                        className={"react-datepicker__navigation react-datepicker__navigation--next"}
                                                                                                        style={customHeaderCount === 0 ? { visibility: "hidden" } : null}
                                                                                                        onClick={increaseMonth}>
                                                                                                    <span className={"react-datepicker__navigation-icon react-datepicker__navigation-icon--next"}>
                                                                                                        {">"}
                                                                                                    </span>
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                        monthsShown={2}
                                                                                        selected={new Date(updateTests[i].date)} 
                                                                                        onChange={date => {setUpdateTests(previousState => Object.assign([], previousState, {[i]: {
                                                                                            id: previousState[i].id,
                                                                                            class_id: previousState[i].class_id,
                                                                                            title: previousState[i].title,
                                                                                            date: new Date(date).toISOString()
                                                                                        }}))}} 
                                                                                        dateFormat="dd/MM/yyyy"
                                                                                        minDate={new Date()} 
                                                                                        filterDate={date => date.getDay() !== 6 && date.getDay() !== 0}
                                                                                        inline
                                                                                        placeholderText={"Select Date"} />
                                                                        </div>
                                                                        <div className="formSubmit">
                                                                            <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Update Test" />
                                                                            <button type="button" className="buttonOrange" onClick={() => {cancelTest(i)}}>Cancel</button>
                                                                        </div>
                                                                    </form>
                                                                </>
                                                            :           
                                                                <div className="cardPair">
                                                                    <TestCard test={test} classID={classID} />
                                                                    {currentUser.position === "teacher" && currentUser.id === classes.teacher_id &&
                                                                        <>
                                                                            <button style={{margin: "0 15px 0 0"}} className="buttonBlue" onClick={() => {setEditTests(previousState => Object.assign([], previousState, {[i]: true}))}}>Update</button>
                                                                            <button className="buttonOrange" onClick={() => {deleteTest(test.id, i)}}>Delete</button>
                                                                        </>
                                                                    }
                                                                </div>
                                                            }
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
                                {displayNotifications &&
                                    <>
                                        {addNotifications ?
                                            <>
                                                <p className="pageTitle">Add Notification</p>
                                                <AddNotifications classID={classID} setNotificationsLength={setNotificationsLength} />
                                                <button style={{margin: "50px 0 0 0"}} className="buttonOrange" onClick={() => {refreshNotifications()}}>Cancel</button>
                                            </>
                                        :
                                            <>
                                                <p className="pageTitle">Notifications</p>
                                                {currentUser.position === "teacher" && currentUser.id === classes.teacher_id &&
                                                    <button style={{margin: "25px 0 0 0"}} className="buttonBlue" onClick={() => {setAddNotifications(true)}}>Add Notification</button>
                                                }
                                                {notifications.map((notification, i) => {
                                                    return (
                                                        <div key={i}>
                                                            {editNotifications[i] && currentUser.position === "teacher" ?
                                                                <>
                                                                    <form method="PUT" onSubmit={updateNotification} id={i}>
                                                                        <div className="multipleInput">
                                                                            <textarea className="textAreaInput" type="text" name="notification" placeholder="Notification" maxLength="100" rows="3" value={updateNotifications[i].notification} onChange={e => {setUpdateNotifications(previousState => Object.assign([], previousState, {[i]: {
                                                                                id: previousState[i].id,
                                                                                expire: previousState[i].expire,
                                                                                notification: e.target.value
                                                                            }}))}} />
                                                                            <DatePicker renderCustomHeader={({
                                                                                            monthDate,
                                                                                            customHeaderCount,
                                                                                            decreaseMonth,
                                                                                            increaseMonth,
                                                                                        }) => (
                                                                                            <div>
                                                                                                <button aria-label="Previous Month"
                                                                                                        type="button"
                                                                                                        className={"react-datepicker__navigation react-datepicker__navigation--previous"}
                                                                                                        style={customHeaderCount === 1 ? { visibility: "hidden" } : null}
                                                                                                        onClick={decreaseMonth}>
                                                                                                    <span className={"react-datepicker__navigation-icon react-datepicker__navigation-icon--previous"}>
                                                                                                        {"<"}
                                                                                                    </span>
                                                                                                </button>
                                                                                                <span className="react-datepicker__current-month">
                                                                                                    {monthDate.toLocaleString("en-GB", {
                                                                                                        month: "long",
                                                                                                        year: "numeric",
                                                                                                    })}
                                                                                                </span>
                                                                                                <button aria-label="Next Month"
                                                                                                        type="button"
                                                                                                        className={"react-datepicker__navigation react-datepicker__navigation--next"}
                                                                                                        style={customHeaderCount === 0 ? { visibility: "hidden" } : null}
                                                                                                        onClick={increaseMonth}>
                                                                                                    <span className={"react-datepicker__navigation-icon react-datepicker__navigation-icon--next"}>
                                                                                                        {">"}
                                                                                                    </span>
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                        monthsShown={2}
                                                                                        selected={new Date(updateNotifications[i].expire)} 
                                                                                        onChange={date => {setUpdateNotifications(previousState => Object.assign([], previousState, {[i]: {
                                                                                            id: previousState[i].id,
                                                                                            expire: new Date(date).toISOString(),
                                                                                            notification: previousState[i].notification
                                                                                        }}))}} 
                                                                                        dateFormat="dd/MM/yyyy"
                                                                                        minDate={new Date()} 
                                                                                        filterDate={date => date.getDay() !== 6 && date.getDay() !== 0}
                                                                                        inline
                                                                                        placeholderText={"Select Date"} />
                                                                        </div>
                                                                        <div className="formSubmit">
                                                                            <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Update Notification" />
                                                                            <button type="button" className="buttonOrange" onClick={() => {cancelNotification(i)}}>Cancel</button>
                                                                        </div>
                                                                    </form>
                                                                </>
                                                            :
                                                                <div className="cardPair">
                                                                    <NotificationCardClass notification={notification} />
                                                                    {currentUser.position === "teacher" && currentUser.id === classes.teacher_id &&
                                                                        <>
                                                                            <button style={{margin: "0 15px 0 0"}} className="buttonBlue" onClick={() => {setEditNotifications(previousState => Object.assign([], previousState, {[i]: true}))}}>Update</button>
                                                                            <button className="buttonOrange" onClick={() => {deleteNotification(notification.id, i)}}>Delete</button>
                                                                        </>
                                                                    }
                                                                </div>
                                                            }    
                                                        </div>
                                                    )
                                                })}
                                                <div className="finished">
                                                    {!finishedNotifications &&
                                                        <p className="loadMore text4" onClick={() => {loadMoreNotifications()}}>Load more</p>
                                                    }
                                                </div>
                                            </>
                                        }
                                    </>
                                }
                            </>
                        }
                        {displayUpdatedMessage && <MessageCard message={"Updated"} />}
                        {displayDeletedMessage && <MessageCard message={"Deleted"} />}
                        {displayErrorMessage && <MessageCard message={error} />}
                    </div>
                </>
            }      
        </>   
    )
}

export default Class
