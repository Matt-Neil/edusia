import React, {useState, useEffect, useContext} from 'react'
import homeworkAPI from "../API/homework"
import fileAPI from "../API/file"
import classesAPI from "../API/classes"
import usersAPI from "../API/users"
import { Link, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker'
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';

const AddHomework = ({currentUser}) => {
    const [classes, setClasses] = useState();
    const [students, setStudents] = useState();
    const [loaded, setLoaded] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [pickerDate, setPickerDate] = useState(new Date());
    const [fileName, setFileName] = useState("");
    const [file, setFile] = useState("");
    const classID = useParams().id;
    const {displayAddedMessage, displayMessageAddedInterval} = useContext(MessageContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const students = await usersAPI.get(`/students/${classID}/lesson`);
                const classes = await classesAPI.get(`/${classID}`);
                
                setClasses(classes);
                setStudents(students.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData()
    }, [])

    useEffect(() => {
        let tempDate = pickerDate;
        tempDate.setHours(23, 59, 59, 0);
        setDeadline(tempDate.toISOString());
    }, [pickerDate])

    const postHomework = async (e) => {
        e.preventDefault();

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
            
            setTitle("");
            setDescription("");
            setDeadline("");
            setFileName("");
            setPickerDate(new Date())
            displayMessageAddedInterval();
        } catch (err) {}
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
        } catch (err) {}
    }

    const removeFile = async () => {
        try {
            if (fileName !== "") {
                const temp = fileName;

                setFile("");
                setFileName("");

                await fileAPI.put('/remove', {file: temp});
            }
        } catch (err) {}
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: ""}, {text: `Class ${classes.class_code}`, link: `/class/${classID}`}, "Add Homework"]} />
                    <div className="toolbar">
                        <Link to={`/class/${classID}`}>Return to Class</Link>
                    </div>
                    <form method="POST" onSubmit={uploadFile} encType="multipart/form-data">
                        <div>
                            <input className="fileInput" type="file" name="uploadedFile" onChange={e => {setFile(e.target.files[0])}} />
                        </div>
                        <div>
                            <input className="pictureUpload text4" type="submit" value="Upload file" />
                            <button type="button" className="pictureRemove text4" onClick={() => {removeFile()}}>Remove File</button>
                        </div>
                    </form>
                    <form method="PUT" onSubmit={postHomework} encType="multipart/form-data">
                        <div>
                            <input className="fileInput" type="text" name="title" placeholder="Title" value={title} onChange={e => {setTitle(e.target.value)}} />
                            <input className="fileInput" type="text" name="description" placeholder="Description" value={description} onChange={e => {setDescription(e.target.value)}} />
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
                        <div>
                            <input className="pictureUpload text4" type="submit" value="Add Homework" />
                        </div>
                    </form>
                    {displayAddedMessage && <p>Added</p>}
                </>
            }
        </>
    )
}

export default AddHomework