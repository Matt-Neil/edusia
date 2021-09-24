import React, {useState, useContext} from 'react'
import authAPI from "../API/auth"
import { CurrentUserContext } from '../Contexts/currentUserContext';
import { MessageContext } from '../Contexts/messageContext';

const LogIn = () => {
    const [login, setLogin] = useState(true);
    const [loginEmail, setLoginEmail] = useState("ks3829@email.com");
    const [loginPassword, setLoginPassword] = useState("password");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {changeCurrentUser} = useContext(CurrentUserContext);
    const {displayErrorMessage, displayMessageErrorInterval, error} = useContext(MessageContext);

    const loginUser = async (e) => {
        e.preventDefault();

        try {
            const response = await authAPI.post("/login", 
            {
                email: loginEmail,
                password: loginPassword
            });

            if (response.data.data && typeof window !== 'undefined') {
                changeCurrentUser({
                    id: response.data.data.id,
                    name: response.data.data.name,
                    email: response.data.data.email,
                    password: response.data.data.password,
                    position: response.data.data.position,
                    picture: response.data.data.picture
                })

                window.location = `/home`
            }
        } catch (err) {
            displayMessageErrorInterval("Error Logging In")
        }
    }

    const newSchool = async (e) => {
        e.preventDefault();

        if (name === "" || email === "" || password === "") {
            displayMessageErrorInterval("No Blank Fields")
        } else {
            try {
                const response = await authAPI.post("/new-school", 
                {
                    name: name,
                    email: email,
                    password: password,
                    picture: "default.png",
                    position: "school"
                });

                if (response.data.data && typeof window !== 'undefined') {
                    changeCurrentUser({
                        id: response.data.data.id,
                        name: response.data.data.name,
                        email: response.data.data.email,
                        password: response.data.data.password,
                        position: response.data.data.position,
                        picture: response.data.data.picture
                    })

                    window.location = `/home`
                }
            } catch (err) {
                displayMessageErrorInterval("Server Error")
            }
        }
    }
    
    return (
        <>
            {login ?
                <>
                    <div className="mainBody">
                        <form className="loginBody" method="POST" onSubmit={loginUser}>
                            <div className="multipleInput">
                                <input className="textInputLogin text5" type="text" name="email" placeholder="Email" value={loginEmail} onChange={e => {setLoginEmail(e.target.value)}} />
                                <input className="textInputLogin text5" type="password" name="password" placeholder="Password" value={loginPassword} onChange={e => {setLoginPassword(e.target.value)}} />
                            </div>
                            <div className="formSubmit">
                                <input className="loginButton text4" type="submit" value="Log in" />
                            </div>
                        </form>
                    </div>
                    <button onClick={() => {setLogin(false)}}>Register School</button>
                </>
            :
                <>
                    <div className="mainBody">
                        <form className="loginBody" method="POST" onSubmit={newSchool}>
                            <div className="multipleInput">
                                <input className="textInputLogin text5" type="text" name="name" placeholder="School Name" value={name} onChange={e => {setName(e.target.value)}} />
                                <input className="textInputLogin text5" type="text" name="email" placeholder="Email" value={email} onChange={e => {setEmail(e.target.value)}} />
                                <input className="textInputLogin text5" type="password" name="password" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                            </div>
                            <div className="formSubmit">
                                <input className="loginButton text4" type="submit" value="Register School" />
                            </div>
                        </form>
                    </div>
                    <button onClick={() => {setLogin(true)}}>Login</button>
                </>
            }
            {displayErrorMessage && <p>{error}</p>}
        </>
    )
}

export default LogIn
