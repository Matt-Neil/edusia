import React, {useState, useEffect, useContext} from 'react'
import usersAPI from "../API/users"
import fileAPI from "../API/file"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';

const Settings = () => {
    const [user, setUser] = useState();
    const [pictureFile, setPictureFile] = useState("");
    const [pictureName, setPictureName] = useState("");
    const [password, setPassword] = useState("");
    const [loaded, setLoaded] = useState(false);
    const {displayUpdatedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await usersAPI.get("/settings");

                setUser(response.data.data);
                setLoaded(true);
            } catch (err) {
                displayMessageErrorInterval("Error Loading Page")
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (loaded) {
            setPictureName(user.picture);
        }
    }, [loaded])

    const uploadPicture = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('uploadedFile', pictureFile);

        try {
            const uploadResponse = await fileAPI.post("/upload", formData);

            setPictureName(uploadResponse.data.data);

            if (pictureName !== "") {
                await fileAPI.put('/remove', {file: pictureName});
            }
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

                await fileAPI.put('/remove', {picture: temp});
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const updateUser = async (e) => {
        e.preventDefault();

        try {
            if (password === "") {
                displayMessageErrorInterval("Blank Password")
            } else {
                await usersAPI.put(`/settings`, 
                {
                    password: password,
                    picture: pictureName
                });

                setPassword("");
                setPictureName(user.picture);
                displayMessageUpdatedInterval();
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    return (
        <>
            <Header path={["Settings"]} />
            <img src={`http://localhost:5000/uploads/${pictureName}`} className="img4" alt="User Avatar" />
            <form method="POST" onSubmit={uploadPicture} encType="multipart/form-data">
                <div>
                    <input className="pictureInput" type="file" name="uploadedFile" onChange={e => {setPictureFile(e.target.files[0])}} />
                </div>
                <div>
                    <input className="pictureUpload text4" type="submit" value="Upload file" />
                    <button type="button" className="pictureRemove text4" onClick={() => {removePicture()}}>Remove file</button>
                </div>
            </form>
            <form className="loginBody" method="POST" onSubmit={updateUser}>
                <div className="multipleInput">
                    <input className="textInputLogin text5" type="text" name="password" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                </div>
                <div className="formSubmit">
                    <input className="loginButton text4" type="submit" value={"Update Account"} />
                </div>
            </form>
            {displayUpdatedMessage && <p>Updated</p>}
            {displayErrorMessage && <p>{error}</p>}
        </>
    )
}

export default Settings
