import React, {useState, useEffect, useContext} from 'react'
import homeworkAPI from "../API/homework"
import fileAPI from "../API/file"
import { Link, useHistory, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker'
import { MessageContext } from '../Contexts/messageContext';
import Header from './Header';
import MessageCard from './MessageCard'

const EditHomework = ({homework}) => {
    const [title, setTitle] = useState(homework.title);
    const [description, setDescription] = useState(homework.description);
    const [deadline, setDeadline] = useState(homework.deadline);
    const [pickerDate, setPickerDate] = useState(new Date(homework.deadline));
    const [fileName, setFileName] = useState(homework.file);
    const [file, setFile] = useState("");
    const homeworkID = useParams().id;
    const {displayUpdatedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        let tempDate = pickerDate;
        tempDate.setHours(23, 59, 59, 0);
        setDeadline(tempDate.toISOString());
    }, [pickerDate])

    const updateHomework = async (e) => {
        e.preventDefault();

        if (title === "" || description === "" || deadline === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await homeworkAPI.put(`/${homeworkID}`, {
                    title: title,
                    description: description,
                    deadline: deadline,
                    file: fileName
                })

                displayMessageUpdatedInterval();
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
                setFileName(homework.file);

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
            {homework.file !== "" &&
                <a style={{margin: "25px 0 50px 0"}} href={`http://localhost:5000/uploads/${homework.file}`} download={homework.file} target="_blank">View Attachment</a>
            }
            <form method="PUT" onSubmit={updateHomework} encType="multipart/form-data">
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
                    <input className="buttonBlue" type="submit" value="Update Homework" />
                </div>
            </form>
            {displayUpdatedMessage && <MessageCard message={"Updated"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default EditHomework
