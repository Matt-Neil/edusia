import React, {useState, useEffect, useContext} from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import usersAPI from "../API/users"
import imageAPI from "../API/file"
import { MessageContext } from '../Contexts/messageContext';
import Header from '../Components/Header';
import MessageCard from '../Components/MessageCard'

const EditUser = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [user, setUser] = useState();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [pictureFile, setPictureFile] = useState("");
    const [pictureName, setPictureName] = useState("");
    const [password, setPassword] = useState("");
    const userID = useParams().id;
    const {displayUpdatedMessage, displayErrorMessage, displayMessageUpdatedInterval, displayMessageErrorInterval, error} = useContext(MessageContext);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await usersAPI.get(`/${userID}/edit`);

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
            setName(user.name);
            setEmail(user.email);
            setUsername(user.username);
            setPictureName(user.picture);
        }
    }, [loaded])

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
                let tempPassword;

                if (password === "") {
                    tempPassword = user.password;
                } else {
                    tempPassword = password;
                }

                await usersAPI.put(`/${userID}/edit`, 
                {
                    name: name,
                    username: username,
                    email: email,
                    password: tempPassword,
                    picture: pictureName,
                    position: user.position,
                    school_id: user.school_id
                });

                displayMessageUpdatedInterval();
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }

    const deleteUser = async () => {
        try {
            await usersAPI.delete(`/${userID}/edit`)

            history.replace("/home")
        } catch (err) {
            displayMessageErrorInterval("Server Error")
        }
    }

    return (
        <>
            {loaded &&
                <>
                    <Header path={[{text: "Home", link: "/"}, `Edit ${user.name} (${user.username})`]} />
                    <div className="toolbar">
                        <Link to={`/user/${userID}`}>Cancel Edit</Link>
                        <button onClick={() => {deleteUser()}}>Delete User</button>
                    </div>
                    <img src={`http://localhost:5000/uploads/${pictureName}`} className="img4" alt="User Avatar" />
                    <form method="POST" onSubmit={uploadPicture} encType="multipart/form-data">
                        <div>
                            <input className="pictureInput" type="file" name="uploadedFile" onChange={e => {setPictureFile(e.target.files[0])}} />
                        </div>
                        <div>
                            <input className="pictureUpload text4" type="submit" value="Upload image" />
                            <button type="button" className="pictureRemove text4" onClick={() => {removePicture()}}>Remove image</button>
                        </div>
                    </form>
                    <form className="loginBody" method="POST" onSubmit={editUser}>
                        <div className="multipleInput">
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Name" value={name} onChange={e => {setName(e.target.value)}} />
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Username" value={username} onChange={e => {setUsername(e.target.value)}} />
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Email" value={email} onChange={e => {setEmail(e.target.value)}} />
                            <input className="textInputLogin text5" type="text" name="searchPhrase" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                        </div>
                        <div className="formSubmit">
                            <input className="loginButton text4" type="submit" value="Update" />
                        </div>
                    </form>
                    {displayUpdatedMessage && <MessageCard message={"Updated"} />}
                    {displayErrorMessage && <MessageCard message={error} />}
                </>
            }
        </>
    )
}

export default EditUser
