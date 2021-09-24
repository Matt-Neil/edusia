import React, {useState, useEffect, useContext} from 'react'
import { Link, useParams } from 'react-router-dom';
import usersAPI from "../API/users"
import classesAPI from "../API/classes"
import homeworkAPI from "../API/homework"
import testsAPI from "../API/tests"
import notificationsAPI from "../API/notifications"
import DatePicker from 'react-datepicker'
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';

const Class = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [classes, setClasses] = useState();
    const [students, setStudents] = useState();
    const [tests, setTests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notification, setNotification] = useState("");
    const [editNotifications, setEditNotifications] = useState([]);
    const [editTests, setEditTests] = useState([]);
    const [updateNotifications, setUpdateNotifications] = useState([]);
    const [updateTests, setUpdateTests] = useState([]);
    const [title, setTitle] = useState("");
    const [testDate, setTestDate] = useState("");
    const [notificationDate, setNotificationDate] = useState("");
    const [testPickerDate, setTestPickerDate] = useState(new Date());
    const [notificationPickerDate, setNotificationPickerDate] = useState(new Date());
    const [homework, setHomework] = useState();
    const [displayStudents, setDisplayStudents] = useState(true);
    const [displayHomework, setDisplayHomework] = useState(false);
    const [displayTests, setDisplayTests] = useState(false);
    const [displayNotifications, setDisplayNotifications] = useState(false);
    const [finishedHomework, setFinishedHomework] = useState(false);
    const [finishedTests, setFinishedTests] = useState(false);
    const [finishedNotifications, setFinishedNotifications] = useState(false);
    const {displayAddedMessage, displayUpdatedMessage, displayDeletedMessage, 
        displayMessageAddedInterval, displayMessageUpdatedInterval, displayMessageDeletedInterval} = useContext(MessageContext);
    const classID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classes = await classesAPI.get(`/${classID}`);
                const students = await usersAPI.get(`/students/${classID}/lesson`);
                const tests = await testsAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z`);
                const homework = await homeworkAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z`);
                const notifications = await notificationsAPI.get(`/${classID}/class?date=2020-01-01T00:15:00.000Z`)

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
                    setUpdateTests(previousState => Object.assign([], previousState, {[i]: tests.data.data[i].note}))
                }

                for (let i = 0; i < notifications.data.data.length; i++) {
                    setUpdateNotifications(previousState => Object.assign([], previousState, {[i]: notifications.data.data[i]}))
                }

                setEditNotifications(new Array(notifications.data.data.length).fill(false));
                setEditTests(new Array(tests.data.data.length).fill(false));
                setClasses(classes.data.data);
                setStudents(students.data.data);
                setTests(tests.data.data);
                setHomework(homework.data.data);
                setNotifications(notifications.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData()
    }, [])

    useEffect(() => {
        let tempDate = notificationPickerDate;
        tempDate.setHours(23, 59, 59, 0);
        setNotificationDate(tempDate.toISOString());
    }, [notificationPickerDate])

    useEffect(() => {
        let tempDate = testPickerDate;
        tempDate.setHours(23, 59, 59, 0);
        setTestDate(tempDate.toISOString());
    }, [testPickerDate])

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

    const loadMoreNotifications = async () => {
        if (notifications.length !== 0 && !finishedNotifications) {
            try {
                const loadNotifications = await notificationsAPI.get(`/${classID}/class?date=${notifications[notifications.length-1].expire}`);

                if (loadNotifications.data.data.length < 10) {
                    setFinishedNotifications(true);
                }
    
                setNotifications(notificationsPrevious => [...notificationsPrevious, ...loadNotifications.data.data]);
            } catch (err) {}
        }
    }

    const changeStudents = () => {
        setDisplayStudents(true);
        setDisplayHomework(false);
        setDisplayTests(false);
        setDisplayNotifications(false);
    }

    const changeHomework = () => {
        setDisplayStudents(false);
        setDisplayHomework(true);
        setDisplayTests(false);
        setDisplayNotifications(false);
    }

    const changeTests = () => {
        setDisplayStudents(false);
        setDisplayHomework(false);
        setDisplayTests(true);
        setDisplayNotifications(false);
    }

    const changeNotifications = () => {
        setDisplayStudents(false);
        setDisplayHomework(false);
        setDisplayTests(false);
        setDisplayNotifications(true);
    }

    const postTest = async (e) => {
        e.preventDefault();

        try {
            const newTest = await testsAPI.post(`/${classID}`, {
                title: title,
                date: testDate,
                students: students
            })

            const testObject = {
                id: newTest.data.data.id,
                class_id: classID,
                date: testDate,
                title: title
            };

            setTests(testsPrevious => [testObject, ...testsPrevious]);
            setUpdateTests(testsPrevious => [testObject, ...testsPrevious]);
            setEditTests(testsPrevious => [false, ...testsPrevious]);
            setTitle("");
            setTestDate("");
            setTestPickerDate(new Date());
            displayMessageAddedInterval()
        } catch (err) {}
    }

    const updateTest = async (e) => {
        e.preventDefault();

        const updatedTest = {
            title: updateNotifications[e.target.id].title,
            date: updateNotifications[e.target.id].date
        }

        await testsAPI.put(`/${notifications[e.target.id].id}`, updatedTest)

        setTests(previousState => Object.assign([], previousState, {[e.target.id]: updatedTest}));
        setEditTests(previousState => Object.assign([], previousState, {[e.target.id]: false}))
        displayMessageUpdatedInterval()
    }

    const deleteTest = async (id, index) => {
        try {
            await testsAPI.delete(`/${id}`)

            setTests(tests.filter(test => test.id !== id));
            setUpdateTests(updateTests.filter(test => test.id !== id));
            setEditTests(editTests.filter((edit, i) => i !== index));
            displayMessageDeletedInterval()
        } catch (err) {}
    }

    const cancelTest = (i) => {
        setUpdateTests(previousState => Object.assign([], previousState, {[i]: tests[i]}))
        setEditTests(previousState => Object.assign([], previousState, {[i]: false}))
    }

    const postNotification = async (e) => {
        e.preventDefault();

        try {
            const newNotification = await notificationsAPI.post("/", {
                class_id: classID,
                expire: notificationDate,
                notification: notification
            })

            const notificationObject = {
                id: newNotification.data.data.id,
                class_id: classID,
                expire: notificationDate,
                notification: notification
            }
            
            setNotifications(notificationsPrevious => [notificationObject, ...notificationsPrevious]);
            setUpdateNotifications(notificationsPrevious => [notificationObject, ...notificationsPrevious]);
            setEditNotifications(notificationsPrevious => [false, ...notificationsPrevious]);
            setNotification("");
            setNotificationDate("");
            setNotificationPickerDate(new Date());
            displayMessageAddedInterval();
        } catch (err) {}
    }

    const updateNotification = async (e) => {
        e.preventDefault();

        const updatedNotification = {
            notification: updateNotifications[e.target.id].notification,
            expire: updateNotifications[e.target.id].expire
        }

        await notificationsAPI.put(`/${notifications[e.target.id].id}/class`, updatedNotification)

        setNotifications(previousState => Object.assign([], previousState, {[e.target.id]: updatedNotification}));
        setEditNotifications(previousState => Object.assign([], previousState, {[e.target.id]: false}))
        displayMessageUpdatedInterval();
    }

    const deleteNotification = async (id, index) => {
        try {
            await notificationsAPI.delete(`/${id}/class`)

            setNotifications(notifications.filter(notification => notification.id !== id));
            setUpdateNotifications(updateNotifications.filter(notification => notification.id !== id));
            setEditNotifications(editNotifications.filter((edit, i) => i !== index));
            displayMessageDeletedInterval();
        } catch (err) {}
    }

    const cancelNotification = (i) => {
        setUpdateNotifications(previousState => Object.assign([], previousState, {[i]: notifications[i]}))
        setEditNotifications(previousState => Object.assign([], previousState, {[i]: false}))
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: ""}, `Class ${classes.class_code}`]} />
                    {currentUser.position === "teacher" &&
                        <div className="toolbar">
                            <button onClick={() => {changeStudents()}}>View Students</button>
                            <button onClick={() => {changeHomework()}}>View Homework</button>
                            <button onClick={() => {changeTests()}}>View Tests</button>
                            <button onClick={() => {changeNotifications()}}>View Notifications</button>
                            <Link to={`/add-homework/${classID}`}>Add Homework</Link>
                        </div>
                    }
                    {currentUser.position === "school" &&
                        <div className="toolbar">
                            <button onClick={() => {changeStudents()}}>View Students</button>
                            <button onClick={() => {changeHomework()}}>View Homework</button>
                            <button onClick={() => {changeTests()}}>View Tests</button>
                            <button onClick={() => {changeNotifications()}}>View Notifications</button>
                            <Link to={`/home/${classID}/edit-class`}>Edit Class</Link>
                        </div>
                    }
                    {displayStudents &&
                        <>
                            {students && students.map((student, i) => {
                                return (
                                    <div key={i}>
                                        <img src={`http://localhost:5000/uploads/${student.picture}`} />
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
                            <form className="loginBody" method="POST" onSubmit={postTest}>
                                <div className="multipleInput">
                                    <input className="textInputLogin text5" type="text" name="title" placeholder="Title" value={title} onChange={e => {setTitle(e.target.value)}} />
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
                                                selected={testPickerDate} 
                                                onChange={date => {setTestPickerDate(date)}} 
                                                dateFormat="dd/MM/yyyy"
                                                minDate={new Date()} 
                                                filterDate={date => date.getDay() !== 6 && date.getDay() !== 0}
                                                inline
                                                placeholderText={"Select Date"} />
                                </div>
                                <div className="formSubmit">
                                    <input className="loginButton text4" type="submit" value="Add Test" />
                                </div>
                            </form>
                            {tests && tests.map((test, i) => {
                                return (
                                    <div key={i}>
                                        {editTests[i] ?
                                            <>
                                                <form className="loginBody" method="PUT" onSubmit={updateTest} id={i}>
                                                    <div className="multipleInput">
                                                        <input className="textInputLogin text5" type="text" name="title" placeholder="Title" value={updateTests[i].title} onChange={e => {setUpdateTests(previousState => Object.assign([], previousState, {[i]: {
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
                                                        <input className="loginButton text4" type="submit" value="Update Test" />
                                                    </div>
                                                </form>
                                                <button onClick={() => {cancelTest(i)}}>Cancel</button>
                                            </>
                                        :           
                                            <>
                                                <p>{test.title}</p>
                                                <button onClick={() => {setEditTests(previousState => Object.assign([], previousState, {[i]: true}))}}>Update</button>
                                                <button onClick={() => {deleteTest(test.id, i)}}>Delete</button>
                                            </>
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
                    {displayNotifications &&
                        <>
                            <form className="loginBody" method="POST" onSubmit={postNotification}>
                                <div className="multipleInput">
                                    <input className="textInputLogin text5" type="text" name="notification" placeholder="Notification" value={notification} onChange={e => {setNotification(e.target.value)}} />
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
                                                selected={notificationPickerDate} 
                                                onChange={date => {setNotificationPickerDate(date)}} 
                                                dateFormat="dd/MM/yyyy"
                                                minDate={new Date()} 
                                                filterDate={date => date.getDay() !== 6 && date.getDay() !== 0}
                                                inline
                                                placeholderText={"Select Date"} />
                                </div>
                                <div className="formSubmit">
                                    <input className="loginButton text4" type="submit" value="Add Notification" />
                                </div>
                            </form>
                            {notifications && notifications.map((notification, i) => {
                                return (
                                    <div key={i}>
                                        {editNotifications[i] ?
                                            <>
                                                <form className="loginBody" method="PUT" onSubmit={updateNotification} id={i}>
                                                    <div className="multipleInput">
                                                        <input className="textInputLogin text5" type="text" name="notification" placeholder="Notification" value={updateNotifications[i].notification} onChange={e => {setUpdateNotifications(previousState => Object.assign([], previousState, {[i]: {
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
                                                        <input className="loginButton text4" type="submit" value="Update Notification" />
                                                    </div>
                                                </form>
                                                <button onClick={() => {cancelNotification(i)}}>Cancel</button>
                                            </>
                                        :
                                            <>
                                                <p>{notification.notification}</p>
                                                <button onClick={() => {setEditNotifications(previousState => Object.assign([], previousState, {[i]: true}))}}>Update</button>
                                                <button onClick={() => {deleteNotification(notification.id, i)}}>Delete</button>
                                            </>
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
                    {displayAddedMessage && <p>Added</p>}
                    {displayUpdatedMessage && <p>Updated</p>}
                    {displayDeletedMessage && <p>Deleted</p>}
                </>
            }      
        </>   
    )
}

export default Class
