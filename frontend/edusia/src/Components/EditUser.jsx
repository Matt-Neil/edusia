import React, {useState, useEffect, useContext} from 'react'
import { useParams } from 'react-router-dom'
import usersAPI from "../API/users"
import imageAPI from "../API/file"
import { MessageContext } from '../Contexts/messageContext';
import MessageCard from './MessageCard'

const EditUser = ({user}) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [username, setUsername] = useState(user.username);
    const [pictureFile, setPictureFile] = useState("");
    const [pictureName, setPictureName] = useState(user.picture);
    const [password, setPassword] = useState("");
    const userID = useParams().id;
    const {displayUpdatedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);

    const uploadPicture = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('uploadedFile', pictureFile);

        try {
            const uploadResponse = await imageAPI.post("/upload", formData);

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
                setPictureName(user.picture);

                await imageAPI.put('/remove', {file: temp});
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const editUser = async (e) => {
        e.preventDefault();

        if (name === "" || username === "" || email === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                let tempPassword = password;

                if (password === "") {
                    tempPassword = user.password;
                }

                await usersAPI.put(`/${userID}/edit`, 
                {
                    name: name,
                    username: username,
                    email: email,
                    password: tempPassword,
                    picture: pictureName
                });

                displayMessageUpdatedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    return (
        <>
            <img style={{margin: "25px 0 0 0"}} src={`http://localhost:5000/uploads/${pictureName}`} className="userPicture" alt="User Avatar" />
            <form method="POST" onSubmit={uploadPicture} encType="multipart/form-data">
                <div>
                    <input className="pictureInput" type="file" name="uploadedFile" onChange={e => {setPictureFile(e.target.files[0])}} />
                </div>
                <div>
                    <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Upload image" />
                    <button type="button" className="buttonOrange" onClick={() => {removePicture()}}>Remove image</button>
                </div>
            </form>
            <form method="POST" onSubmit={editUser}>
                <div className="form">
                    <input className="textInput" type="text" name="name" placeholder="Name" value={name} onChange={e => {setName(e.target.value)}} />
                    <input style={{margin: "0 0 15px 0"}} className="textInput" type="text" name="username" placeholder="Username" value={username} onChange={e => {setUsername(e.target.value)}} />
                    <input style={{margin: "0 0 15px 0"}} className="textInput" type="text" name="email" placeholder="Email" value={email} onChange={e => {setEmail(e.target.value)}} />
                    <input style={{margin: "0 0 15px 0"}} className="textInput" type="password" name="password" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                </div>
                <div className="formSubmit">
                    <input className="buttonBlue" type="submit" value="Update" />
                </div>
            </form>
            {displayUpdatedMessage && <MessageCard message={"Updated"} />}
            {displayErrorMessage && <MessageCard message={error} />}
        </>
    )
}

export default EditUser
