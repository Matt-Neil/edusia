import React, {useState, useContext} from 'react'
import { Link } from 'react-router-dom'
import usersAPI from "../API/users"
import fileAPI from "../API/file"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';

const AddUser = ({currentUser, position}) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [pictureFile, setPictureFile] = useState("");
    const [pictureName, setPictureName] = useState("default.png");
    const [password, setPassword] = useState();
    const {displayAddedMessage, displayMessageAddedInterval, displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    const uploadPicture = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('picture', pictureFile);

        try {
            const uploadResponse = await fileAPI.post("/upload", formData);

            setPictureName(uploadResponse.data.data);
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const removePicture = async () => {
        try {
            if (pictureFile !== "" && pictureName !== "default.png") {
                const temp = pictureName;
                setPictureFile("");
                setPictureName("default.png");

                await fileAPI.put('/remove', {picture: temp});
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const addUser = async (e) => {
        e.preventDefault();

        if (name === "" || email === "" || username === "" || password === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                await usersAPI.post(`/${currentUser.id}`, 
                {
                    name: name,
                    username: username,
                    email: email,
                    password: password,
                    picture: pictureName,
                    position: position,
                    school_id: currentUser.id
                });

                setName("");
                setEmail("");
                setUsername("");
                setPassword("");
                setPictureFile("");
                setPictureName("default.png");
                displayMessageAddedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    return (
        <>
            <Header path={[{text: "Home", link: ""}, "Add User"]} />
            <div className="toolbar">
                <Link to={`/home/add-student`}>Add Student</Link>
                <Link to={`/home/add-teacher`}>Add Teacher</Link>
                <Link to={`/home/add-class`}>Add Class</Link>
                <Link to={`/home`}>Return Home</Link>
            </div>
            <img src={`http://localhost:5000/uploads/${pictureName}`} className="img4" alt="User Avatar" />
            <form method="POST" onSubmit={uploadPicture} encType="multipart/form-data">
                <div>
                    <input className="pictureInput" type="file" name="file" onChange={e => {setPictureFile(e.target.files[0])}} />
                </div>
                <div>
                    <input className="pictureUpload text4" type="submit" value="Upload file" />
                    <button type="button" className="pictureRemove text4" onClick={() => {removePicture()}}>Remove file</button>
                </div>
            </form>
            <form className="loginBody" method="POST" onSubmit={addUser}>
                <div className="multipleInput">
                    <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Name" value={name} onChange={e => {setName(e.target.value)}} />
                    <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Username" value={username} onChange={e => {setUsername(e.target.value)}} />
                    <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Email" value={email} onChange={e => {setEmail(e.target.value)}} />
                    <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                </div>
                <div className="formSubmit">
                    <input className="loginButton text4" type="submit" value={"Add User"} />
                </div>
            </form>
            {displayAddedMessage && <p>Added</p>}
            {displayErrorMessage && <p>{error}</p>}
        </>
    )
}

export default AddUser
