import React, {createContext, useEffect, useState} from 'react'

export const ExpiredContext = createContext(false)

const ExpiredContextProvider = (props) => {
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('expired'));

        if (localData !== null) {
            setExpired(localData);
        }
    }, [])

    const changeExpired = () => {
        setExpired(state => !state);
    }

    useEffect(() => {
        localStorage.setItem('expired', expired);
    }, [expired])

    return (
        <ExpiredContext.Provider value={{expired, changeExpired}}>
            {props.children}
        </ExpiredContext.Provider>
    )
}

export default ExpiredContextProvider
