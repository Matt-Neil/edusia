import React from 'react'
import { Link } from 'react-router-dom'

const ClassCard = ({classesReducer}) => {
    const displayClass = () => {
        return `${classesReducer.subject} (${classesReducer.class_code})`
    }

    return (
        <Link to={`/class/${classesReducer.id}`} className="classCard">
            <p className="classCardTitle">{displayClass()}</p>
        </Link>
    )
}

export default ClassCard
