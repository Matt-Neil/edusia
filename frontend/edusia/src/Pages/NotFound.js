import React from 'react'
import Header from '../Components/Header'

const NotFound = () => {
    return (
        <div>
            <Header path={[{text: "Home", link: ""}, "Not Found"]} />
            <p>Not Found</p>
        </div>
    )
}

export default NotFound
