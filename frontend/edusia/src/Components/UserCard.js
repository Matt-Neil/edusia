import React from 'react'
import { Link } from 'react-router-dom'

const UserCard = ({user}) => {
    const displayUser = () => {
        return `${user.name} (${user.username})`
    }

    return (
        <Link className="userCard" to={`/user/${user.id}`}>
            <img className="userCardPicture" src={`http://localhost:5000/uploads/${user.picture}`} />
            <p className="userCardTitle">{displayUser()}</p>
        </Link>
    )
}

export default UserCard
