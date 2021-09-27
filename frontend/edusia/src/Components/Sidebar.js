import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
import authAPI from "../API/auth"
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListAltIcon from '@material-ui/icons/ListAlt';
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
                        <img src={`http://localhost:5000/uploads/${currentUser.picture}`} className="currentUserPictureExpanded" />
                        <p className="currentUserName">{currentUser.name}</p>
                    </div>
                    <div className="sideBarPages">
                        <Link className="sideBarLink" to={`/home`}>Home</Link>
                        {currentUser.position === "student" &&
                            <>
                                <Link className="sideBarLink" to={`/noticeboard`}>Notice Board</Link>
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
                        <img src={`http://localhost:5000/uploads/${currentUser.picture}`} className="currentUserPictureCollapsed" />
                    </div>
                    <div className="sideBarPages">
                        <Link className="sideBarLink" to={`/home`}><ListAltIcon /></Link>
                        {currentUser.position === "student" &&
                            <>
                                <Link className="sideBarLink" to={`/noticeboard`}><AssignmentIcon /></Link>
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
