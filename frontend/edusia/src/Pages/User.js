import React, {useState, useEffect, useContext} from 'react'
import { useParams, useHistory } from 'react-router';
import usersAPI from "../API/users"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import ClassCard from '../Components/ClassCard';
import MessageCard from '../Components/MessageCard'

const User = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [user, setUser] = useState();
    const [classes, setClasses] = useState();
    const userID = useParams().id;
    const history = useHistory();
    const {displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await usersAPI.get(`/${userID}`);

                if (user.data.data) {
                    if (user.data.data.user.position === "student" && currentUser.position === "student") {
                        history.replace("/home");
                    } else {
                        if (currentUser.position !== "student") {
                            setClasses(user.data.data.classes);
                        }
    
                        setUser(user.data.data.user);
                        setLoaded(true);
                    }
                } else {
                    history.replace("/home");
                }
            } catch (err) {
                displayMessageErrorInterval("Error Loading Page")
            }
        }
        fetchData()
    }, [])

    const deleteUser = async () => {
        try {
            await usersAPI.delete(`/${userID}/edit`)

            history.replace("/home")
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const displayUser = () => {
        return `${user.name} (${user.username})`
    }

    return (
        <>
            {loaded &&
                <>  
                    <Header path={[{text: "Home", link: "/"}, `${user.name} (${user.username})`]} />
                    {currentUser.position === "school" &&
                        <div className="toolbar">
                            <button className="buttonBlue toolbarItem">Edit User</button>
                            <button className="buttonOrange toolbarItem" onClick={() => {deleteUser()}}>Delete User</button>
                        </div>
                    }
                    <div className="innerBody">
                        <div className="userBox">
                            <img className="userPicture" src={`http://localhost:5000/uploads/${user.picture}`} />
                            <div className="userInfo">
                                <p className="userName">{displayUser()}</p>
                                <p className="userEmail">{user.email}</p>
                            </div>
                        </div>
                        <p className="pageTitle">Classes</p>
                        {currentUser.position !== "student" &&
                            <div className="userPageRows">
                                {classes.map((classesReducer, i) => {
                                    return <ClassCard classesReducer={classesReducer} key={i} />
                                })}
                            </div>
                        }
                        {displayErrorMessage && <MessageCard message={error} />}
                    </div>
                </>
            }
        </>
    )
}

export default User
