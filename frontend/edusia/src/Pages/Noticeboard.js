import React, {useState, useEffect, useContext} from 'react'
import usersAPI from '../API/users'
import Header from '../Components/Header';
import NotificationCard from '../Components/NotificationCard';
import DetentionCard from '../Components/DetentionCard'
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from '../Components/MessageCard'
import { useHistory } from 'react-router-dom';

const Noticeboard = ({currentUser}) => {
    const [notifications, setNotifications] = useState();
    const [detentions, setDetentions] = useState();
    const [displayNotifications, setDisplayNotifications] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const {displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext)
    const history = useHistory()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (currentUser.position !== "student") {
                    history.replace("/home");
                } else {
                    const notifications = await usersAPI.get(`/notifications`);
                    const detentions = await usersAPI.get(`/detentions`);

                    setNotifications(notifications.data.data);
                    setDetentions(detentions.data.data);
                    setLoaded(true);
                }
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
                        <button className="toolbarItem buttonBlue" onClick={() => {setDisplayNotifications(true)}}>Notifications</button>
                        <button className="toolbarItem buttonBlue" onClick={() => {setDisplayNotifications(false)}}>Detentions</button>
                    </div>
                    <div className="innerBody">
                        {displayNotifications ?
                            <>
                                <p className="pageTitle">Notifications</p>
                                <div className="displayCardsRow">
                                    {notifications.filter((notificationFilter) => notificationFilter.expire > new Date().toISOString()).map((notification, i) => {
                                        return (
                                            <div key={i}>
                                                <NotificationCard notification={notification} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        :
                            <>
                                <p className="pageTitle">Detentions</p>
                                <div className="displayCardsRow">
                                    {detentions.filter((detentionFilter) => detentionFilter.date > new Date().toISOString()).map((detention, i) => {
                                        return (
                                            <div key={i}>
                                                <DetentionCard detention={detention} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        }
                        {displayErrorMessage && <MessageCard message={error} />}
                    </div>
                </>
            }
        </>
    )
}

export default Noticeboard
