import React, {useState, useEffect} from 'react'
import { Link, useParams } from 'react-router-dom'
import usersAPI from "../API/users"
import imageAPI from "../API/file"

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await usersAPI.get(`/${userID}/edit`);

                setUser(response.data.data);
                setLoaded(true);
            } catch (err) {}
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
        } catch (err) {}
    }

    const removePicture = async () => {
        try {
            if (pictureFile !== "" && pictureName !== "default.png") {
                const temp = pictureName;
                setPictureFile("");
                setPictureName(user.picture);

                await imageAPI.put('/remove', {file: temp});
            }
        } catch (err) {}
    }

    const editUser = async (e) => {
        e.preventDefault();

        try {
            if (password === "") {
                setPassword(user.password);
            }

            await usersAPI.put(`/${userID}/edit`, 
            {
                name: name,
                username: username,
                email: email,
                password: password,
                picture: pictureName,
                position: user.position,
                school_id: user.school_id
            });
        } catch (err) {}
    }

    return (
        <>
            {loaded &&
                <>
                    <div className="toolbar">
                        <Link to={`/home/add-student`}>Cancel Edit</Link>
                        <Link to={`/home`}>Return Home</Link>
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
                </>
            }
        </>
    )
}

export default EditUser
