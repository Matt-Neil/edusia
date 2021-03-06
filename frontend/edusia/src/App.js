import React, {useContext} from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import "./global.css";
import 'react-datepicker/dist/react-datepicker.css'

import Sidebar from "./Components/Sidebar"
import Home from "./Pages/Home"
import User from "./Pages/User"
import Class from "./Pages/Class"
import Noticeboard from "./Pages/Noticeboard"
import Settings from "./Pages/Settings"
import Signin from "./Pages/Signin"
import Homework from "./Pages/Homework"
import Test from "./Pages/Test"
import Student from "./Pages/Student"
import { CurrentUserContext } from './Contexts/currentUserContext';

export default function App() {
  const {currentUser} = useContext(CurrentUserContext);

  const redirectPage = () => {
    if (currentUser.loaded) {
      if (currentUser.empty) {
        return <Redirect to={"/sign-in"} />
      } else {
        return <Redirect to={`/home`} />
      }
    }
  }

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {redirectPage()}
        </Route>
        <Route exact path="/sign-in">
          <Signin />
        </Route>
        {currentUser.loaded &&
          <>
            {currentUser.empty ?
              <Redirect to={"/sign-in"} />
            :
              <div className="wholeBody">
                <Sidebar currentUser={currentUser} />
                <div className="mainBody">
                  <Route path="/class/:id">
                    <Class currentUser={currentUser} />
                  </Route>
                  <Route path="/test/:id/:class">
                    <Test currentUser={currentUser} />
                  </Route>
                  <Route path="/student/:id/:class">
                    <Student currentUser={currentUser} />
                  </Route>
                  <Route exact path="/noticeboard">
                    <Noticeboard currentUser={currentUser} />
                  </Route>
                  <Route exact path="/user/:id">
                    <User currentUser={currentUser} />
                  </Route>
                  <Route exact path="/settings">
                    <Settings currentUser={currentUser} />
                  </Route>
                  <Route exact path="/home">
                    <Home currentUser={currentUser} />
                  </Route>
                  <Route exact path="/homework/:id/:class">
                    <Homework currentUser={currentUser} />
                  </Route>
                </div>
              </div>
            }
          </>
        }
      </Switch>
    </Router>
  );
}