import React, {useState, useEffect, useContext} from 'react'
import DatePicker from 'react-datepicker'
import notificationsAPI from '../API/notifications'
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from '../Components/MessageCard'

const AddNotifications = ({classID, setNotificationsLength}) => {
    const [notification, setNotification] = useState("");
    const [date, setDate] = useState("");
    const [pickerDate, setPickerDate] = useState(new Date());
    const {displayAddedMessage, displayMessageAddedInterval, displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        let tempDate = pickerDate;
        tempDate.setHours(23, 59, 59, 0);
        setDate(tempDate.toISOString());
    }, [pickerDate])

    const postNotification = async (e) => {
        e.preventDefault();

        if (date === "" || notification === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await notificationsAPI.post("/", {
                    class_id: classID,
                    expire: date,
                    notification: notification
                })
                
                setNotificationsLength(previousState => previousState+1)
                setNotification("");
                setDate("");
                setPickerDate(new Date());
                displayMessageAddedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            } 
        }
    }

    return (
        <>
            <form method="POST" onSubmit={postNotification}>
                <div className="multipleInput">
                    <textarea className="textAreaInput" type="text" name="notification" placeholder="Notification" maxLength="100" rows="3" value={notification} onChange={e => {setNotification(e.target.value)}} />
                    <DatePicker renderCustomHeader={({
                                    monthDate,
                                    customHeaderCount,
                                    decreaseMonth,
                                    increaseMonth,
                                }) => (
                                    <div>
                                        <button aria-label="Previous Month"
                                                type="button"
                                                className={"react-datepicker__navigation react-datepicker__navigation--previous"}
                                                style={customHeaderCount === 1 ? { visibility: "hidden" } : null}
                                                onClick={decreaseMonth}>
                                            <span className={"react-datepicker__navigation-icon react-datepicker__navigation-icon--previous"}>
                                                {"<"}
                                            </span>
                                        </button>
                                        <span className="react-datepicker__current-month">
                                            {monthDate.toLocaleString("en-GB", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <button aria-label="Next Month"
                                                type="button"
                                                className={"react-datepicker__navigation react-datepicker__navigation--next"}
                                                style={customHeaderCount === 0 ? { visibility: "hidden" } : null}
                                                onClick={increaseMonth}>
                                            <span className={"react-datepicker__navigation-icon react-datepicker__navigation-icon--next"}>
                                                {">"}
                                            </span>
                                        </button>
                                    </div>
                                )}
                                monthsShown={2}
                                selected={pickerDate} 
                                onChange={date => {setPickerDate(date)}} 
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date()} 
                                filterDate={date => date.getDay() !== 6 && date.getDay() !== 0}
                                inline
                                placeholderText={"Select Date"} />
                </div>
                <div className="formSubmit">
                    <input className="buttonBlue" type="submit" value="Add Notification" />
                </div>
            </form>
            {displayAddedMessage && <MessageCard message={"Added"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default AddNotifications
