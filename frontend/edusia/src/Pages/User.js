import React, {useState, useEffect} from 'react'
import { useParams, useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import usersAPI from "../API/users"

const User = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [user, setUser] = useState();
    const userID = useParams().id;
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await usersAPI.get(`/${userID}`);

                if (user.data.data.user.position === "student" && currentUser.position === "student") {
                    history.replace("/home");
                }

                setUser(user.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData()
    }, [])

    return (
        <>
            {loaded &&
                <>
                    {currentUser.position === "school" &&
                        <>
                            {user.user.position === "teacher" ?
                                <div className="toolbar">
                                    <Link to={`/home/:id/edit-teacher`}>Edit Teacher</Link>
                                </div>
                            :
                                <div className="toolbar">
                                    <Link to={`/home/:id/edit-student`}>Edit Student</Link>
                                </div>
                            }
                        </>
                    }
                </>
            }
        </>
    )
}

export default User
