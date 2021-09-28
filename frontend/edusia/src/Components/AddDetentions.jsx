import React, { useState, useContext, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import usersAPI from '../API/users'
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from '../Components/MessageCard'

const AddDetentions = ({classID, studentID, setDetentionsLength}) => {
    const [detentionLocation, setDetentionLocation] = useState("");
    const [detentionReason, setDetentionReason] = useState("");
    const [detentionDate, setDetentionDate] = useState("");
    const [pickerDate, setPickerDate] = useState(new Date());
    const {displayAddedMessage, displayMessageAddedInterval, displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        let tempDate = pickerDate;
        tempDate.setHours(14, 59, 59, 0);
        setDetentionDate(tempDate.toISOString());
    }, [pickerDate])

    const postDetention = async (e) => {
        e.preventDefault();

        if (detentionLocation === "" || detentionDate === "" || detentionReason === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await usersAPI.post(`/student/${studentID}/lesson/detentions?class=${classID}`, {
                    class_id: classID,
                    student_id: studentID,
                    location: detentionLocation,
                    date: detentionDate,
                    reason: detentionReason
                })
                
                setDetentionsLength(previousState => previousState+1)
                setPickerDate(new Date());
                setDetentionLocation("");
                setDetentionDate("");
                setDetentionReason("");
                displayMessageAddedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    return (
        <>
            <form method="POST" onSubmit={postDetention}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <input className="textInput" type="text" name="location" placeholder="Location" value={detentionLocation} onChange={e => {setDetentionLocation(e.target.value)}} />
                    <textarea style={{margin: "0 0 15px 0"}} className="textAreaInput" type="text" name="reason" placeholder="Reason" maxLength="125" rows="4" value={detentionReason} onChange={e => {setDetentionReason(e.target.value)}} />
                </div>
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
                <input className="buttonBlue formSubmit" type="submit" value="Add Detention" />
            </form>
            {displayAddedMessage && <MessageCard message={"Added"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default AddDetentions
