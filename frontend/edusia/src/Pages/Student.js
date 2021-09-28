import React, {useState, useEffect, useContext} from 'react'
import { useParams, useHistory } from 'react-router';
import usersAPI from "../API/users"
import DatePicker from 'react-datepicker'
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import DetentionCardClass from '../Components/DetentionCardClass';
import NoteCard from '../Components/NoteCard';
import MessageCard from '../Components/MessageCard';
import UserCard from '../Components/UserCard';
import AddNotes from '../Components/AddNotes';
import AddDetentions from '../Components/AddDetentions';

const Student = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [student, setStudent] = useState();
    const [notes, setNotes] = useState([]);
    const [notesLength, setNotesLength] = useState(0);
    const [detentionsLength, setDetentionsLength] = useState(0);
    const [addNotes, setAddNotes] = useState(false);
    const [addDetentions, setAddDetentions] = useState(false);
    const [updateNotes, setUpdateNotes] = useState([]);
    const [updateDetentions, setUpdateDetentions] = useState([]);
    const [detentions, setDetentions] = useState([]);
    const [editNotes, setEditNotes] = useState([]);
    const [editDetentions, setEditDetentions] = useState([]);
    const [finishedDetentions, setFinishedDetentions] = useState(false);
    const [finishedNotes, setFinishedNotes] = useState(false);
    const [displayNotes, setDisplayNotes] = useState(true);
    const {displayUpdatedMessage, displayDeletedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageDeletedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);
    const studentID = useParams().id;
    const classID = useParams().class;
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (currentUser.position === "student") {
                    history.replace("/home");
                } else {
                    const student = await usersAPI.get(`/student/${studentID}/lesson?class=${classID}`);
                    const notes = await usersAPI.get(`/student/${studentID}/lesson/notes?class=${classID}&date=${new Date().toISOString()}&length=10`);
                    const detentions = await usersAPI.get(`/student/${studentID}/lesson/detentions?class=${classID}&date=2020-01-01T00:15:00.000Z&length=10`);

                    if (student.data.data) {
                        detentions.data.data.reverse()

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
        
                        setNotesLength(notes.data.data.length);
                        setDetentionsLength(detentions.data.data.length);
                        setEditNotes(new Array(notes.data.data.length).fill(false));
                        setEditDetentions(new Array(detentions.data.data.length).fill(false));
                        setStudent(student.data.data);
                        setNotes(notes.data.data);
                        setDetentions(detentions.data.data);
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

    const loadMoreNotes = async () => {
        if (notes.length !== 0 && !finishedNotes) {
            try {
                const loadNotes = await usersAPI.get(`/student/${studentID}/lesson/notes?class=${classID}&date=${notes[notes.length-1].created}&length=10`);

                if (loadNotes.data.data.length < 10) {
                    setFinishedNotes(true);
                }
    
                setNotes(notesPrevious => [...notesPrevious, ...loadNotes.data.data]);
            } catch (err) {
                displayMessageErrorInterval("Error Loading Notes")
            }
        }
    };

    const loadMoreDetentions = async () => {
        if (detentions.length !== 0 && !finishedDetentions) {
            try {
                const loadDetentions = await usersAPI.get(`/student/${studentID}/lesson/detentions?class=${classID}&date=${detentions[detentions.length-1].date}&length=10`);

                loadDetentions.data.data.reverse()

                if (loadDetentions.data.data.length < 10) {
                    setFinishedDetentions(true);
                }

                setDetentions(detentionsPrevious => [...detentionsPrevious, ...loadDetentions.data.data]);
            } catch (err) {
                displayMessageErrorInterval("Error Loading Detentions")
            }
        }
    };

    const refreshNotes = async () => {
        try {
            const response = await usersAPI.get(`/student/${studentID}/lesson/notes?class=${classID}&date=${new Date().toISOString()}&length=${notesLength}`);

            for (let i = 0; i < response.data.data.length; i++) {
                setUpdateNotes(previousState => Object.assign([], previousState, {[i]: response.data.data[i].note}))
            }
    
            if (response.data.data.length % 10 !== 0) {
                setFinishedNotes(true);
            }
    
            setEditNotes(new Array(response.data.data.length).fill(false));
            setNotes(response.data.data);
            setAddNotes(false)
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const refreshDetentions = async () => {
        try {
            const response = await usersAPI.get(`/student/${studentID}/lesson/detentions?class=${classID}&date=2020-01-01T00:15:00.000Z&length=${detentionsLength}`);

            response.data.data.reverse()

            for (let i = 0; i < response.data.data.length; i++) {
                setUpdateDetentions(previousState => Object.assign([], previousState, {[i]: response.data.data[i]}))
            }

            if (response.data.data.length % 10 !== 0) {
                setFinishedDetentions(true);
            }

            setEditDetentions(new Array(response.data.data.length).fill(false));
            setDetentions(response.data.data);
            setAddDetentions(false)
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }
    const updateNote = async (e) => {
        e.preventDefault();

        if (updateNotes[e.target.id] === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await usersAPI.put(`/student/${studentID}/lesson/notes?class=${classID}`, {
                    note: updateNotes[e.target.id],
                    id: notes[e.target.id].id
                })
    
                setNotes(previousState => Object.assign([], previousState, {[e.target.id]: {
                    note: updateNotes[e.target.id],
                    created: notes[e.target.id].created,
                    id: notes[e.target.id].id
                }}));

                setEditNotes(previousState => Object.assign([], previousState, {[e.target.id]: false}))
                displayMessageUpdatedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    const deleteNote = async (id, index) => {
        try {
            await usersAPI.delete(`/student/${studentID}/lesson/notes?class=${classID}&note=${id}`)

            setNotes(notes.filter(note => note.id !== id));
            setUpdateNotes(updateNotes.filter(note => note.id !== id));
            setEditNotes(editNotes.filter((edit, i) => i !== index));
            displayMessageDeletedInterval();
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const updateDetention = async (e) => {
        e.preventDefault();

        try {
            const updatedDetention = {
                location: updateDetentions[e.target.id].location,
                date: updateDetentions[e.target.id].date,
                reason: updateDetentions[e.target.id].reason,
                id: updateDetentions[e.target.id].id
            }

            if (updatedDetention.location === "" || updatedDetention.date === "" || updatedDetention.reason === "") {
                displayMessageErrorInterval("No Blank Fields")
            } else {
                await usersAPI.put(`/student/${studentID}/lesson/detentions?class=${classID}`, updatedDetention)

                setDetentions(previousState => Object.assign([], previousState, {[e.target.id]: updatedDetention}));
                setEditDetentions(previousState => Object.assign([], previousState, {[e.target.id]: false}))
                displayMessageUpdatedInterval();
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const deleteDetention = async (id, index) => {
        try {
            await usersAPI.delete(`/student/${studentID}/lesson/detentions?class=${classID}&detention=${id}`)

            setDetentions(detentions.filter(detention => detention.id !== id));
            setUpdateDetentions(updateDetentions.filter(detention => detention.id !== id));
            setEditDetentions(editDetentions.filter((edit, i) => i !== index));
            displayMessageDeletedInterval();
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: "/"}, {text: `Class: ${student.class_code}`, link: `/class/${classID}`}, `Student: ${student.name} (${student.username})`]} />
                    <div className="toolbar">
                        <button className="buttonBlue toolbarItem" onClick={() => {setDisplayNotes(true)}}>Notes</button>
                        <button className="buttonBlue toolbarItem" onClick={() => {setDisplayNotes(false)}}>Detentions</button>
                    </div>
                    <div className="innerBody">
                        <UserCard user={student} />
                        {displayNotes ?
                            <>
                                {addNotes ?
                                    <>
                                        <p className="pageTitle">Add Note</p>
                                        <AddNotes classID={classID} studentID={studentID} setNotesLength={setNotesLength} />
                                        <button style={{margin: "50px 0 0 0"}} className="buttonOrange" onClick={() => {refreshNotes()}}>Cancel</button>
                                    </>
                                :
                                    <>
                                        <p className="pageTitle">Student Notes</p>
                                        {currentUser.position === "teacher" && currentUser.id === student.teacher_id &&
                                            <button style={{margin: "25px 0 0 0"}} className="buttonBlue" onClick={() => {setAddNotes(true)}}>Add Note</button>
                                        }
                                        {notes.map((note, i) => {
                                            return (
                                                <div key={i}>
                                                    {editNotes[i] && currentUser.position === "teacher" ?
                                                        <>
                                                            <form method="PUT" onSubmit={updateNote} id={i}>
                                                                <textarea style={{margin: "25px 0 0 0"}} className="textAreaInput" type="text" name="note" placeholder="Note" maxLength="150" rows="4" value={updateNotes[i]} onChange={e => {setUpdateNotes(previousState => Object.assign([], previousState, {[i]: e.target.value}))}} />
                                                                <div className="formSubmit">
                                                                    <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Update" />
                                                                    <button className="buttonOrange" type="button" onClick={() => {setEditNotes(previousState => Object.assign([], previousState, {[i]: false}))}}>Cancel</button>
                                                                </div>
                                                            </form>
                                                        </>
                                                    :
                                                        <div className="cardPair">
                                                            <NoteCard note={note} />
                                                            {currentUser.position === "teacher" && currentUser.id === student.teacher_id &&
                                                                <>
                                                                    <button style={{margin: "0 15px 0 0"}} className="buttonBlue" onClick={() => {setEditNotes(previousState => Object.assign([], previousState, {[i]: true}))}}>Update</button>
                                                                    <button className="buttonOrange" onClick={() => {deleteNote(note.id, i)}}>Delete</button>
                                                                </>
                                                            }
                                                        </div>
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
                                }
                            </>
                        :
                            <>  
                                {addDetentions ?
                                    <>
                                        <p className="pageTitle">Add Detention</p>
                                        <AddDetentions classID={classID} studentID={studentID} setDetentionsLength={setDetentionsLength} />
                                        <button style={{margin: "50px 0 0 0"}} className="buttonOrange" onClick={() => {refreshDetentions()}}>Cancel</button>
                                    </>
                                :
                                    <>
                                        <p className="pageTitle">Detentions</p>
                                        {currentUser.position === "teacher" && currentUser.id === student.teacher_id &&
                                            <button style={{margin: "25px 0 0 0"}} className="buttonBlue" onClick={() => {setAddDetentions(true)}}>Add Detention</button>
                                        }
                                        {detentions.map((detention, i) => {
                                            return (
                                                <div key={i}>
                                                    {editDetentions[i] && currentUser.position === "teacher" ?
                                                        <>
                                                            <form method="PUT" onSubmit={updateDetention} id={i}>
                                                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                                                    <input className="textInput" type="text" name="location" placeholder="Location" value={updateDetentions[i].location} onChange={e => {setUpdateDetentions(previousState => Object.assign([], previousState, {[i]: {
                                                                        id: previousState[i].id,
                                                                        date: previousState[i].date,
                                                                        location: e.target.value,
                                                                        reason: previousState[i].reason
                                                                    }}))}} />
                                                                    <textarea style={{margin: "0 0 15px 0"}} className="textAreaInput" type="text" name="reason" placeholder="Reason" maxLength="125" rows="4" value={updateDetentions[i].reason} onChange={e => {setUpdateDetentions(previousState => Object.assign([], previousState, {[i]: {
                                                                        id: previousState[i].id,
                                                                        date: previousState[i].date,
                                                                        location: previousState[i].location,
                                                                        reason: e.target.value
                                                                    }}))}} />
                                                                </div>
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
                                                                <div className="formSubmit">
                                                                    <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Update Detention" />
                                                                    <button className="buttonOrange" type="button" onClick={() => {setEditDetentions(previousState => Object.assign([], previousState, {[i]: false}))}}>Cancel</button>
                                                                </div>
                                                            </form>
                                                        </>
                                                    :
                                                        <>
                                                            <div className="cardPair">
                                                                <DetentionCardClass detention={detention} />
                                                                {currentUser.position === "teacher" && currentUser.id === student.teacher_id &&
                                                                    <>
                                                                        <button style={{margin: "0 15px 0 0"}} className="buttonBlue" onClick={() => {setEditDetentions(previousState => Object.assign([], previousState, {[i]: true}))}}>Update</button>
                                                                        <button className="buttonOrange" onClick={() => {deleteDetention(detention.id, i)}}>Delete</button>
                                                                    </>
                                                                }
                                                            </div>
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
                        {displayUpdatedMessage && <MessageCard message={"Updated"} />}
                        {displayDeletedMessage && <MessageCard message={"Deleted"} />}
                        {displayErrorMessage && <MessageCard message={error} />}
                    </div>
                    
                </>
            }
        </>
    )
}

export default Student