import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'

const Header = ({currentUser}) => {

    return (
        <div className="header">
            {currentUser.position === "student" &&
                <p className="headerLocation">My Homework</p>
            }
            {currentUser.position === "teacher" &&
                <p className="headerLocation">My Classes</p>
            }
            {currentUser.position === "school" &&
                <p className="headerLocation">Home</p>
            }
        </div>
    )
}

export default Header
