import React from 'react'
import { Link } from 'react-router-dom'

const ClassCard = ({classesReducer}) => {

    return (
        <Link to={`/class/${classesReducer._id}`} className="classCard">
            <p className="classCardTitle">{classesReducer.lesson}</p>
            <p className="classCardInfo">{classesReducer.subject}</p>
        </Link>
    )
}

export default ClassCard
