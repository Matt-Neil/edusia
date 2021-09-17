import React, {createContext, useEffect, useState} from 'react'

export const SidebarContext = createContext(true)

const SidebarContextProvider = (props) => {
    const [sidebar, setSidebar] = useState(true);

    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem('sidebar'));

        if (localData !== null) {
            setSidebar(localData);
        }
    }, [])

    const changeSidebar = () => {
        setSidebar(state => !state);
    }

    useEffect(() => {
        localStorage.setItem('sidebar', sidebar);
    }, [sidebar])

    return (
        <SidebarContext.Provider value={{sidebar, changeSidebar}}>
            {props.children}
        </SidebarContext.Provider>
    )
}

export default SidebarContextProvider
