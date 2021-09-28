import React, {useState, useEffect, useContext} from 'react'
import DatePicker from 'react-datepicker'
import testsAPI from '../API/tests'
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from '../Components/MessageCard'

const AddTests = ({classID, students, setTestsLength}) => {
    const [title, setTitle] = useState("");
    const [testDate, setTestDate] = useState("");
    const [pickerDate, setPickerDate] = useState(new Date());
    const {displayAddedMessage, displayMessageAddedInterval, displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        let tempDate = pickerDate;
        tempDate.setHours(23, 59, 59, 0);
        setTestDate(tempDate.toISOString());
    }, [pickerDate])

    const postTest = async (e) => {
        e.preventDefault();

        if (title === "" || testDate === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await testsAPI.post(`/${classID}`, {
                    title: title,
                    date: testDate,
                    students: students
                })

                setTestsLength(previousState => previousState+1)
                setTitle("");
                setTestDate("");
                setPickerDate(new Date());
                displayMessageAddedInterval()
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    return (
        <>
            <form method="POST" onSubmit={postTest}>
                <textarea className="textAreaInput" type="text" name="title" placeholder="Title" maxLength="100" rows="3" value={title} onChange={e => {setTitle(e.target.value)}} />
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
                <div className="formSubmit">
                    <input className="buttonBlue" type="submit" value="Add Test" />
                </div>
            </form>
            {displayAddedMessage && <MessageCard message={"Added"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default AddTests
