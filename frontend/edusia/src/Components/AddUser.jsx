import React, {useState, useContext} from 'react'
import { Link } from 'react-router-dom'
import usersAPI from "../API/users"
import fileAPI from "../API/file"
import { MessageContext } from '../Contexts/messageContext';
import Header from './Header';
import MessageCard from './MessageCard'

const AddUser = ({currentUser, position, setLength}) => {
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

                setLength(previousState => previousState+1)
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
            <img src={`http://localhost:5000/uploads/${pictureName}`} className="settingsPicture" alt="User Avatar" />
            <form method="POST" onSubmit={uploadPicture} encType="multipart/form-data">
                <div>
                    <input className="pictureInput" type="file" name="file" onChange={e => {setPictureFile(e.target.files[0])}} />
                </div>
                <div>
                    <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Upload file" />
                    <button type="button" className="buttonOrange" onClick={() => {removePicture()}}>Remove file</button>
                </div>
            </form>
            <form method="POST" onSubmit={addUser}>
                <div className="form">
                    <input className="textInput" type="text" name="name" placeholder="Name" value={name} onChange={e => {setName(e.target.value)}} />
                    <input style={{margin: "0 0 15px 0"}} className="textInput" type="text" name="username" placeholder="Username" value={username} onChange={e => {setUsername(e.target.value)}} />
                    <input style={{margin: "0 0 15px 0"}} className="textInput" type="text" name="email" placeholder="Email" value={email} onChange={e => {setEmail(e.target.value)}} />
                    <input style={{margin: "0 0 15px 0"}} className="textInput" type="text" name="password" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                </div>
                <input className="buttonBlue" type="submit" value={"Add User"} />
            </form>
            {displayAddedMessage && <MessageCard message={"Added"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default AddUser
