import React, { useState, useContext } from 'react'
import usersAPI from '../API/users'
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from '../Components/MessageCard'

const AddNote = ({classID, studentID, setNotesLength}) => {
    const [note, setNote] = useState("");
    const {displayAddedMessage, displayMessageAddedInterval, displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    const postNote = async (e) => {
        e.preventDefault();

        if (note === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await usersAPI.post(`/student/${studentID}/lesson/notes?class=${classID}`, {
                    class_id: classID,
                    student_id: studentID,
                    note: note,
                    created: new Date().toISOString()
                })

                setNotesLength(previousState => previousState+1)
                setNote("");
                displayMessageAddedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    return (
        <>
            <form method="POST" onSubmit={postNote}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <textarea className="textAreaInput" type="text" name="note" placeholder="Note" maxLength="125" rows="4" value={note} onChange={e => {setNote(e.target.value)}} />
                    <input className="buttonBlue" type="submit" value="Add Note" />
                </div>
            </form>
            {displayAddedMessage && <MessageCard message={"Added"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default AddNote
