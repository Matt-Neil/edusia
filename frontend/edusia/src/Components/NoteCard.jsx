import React from 'react'
const moment = require('moment');

const NoteCard = ({note}) => {
    const date = moment(note.created);

    const displayDate = () => {
        return date.utc().format("DD/MM/YYYY")
    }

    return (
        <div className="noteCard">
            <div className="noteCardBox">
                <p className="noteCardTitle">{note.note}</p>
            </div>
            <p className="noteCardInfo">Created: {displayDate()}</p>
        </div>
    )
}

export default NoteCard
