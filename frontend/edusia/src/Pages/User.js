import React, {useState, useEffect, useContext} from 'react'
import { useParams, useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import usersAPI from "../API/users"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';

const User = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [user, setUser] = useState();
    const userID = useParams().id;
    const history = useHistory();
    const {displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await usersAPI.get(`/${userID}`);

                if (response.data.data.user.position === "student" && currentUser.position === "student") {
                    history.replace("/home");
                } else {
                    setUser(response.data.data.user);
                    setLoaded(true);
                }
            } catch (err) {
                displayMessageErrorInterval("Error Loading Page")
            }
        }
        fetchData()
    }, [])

    return (
        <>
            {loaded &&
                <>  
                    <Header path={[{text: "Home", link: ""}, `${user.name} (${user.username})`]} />
                    {currentUser.position === "school" &&
                        <>
                            {user.user.position === "teacher" ?
                                <div className="toolbar">
                                    <Link to={`/home/${user.id}/edit-teacher`}>Edit Teacher</Link>
                                </div>
                            :
                                <div className="toolbar">
                                    <Link to={`/home/${user.id}/edit-student`}>Edit Student</Link>
                                </div>
                            }
                        </>
                    }
                    {displayErrorMessage && <p>{error}</p>}
                </>
            }
        </>
    )
}

export default User
