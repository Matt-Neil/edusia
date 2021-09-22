import React, {useState, useEffect} from 'react'
import { useParams, useHistory } from 'react-router';
import usersAPI from "../API/users"
import DatePicker from 'react-datepicker'
const moment = require('moment');

const Student = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [student, setStudent] = useState();
    const [notes, setNotes] = useState();
    const [addNote, setAddNote] = useState("");
    const [updateNotes, setUpdateNotes] = useState();
    const [updateDetentions, setUpdateDetentions] = useState();
    const [detentions, setDetentions] = useState();
    const [editNotes, setEditNotes] = useState();
    const [editDetentions, setEditDetentions] = useState();
    const [finishedDetentions, setFinishedDetentions] = useState(false);
    const [finishedNotes, setFinishedNotes] = useState(false);
    const [displayNotes, setDisplayNotes] = useState(true);
    const [detentionDate, setDetentionDate] = useState("");
    const [detentionLocation, setDetentionLocation] = useState("");
    const [detentionReason, setDetentionReason] = useState("");
    const [pickerDate, setPickerDate] = useState(new Date());
    const studentID = useParams().id;
    const classID = useParams().class;
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const student = await usersAPI.get(`/student/${studentID}/lesson?class=${classID}`);
                const notes = await usersAPI.get(`/student/${studentID}/lesson/notes?class=${classID}&date=${new Date().toISOString()}`);
                const detentions = await usersAPI.get(`/student/${studentID}/lesson/detentions?class=${classID}&date=${new Date().toISOString()}`);

                if (student.data.data.length === 0) {
                    history.replace("/home");
                }

                for (let i = 0; i < notes.data.data.length; i++) {
                    setUpdateNotes(previousState => Object.assign([], previousState, {[i]: notes.data.data[i].note}))
                }

                for (let i = 0; i < detentions.data.data.length; i++) {
                    setUpdateDetentions(previousState => Object.assign([], previousState, {[i]: detentions.data.data[i]}))
                }

                if (notes.data.data.length < 10) {
                    setFinishedNotes(true);
                }

                if (detentions.data.data.length < 10) {
                    setFinishedDetentions(true);
                }

                setEditNotes(new Array(notes.data.data.length).fill(false));
                setEditDetentions(new Array(notes.data.data.length).fill(false));
                setStudent(student.data.data);
                setNotes(notes.data.data);
                setDetentions(detentions.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData()
    }, [])

    useEffect(() => {
        let tempDate = pickerDate;
        tempDate.setHours(14, 59, 59, 0);
        setDetentionDate(tempDate.toISOString());
    }, [pickerDate])

    const loadMoreNotes = async () => {
        if (notes.length !== 0 && !finishedNotes) {
            try {
                const loadNotes = await usersAPI.get(`/student/${studentID}/lesson/notes?class=${classID}&date=${notes[notes.length-1].created}`);

                if (loadNotes.data.data.length < 10) {
                    setFinishedNotes(true);
                }
    
                setNotes(notesPrevious => [...notesPrevious, ...loadNotes.data.data]);
            } catch (err) {}
        }
    };

    const loadMoreDetentions = async () => {
        if (detentions.length !== 0 && !finishedDetentions) {
            try {
                const loadDetentions = await usersAPI.get(`/student/${studentID}/lesson/detentions?class=${classID}&date=${detentions[detentions.length-1].date}`);

            if (loadDetentions.data.data.length < 10) {
                setFinishedDetentions(true);
            }

            setDetentions(detentionsPrevious => [...detentionsPrevious, ...loadDetentions.data.data]);
            } catch (err) {}
        }
    };

    const postNote = async (e) => {
        e.preventDefault();

        try {
            await usersAPI.post(`/student/${studentID}/lesson/notes?class=${classID}`, {
                class_id: classID,
                student_id: studentID,
                note: addNote,
                created: new Date().toISOString()
            })
        } catch (err) {}
    }

    const updateNote = async (e) => {
        e.preventDefault();

        for (let i = 0; i < updateNotes.length; i++) {
            if (updateNotes[i] !== notes[i].note) {
                try {
                    await usersAPI.put(`/student/${studentID}/lesson/notes?class=${classID}`, {
                        note: updateNotes[i],
                        id: notes[i].id
                    })

                    setNotes(previousState => Object.assign([], previousState, {[i]: {
                        note: updateNotes[i],
                        created: notes[i].created,
                        id: notes[i].id
                    }}));
                    setEditNotes(previousState => Object.assign([], previousState, {[i]: false}))
                } catch (err) {}
            }
        }
    }

    const deleteNote = async (id) => {
        try {
            await usersAPI.delete(`/student/${studentID}/lesson/notes?class=${classID}`, {
                id: id
            })
        } catch (err) {}
    }

    const postDetention = async (e) => {
        e.preventDefault();

        try {
            await usersAPI.post(`/student/${studentID}/lesson/detentions?class=${classID}`, {
                class_id: classID,
                student_id: studentID,
                location: detentionLocation,
                date: detentionDate,
                reason: detentionReason
            })
            
            setPickerDate(new Date());
            setDetentionLocation("");
            setDetentionDate("");
            setDetentionReason("");
        } catch (err) {}
    }

    const updateDetention = async (e) => {
        e.preventDefault();

        for (let i = 0; i < updateDetentions.length; i++) {
            if (updateDetentions[i].location !== detentions[i].location || updateDetentions[i].date !== detentions[i].date || 
                updateDetentions[i].reason !== detentions[i].reason) {
                try {
                    const updatedDetention = {
                        location: updateDetentions[i].location,
                        date: updateDetentions[i].date,
                        reason: updateDetentions[i].reason,
                        id: updateDetentions[i].id
                    }

                    await usersAPI.put(`/student/${studentID}/lesson/detentions?class=${classID}`, updatedDetention)

                    setDetentions(previousState => Object.assign([], previousState, {[i]: updatedDetention}));
                    setEditDetentions(previousState => Object.assign([], previousState, {[i]: false}))
                } catch (err) {}
            }
        }
    }

    const deleteDetention = async (id) => {
        try {
            await usersAPI.delete(`/student/${studentID}/lesson/detentions?class=${classID}`, {
                id: id
            })
        } catch (err) {}
    }

    return (
        <>
            {loaded &&
                <>
                    <div className="toolbar">
                        <button onClick={() => {setDisplayNotes(true)}}>Notes</button>
                        <button onClick={() => {setDisplayNotes(false)}}>Detentions</button>
                    </div>
                    {displayNotes ?
                        <>
                            <form className="loginBody" method="POST" onSubmit={postNote}>
                                <div className="multipleInput">
                                    <input className="textInputLogin text5" type="text" name="note" placeholder="Note" value={addNote} onChange={e => {setAddNote(e.target.value)}} />
                                </div>
                                <div className="formSubmit">
                                    <input className="loginButton text4" type="submit" value="Add Note" />
                                </div>
                            </form>
                            {notes.map((note, i) => {
                                return (
                                    <div key={i}>
                                        {editNotes[i] ?
                                            <>
                                                <form className="loginBody" method="PUT" onSubmit={updateNote}>
                                                    <div className="multipleInput">
                                                        <input className="textInputLogin text5" type="text" name="note" placeholder="Note" value={updateNotes[i]} onChange={e => {setUpdateNotes(previousState => Object.assign([], previousState, {[i]: e.target.value}))}} />
                                                    </div>
                                                    <div className="formSubmit">
                                                        <input className="loginButton text4" type="submit" value="Update" />
                                                    </div>
                                                </form>
                                                <button onClick={() => {setEditNotes(previousState => Object.assign([], previousState, {[i]: false}))}}>Cancel</button>
                                            </>
                                        :
                                            <>
                                                <p>{note.note}</p>
                                                <button onClick={() => {setEditNotes(previousState => Object.assign([], previousState, {[i]: true}))}}>Update</button>
                                                <button onClick={() => {deleteNote(note.id)}}>Delete</button>
                                            </>
                                        }
                                    </div>
                                )
                            })}
                            <div className="finished">
                                {!finishedNotes &&
                                    <p className="loadMore text4" onClick={() => {loadMoreNotes()}}>Load more</p>
                                }
                            </div>
                        </>
                    :
                        <>  
                            <form className="loginBody" method="POST" onSubmit={postDetention}>
                                <div className="multipleInput">
                                    <input className="textInputLogin text5" type="text" name="location" placeholder="Location" value={detentionLocation} onChange={e => {setDetentionLocation(e.target.value)}} />
                                    <input className="textInputLogin text5" type="text" name="reason" placeholder="Reason" value={detentionReason} onChange={e => {setDetentionReason(e.target.value)}} />
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
                                        selected={pickerDate} 
                                        onChange={date => {setPickerDate(date)}} 
                                        dateFormat="dd/MM/yyyy"
                                        minDate={new Date()} 
                                        filterDate={date => date.getDay() !== 6 && date.getDay() !== 0}
                                        inline
                                        placeholderText={"Select Date"} />
                                </div>
                                <div className="formSubmit">
                                    <input className="loginButton text4" type="submit" value="Add Detention" />
                                </div>
                            </form>
                            {detentions.map((detention, i) => {
                                return (
                                    <div key={i}>
                                        {editDetentions[i] ?
                                            <>
                                                <form className="loginBody" method="PUT" onSubmit={updateDetention}>
                                                    <div className="multipleInput">
                                                        <input className="textInputLogin text5" type="text" name="location" placeholder="Location" value={updateDetentions[i].location} onChange={e => {setUpdateDetentions(previousState => Object.assign([], previousState, {[i]: {
                                                            id: previousState[i].id,
                                                            date: previousState[i].date,
                                                            location: e.target.value,
                                                            reason: previousState[i].reason
                                                        }}))}} />
                                                        <input className="textInputLogin text5" type="text" name="reason" placeholder="Reason" value={updateDetentions[i].reason} onChange={e => {setUpdateDetentions(previousState => Object.assign([], previousState, {[i]: {
                                                            id: previousState[i].id,
                                                            date: previousState[i].date,
                                                            location: previousState[i].location,
                                                            reason: e.target.value
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
                                                            selected={new Date(updateDetentions[i].date)} 
                                                            onChange={date => {setUpdateDetentions(previousState => Object.assign([], previousState, {[i]: {
                                                                id: previousState[i].id,
                                                                date: new Date(date).toISOString(),
                                                                location: previousState[i].location,
                                                                reason: previousState[i].reason
                                                            }}))}} 
                                                            dateFormat="dd/MM/yyyy"
                                                            minDate={new Date()} 
                                                            filterDate={date => date.getDay() !== 6 && date.getDay() !== 0}
                                                            inline
                                                            placeholderText={"Select Date"} />
                                                    </div>
                                                    <div className="formSubmit">
                                                        <input className="loginButton text4" type="submit" value="Update Detention" />
                                                    </div>
                                                </form>
                                                <button onClick={() => {setEditDetentions(previousState => Object.assign([], previousState, {[i]: false}))}}>Cancel</button>
                                            </>
                                        :
                                            <>
                                                <p>{detention.reason}</p>
                                                <button onClick={() => {setEditDetentions(previousState => Object.assign([], previousState, {[i]: true}))}}>Update</button>
                                                <button onClick={() => {deleteDetention(detention.id)}}>Delete</button>
                                            </>
                                        }
                                    </div>
                                )
                            })}
                            <div className="finished">
                                {!finishedDetentions &&
                                    <p className="loadMore text4" onClick={() => {loadMoreDetentions()}}>Load more</p>
                                }
                            </div>
                        </>
                    }
                </>
            }
        </>
    )
}

export default Student