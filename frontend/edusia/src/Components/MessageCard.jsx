import React from 'react'

const MessageCard = ({message}) => {
    return (
        <div className="messageCard">
            <p className="messageCardText">{message}</p>
        </div>
    )
}

export default MessageCard
