import React, {createContext, useEffect, useState} from 'react'

export const CompletedContext = createContext(false)

const CompletedContextProvider = (props) => {
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('completed'));

        if (localData !== null) {
            setCompleted(localData);
        }
    }, [])

    const changeCompleted = () => {
        setCompleted(state => !state);
    }

    useEffect(() => {
        localStorage.setItem('completed', completed);
    }, [completed])

    return (
        <CompletedContext.Provider value={{completed, changeCompleted}}>
            {props.children}
        </CompletedContext.Provider>
    )
}

export default CompletedContextProvider
