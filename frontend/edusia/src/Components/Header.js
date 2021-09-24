import React from 'react'
import { Link } from 'react-router-dom'

const Header = ({path}) => {

    const display = () => {
        if (path.length === 1) {
            return <p className="headerLocation">{path[0]}</p>
        } else {
            let content = [];

            for (let i = 0; i < path.length; i++) {
                if (i !== path.length-1) {
                    content.push(<><Link className="headerLocation" to={`/${path[i].link}`}>{path[i].text}</Link><p>|</p></>)
                } else {
                    content.push(<p className="headerLocation">{path[i]}</p>)
                }
            }

            return (
                <div>
                    {content.map((item, i) => {
                        return <div key={i}>{item}</div>
                    })}
                </div>
            )
        }
    }

    return (
        <div className="header">
            {display()}
        </div>
    )
}

export default Header
