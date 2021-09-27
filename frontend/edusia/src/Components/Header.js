import React from 'react'
import { Link } from 'react-router-dom'

const Header = ({path}) => {

    const display = () => {
        if (path.length === 1) {
            return (
                <div className="header">
                    <p className="headerLocation">{path[0]}</p>
                </div>
            ) 
        } else {
            let content = [];

            for (let i = 0; i < path.length; i++) {
                if (i !== path.length-1) {
                    content.push(<div className="headerPair"><Link className="headerPath" to={`${path[i].link}`}>{path[i].text}</Link><p>|</p></div>)
                } else {
                    content.push(<p className="headerLocation">{path[i]}</p>)
                }
            }

            return (
                <div className="header">
                    {content.map((item, i) => {
                        return <div key={i}>{item}</div>
                    })}
                </div>
            )
        }
    }

    return (
        <>
            {display()}
        </>
    )
}

export default Header
