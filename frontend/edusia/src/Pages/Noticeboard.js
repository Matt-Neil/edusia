import React, {useState, useEffect, useContext} from 'react'
import usersAPI from '../API/users'
import Header from '../Components/Header';
import { MessageContext } from '../Contexts/messageContext';

const Noticeboard = ({currentUser}) => {
    const [notifications, setNotifications] = useState();
    const [detentions, setDetentions] = useState();
    const [displayNotifications, setDisplayNotifications] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const {displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const notifications = await usersAPI.get(`/notifications`);
                const detentions = await usersAPI.get(`/detentions`);

                setNotifications(notifications.data.data);
                setDetentions(detentions.data.data);
                setLoaded(true);
            } catch (err) {
                displayMessageErrorInterval("Error Loading Page")
            }
        }
        fetchData();
    }, [])

    return (
        <>
            {loaded &&
                <>
                    <Header path={["Noticeboard"]} />
                    <div className="toolbar">
                        <button onClick={() => {setDisplayNotifications(true)}}>Notifications</button>
                        <button onClick={() => {setDisplayNotifications(false)}}>Detentions</button>
                    </div>
                    {displayNotifications ?
                        <>
                            {notifications && notifications.filter((notificationFilter) => notificationFilter.deadline > new Date().toISOString()).map((notification, i) => {
                                return (
                                    <div key={i}>
                                        
                                    </div>
                                )
                            })}
                        </>
                    :
                        <>
                            {detentions && detentions.filter((detentionFilter) => detentionFilter.deadline > new Date().toISOString()).map((detention, i) => {
                                return (
                                    <div key={i}>
                                        
                                    </div>
                                )
                            })}
                        </>
                    }
                    {displayErrorMessage && <p>{error}</p>}
                </>
            }
        </>
    )
}

export default Noticeboard
