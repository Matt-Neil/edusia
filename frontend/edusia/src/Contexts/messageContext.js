import React, {createContext, useState, useRef} from 'react'

export const MessageContext = createContext(false)

const MessageContextProvider = (props) => {
    const [displayAddedMessage, setDisplayAddedMessage] = useState(false);
    const [displayUpdatedMessage, setDisplayUpdatedMessage] = useState(false);
    const [displayDeletedMessage, setDisplayDeletedMessage] = useState(false);
    const [displayErrorMessage, setDisplayErrorMessage] = useState(false);
    const [error, setError] = useState("");
    const addedInterval = useRef(0);
    const updatedInterval = useRef(0);
    const deletedInterval = useRef(0);
    const errorInterval = useRef(0);

    const displayMessageAddedInterval = () => {
        clearInterval(addedInterval.current)
        setDisplayAddedMessage(true);
        addedInterval.current = setInterval(() => {
            setDisplayAddedMessage(false);
        }, 1500)
        return ()=> {clearInterval(addedInterval.current)};
    }

    const displayMessageUpdatedInterval = () => {
        clearInterval(updatedInterval.current)
        setDisplayUpdatedMessage(true);
        updatedInterval.current = setInterval(() => {
            setDisplayUpdatedMessage(false);
        }, 1500)
        return ()=> {clearInterval(updatedInterval.current)};
    }

    const displayMessageDeletedInterval = () => {
        clearInterval(deletedInterval.current)
        setDisplayDeletedMessage(true);
        deletedInterval.current = setInterval(() => {
            setDisplayDeletedMessage(false);
        }, 1500)
        return ()=> {clearInterval(deletedInterval.current)};
    }

    const displayMessageErrorInterval = (error) => {
        clearInterval(errorInterval.current)
        setError(error);
        setDisplayErrorMessage(true);
        errorInterval.current = setInterval(() => {
            setDisplayErrorMessage(false);
        }, 1500)
        return ()=> {clearInterval(errorInterval.current)};
    }

    return (
        <MessageContext.Provider value={{displayAddedMessage, displayUpdatedMessage, displayDeletedMessage, displayErrorMessage,
            displayMessageAddedInterval, displayMessageUpdatedInterval, displayMessageDeletedInterval, displayMessageErrorInterval, error}}>
            {props.children}
        </MessageContext.Provider>
    )
}

export default MessageContextProvider