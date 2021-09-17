import React, {useState, useContext} from 'react'
import authAPI from "../API/auth"
import { CurrentUserContext } from '../Contexts/currentUserContext';

const LogIn = () => {
    const [login, setLogin] = useState(true);
    const [loginEmail, setLoginEmail] = useState("ks3258");
    const [loginPassword, setLoginPassword] = useState("password");
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [errors, setErrors] = useState({email: undefined, password: undefined});
    const {changeCurrentUser} = useContext(CurrentUserContext);

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

                window.location = `/user/${response.data.data.id}`
            }
        } catch (err) {
            setErrors(err.response.data.errors);
        }
    }

    const newSchool = async (e) => {
        e.preventDefault();

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

                window.location = `/user/${response.data.data.id}`
            }
        } catch (err) {
            setErrors(err.response.data.errors);
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
                                {errors.email && <p className="displayError text5" className="marginText text5">{errors.email}</p> }
                                <input className="textInputLogin text5" type="password" name="password" placeholder="Password" value={loginPassword} onChange={e => {setLoginPassword(e.target.value)}} />
                                {errors.password && <p className="displayError text5" className="marginText text5">{errors.password}</p> }
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
                                {errors.password && <p className="displayError text5" className="marginText text5">{errors.password}</p> }
                                <input className="textInputLogin text5" type="text" name="email" placeholder="Email" value={email} onChange={e => {setEmail(e.target.value)}} />
                                {errors.email && <p className="displayError text5" className="marginText text5">{errors.email}</p> }
                                <input className="textInputLogin text5" type="password" name="password" placeholder="Password" value={password} onChange={e => {setPassword(e.target.value)}} />
                                {errors.password && <p className="displayError text5" className="marginText text5">{errors.password}</p> }
                            </div>
                            <div className="formSubmit">
                                <input className="loginButton text4" type="submit" value="Register School" />
                            </div>
                        </form>
                    </div>
                    <button onClick={() => {setLogin(true)}}>Login</button>
                </>
            }
        </>
    )
}

export default LogIn
