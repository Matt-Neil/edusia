import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
import authAPI from "../API/auth"
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListAltIcon from '@material-ui/icons/ListAlt';
import HomeIcon from '@material-ui/icons/Home';
import { SidebarContext } from '../Contexts/sidebarContext';
import { CurrentUserContext } from '../Contexts/currentUserContext';

const Sidebar = ({currentUser}) => {
    const {sidebar, changeSidebar} = useContext(SidebarContext);
    const {removeCurrentUser} = useContext(CurrentUserContext);

    const logout = async () => {
        await authAPI.get("/logout");

        removeCurrentUser();

        if (typeof window !== 'undefined') {
            window.location = `/sign-in`
        }
    }

    return (
        <>
            {sidebar ?
                <div className="sideBarExpanded">
                    <div className="sideBarTitle">
                        <p className="titleExpanded">edusia</p>
                    </div>
                    <div className="sideBarUser">
                        <img src={`http://localhost:5000/uploads/${currentUser.picture}`} className="userPictureExpanded" />
                        <p className="text2 userName">{currentUser.name}</p>
                    </div>
                    <div className="sideBarPages">
                        {currentUser.position === "student" &&
                            <>
                                <Link className="sideBarLink" to={`/home`}>My Homework</Link>
                                <Link className="sideBarLink" to={`/noticeboard`}>Notice Board</Link>
                            </>
                        }
                        {currentUser.position === "teacher" &&
                            <>
                                <Link className="sideBarLink" to={`/home`}>My Classes</Link>
                            </>
                        }
                        {currentUser.position === "school" &&
                            <>
                                <Link className="sideBarLink" to={`/home`}>Home</Link>
                            </>
                        }
                        <Link className="sideBarLink" to={`/settings`}>Settings</Link>
                        <p className="sideBarLink" onClick={() => {logout()}}>Logout</p>
                        <ArrowBackIosIcon className="sideBarCollapse" onClick={() => {changeSidebar(false)}} />
                    </div>
                </div>
            :
                <div className="sideBarCollapsed">
                    <div className="sideBarTitle">
                        <p className="titleCollapsed">ed</p>
                    </div>
                    <div className="sideBarUser">
                        <img src={`http://localhost:5000/uploads/${currentUser.picture}`} className="userPictureCollapsed" />
                    </div>
                    <div className="sideBarPages">
                        {currentUser.position === "student" &&
                            <>
                                <Link className="sideBarLink" to={`/home`}><ListAltIcon /></Link>
                                <Link className="sideBarLink" to={`/noticeboard`}><AssignmentIcon /></Link>
                            </>
                        }
                        {currentUser.position === "teacher" &&
                            <>
                                <Link className="sideBarLink" to={`/home`}><ImportContactsIcon /></Link>
                            </>
                        }
                        {currentUser.position === "school" &&
                            <>
                                <Link className="sideBarLink" to={`/home`}><HomeIcon /></Link>
                            </>
                        }
                        <Link className="sideBarLink" to={`/settings`}><SettingsIcon /></Link>
                        <p className="sideBarLink" onClick={() => {logout()}}><ExitToAppIcon /></p>
                        <ArrowForwardIosIcon className="sideBarCollapse" onClick={() => {changeSidebar(true)}} />
                    </div>
                </div>
            }
        </>
    )
}

export default Sidebar
