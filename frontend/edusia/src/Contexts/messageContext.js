import React, {createContext, useState} from 'react'

export const MessageContext = createContext(false)

const MessageContextProvider = (props) => {
    const [displayAddedMessage, setDisplayAddedMessage] = useState(false);
    const [displayUpdatedMessage, setDisplayUpdatedMessage] = useState(false);
    const [displayDeletedMessage, setDisplayDeletedMessage] = useState(false);

    const displayMessageAddedInterval = () => {
        setDisplayAddedMessage(true);
        let addedInterval = setInterval(() => {
            setDisplayAddedMessage(false);
        }, 1500)
        return ()=> {clearInterval(addedInterval)};
    }

    const displayMessageUpdatedInterval = () => {
        setDisplayUpdatedMessage(true);
        let updatedInterval = setInterval(() => {
            setDisplayUpdatedMessage(false);
        }, 1500)
        return ()=> {clearInterval(updatedInterval)};
    }

    const displayMessageDeletedInterval = () => {
        setDisplayDeletedMessage(true);
        let deletedInterval = setInterval(() => {
            setDisplayDeletedMessage(false);
        }, 1500)
        return ()=> {clearInterval(deletedInterval)};
    }

    return (
        <MessageContext.Provider value={{displayAddedMessage, displayUpdatedMessage, displayDeletedMessage, 
            displayMessageAddedInterval, displayMessageUpdatedInterval, displayMessageDeletedInterval}}>
            {props.children}
        </MessageContext.Provider>
    )
}

export default MessageContextProvider