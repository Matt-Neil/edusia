import React, {useState, useEffect, useContext} from 'react'
import usersAPI from "../API/users"
import authAPI from "../API/auth"
import fileAPI from "../API/file"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import { CurrentUserContext } from '../Contexts/currentUserContext';
import { useHistory } from 'react-router-dom';
import MessageCard from '../Components/MessageCard'

const Settings = ({currentUser}) => {
    const [user, setUser] = useState();
    const [pictureFile, setPictureFile] = useState("");
    const [pictureName, setPictureName] = useState("");
    const [password, setPassword] = useState("");
    const [loaded, setLoaded] = useState(false);
    const {displayUpdatedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);
    const {removeCurrentUser} = useContext(CurrentUserContext);
    const history = useHistory()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await usersAPI.get("/settings");

                if (user.data.data) {
                    setUser(user.data.data);
                    setLoaded(true);
                } else {
                    history.replace("/home");
                }
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

            if (uploadResponse.data.data !== "" && pictureName !== "default.png") {
                await fileAPI.put('/remove', {file: uploadResponse.data.data});
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
            let tempPassword = password;

            if (password === "") {
                tempPassword = user.password;
            }
            
            await usersAPI.put(`/settings`, 
            {
                password: tempPassword,
                picture: pictureName
            });

            setPassword("");
            setPictureName(user.picture);
            displayMessageUpdatedInterval();
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    const deleteSchool = async () => {
        try {
            await usersAPI.delete(`/${currentUser.id}`)

            await authAPI.get("/logout");

            removeCurrentUser();

            if (typeof window !== 'undefined') {
                window.location = `/sign-in`
            }
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={["Settings"]} />
                    <div className="innerBody">
                        <img src={`http://localhost:5000/uploads/${pictureName}`} className="settingsPicture" alt="User Avatar" />
                        <form method="POST" onSubmit={uploadPicture} encType="multipart/form-data">
                            <div>
                                <input className="pictureInput" type="file" name="uploadedFile" onChange={e => {setPictureFile(e.target.files[0])}} />
                            </div>
                            <div>
                                <input style={{margin: "0 15px 0 0"}} className="buttonBlue" type="submit" value="Upload file" />
                                <button type="button" className="buttonOrange" onClick={() => {removePicture()}}>Remove file</button>
                            </div>
                        </form>
                        <form method="POST" onSubmit={updateUser}>
                            <div className="multipleInput">
                                <input className="textInput" type="password" name="password" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                            </div>
                            <div>
                                <input className="buttonBlue" type="submit" value={"Update Account"} />
                            </div>
                        </form>
                        {currentUser.position === "school" &&
                            <button style={{margin: "75px 0 0 0"}} className="buttonOrange" onClick={() => {deleteSchool()}}>Delete Account</button>
                        }
                        {displayUpdatedMessage && <MessageCard message={"Updated"} />}
                        {displayErrorMessage && <MessageCard message={error} />}
                    </div>
                </>
            }
        </>
    )
}

export default Settings
