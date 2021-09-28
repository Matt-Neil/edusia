import React, {useState, useEffect, useContext} from 'react'
import homeworkAPI from "../API/homework"
import fileAPI from "../API/file"
import DatePicker from 'react-datepicker'
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from '../Components/MessageCard'

const AddHomework = ({currentUser, classID, students, setHomeworkLength}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [pickerDate, setPickerDate] = useState(new Date());
    const [fileName, setFileName] = useState("");
    const [file, setFile] = useState("");
    const {displayAddedMessage, displayMessageAddedInterval, displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        let tempDate = pickerDate;
        tempDate.setHours(23, 59, 59, 0);
        setDeadline(tempDate.toISOString());
    }, [pickerDate])

    const postHomework = async (e) => {
        e.preventDefault();

        if (title === "" || description === "" || deadline === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await homeworkAPI.post("/", {
                    class_id: classID,
                    teacher_id: currentUser.id,
                    title: title,
                    description: description,
                    deadline: deadline,
                    file: fileName,
                    students: students
                })
                
                setHomeworkLength(previousState => previousState+1)
                setTitle("");
                setDescription("");
                setDeadline("");
                setFileName("");
                setPickerDate(new Date())
                displayMessageAddedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    const uploadFile = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('uploadedFile', file);

        try {
            const uploadResponse = await fileAPI.post("/upload", formData);
            
            setFileName(uploadResponse.data.data);

            if (fileName !== "") {
                await fileAPI.put('/remove', {file: fileName});
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const removeFile = async () => {
        try {
            if (fileName !== "") {
                const temp = fileName;

                setFile("");
                setFileName("");

                await fileAPI.put('/remove', {file: temp});
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    return (
        <>
            <form style={{margin: "25px 0 15px 0"}} method="POST" onSubmit={uploadFile} encType="multipart/form-data">
                <div>
                    <input className="fileInput" type="file" name="uploadedFile" onChange={e => {setFile(e.target.files[0])}} />
                </div>
                <div className="formSubmit">
                    <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Upload file" />
                    <button type="button" className="buttonOrange" onClick={() => {removeFile()}}>Remove File</button>
                </div>
            </form>
            <form method="POST" onSubmit={postHomework} encType="multipart/form-data">
                <div className="form">
                    <input className="textInput" type="text" name="title" placeholder="Title" value={title} onChange={e => {setTitle(e.target.value)}} />
                    <textarea style={{margin: "0 0 15px 0"}} className="textAreaInput" type="text" name="description" placeholder="Description" maxLength="125" rows="4" value={description} onChange={e => {setDescription(e.target.value)}} />
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
                    <input className="buttonBlue" type="submit" value="Add Homework" />
                </div>
            </form>
            {displayAddedMessage && <MessageCard message={"Added"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default AddHomework