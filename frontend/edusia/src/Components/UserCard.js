import React from 'react'

const UserCard = ({userReducer}) => {
    return (
        <div>
            <p>{userReducer.name}</p>
        </div>
    )
}

export default UserCard
