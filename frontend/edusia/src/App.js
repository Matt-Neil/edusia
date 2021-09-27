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
import AddUser from "./Pages/AddUser"
import AddClass from "./Pages/AddClass"
import EditUser from "./Pages/EditUser"
import EditClass from "./Pages/EditClass"
import Test from "./Pages/Test"
import Student from "./Pages/Student"
import EditHomework from './Pages/EditHomework';
import AddHomework from './Pages/AddHomework';
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
                  {currentUser.position === "school" &&
                    <>
                      <Route path="/home/add-student">
                        <AddUser currentUser={currentUser} position={"student"} />
                      </Route>
                      <Route path="/home/:id/edit-student">
                        <EditUser currentUser={currentUser} />
                      </Route>
                      <Route path="/home/add-teacher">
                        <AddUser currentUser={currentUser} position={"teacher"} />
                      </Route>
                      <Route path="/home/:id/edit-teacher">
                        <EditUser currentUser={currentUser} />
                      </Route>
                      <Route exact path="/home/add-class">
                        <AddClass currentUser={currentUser} />
                      </Route>
                      <Route exact path="/home/:id/edit-class">
                        <EditClass currentUser={currentUser} />
                      </Route>
                    </>
                  }
                  {currentUser.position !== "student" &&
                    <>
                      <Route path="/class/:id">
                        <Class currentUser={currentUser} />
                      </Route>
                      <Route path="/test/:id/:class">
                        <Test currentUser={currentUser} />
                      </Route>
                      <Route path="/student/:id/:class">
                        <Student currentUser={currentUser} />
                      </Route>
                    </>
                  }
                  {currentUser.position === "teacher" &&
                    <>
                      <Route exact path="/edit-homework/:id/:class">
                        <EditHomework currentUser={currentUser} />
                      </Route>
                      <Route exact path="/add-homework/:id">
                        <AddHomework currentUser={currentUser} />
                      </Route>
                    </>
                  }
                  {currentUser.position === "student" &&
                    <Route exact path="/noticeboard">
                      <Noticeboard currentUser={currentUser} />
                    </Route>
                  }
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