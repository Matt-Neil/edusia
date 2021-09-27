import React from 'react'
import { Link } from 'react-router-dom'

const StudentCard = ({user, classID}) => {
    const displayUser = () => {
        return `${user.name} (${user.username})`
    }

    return (
        <Link className="userCard" to={`/student/${user.id}/${classID}`}>
            <img className="userCardPicture" src={`http://localhost:5000/uploads/${user.picture}`} />
            <p className="userCardTitle">{displayUser()}</p>
        </Link>
    )
}

export default StudentCard
