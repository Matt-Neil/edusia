import React, {useContext} from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import "./global.css";

import Header from "./Components/Header"
import Sidebar from "./Components/Sidebar"
import User from "./Pages/User"
import Class from "./Pages/Class"
import Noticeboard from "./Pages/Noticeboard"
import Settings from "./Pages/Settings"
import Signin from "./Pages/Signin"
import NotFound from "./Pages/NotFound"
import Homework from "./Pages/Homework"
import { CurrentUserContext } from './Contexts/currentUserContext';

export default function App() {
  const {currentUser} = useContext(CurrentUserContext);

  const redirectPage = () => {
    if (currentUser.loaded) {
      if (currentUser.empty) {
        return <Redirect to={"/sign-in"} />
      } else {
        return <Redirect to={`/user/${currentUser.id}`} />
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
                  <Header currentUser={currentUser} />
                  <Route path="/class/:id">
                    <Class />
                  </Route>
                  <Route exact path="/user/noticeboard">
                    <Noticeboard />
                  </Route>
                  <Route exact path="/settings">
                    <Settings />
                  </Route>
                  <Route exact path="/user/:id">
                    <User currentUser={currentUser} />
                  </Route>
                  <Route exact path="/homework/:id">
                    <Homework currentUser={currentUser} />
                  </Route>
                  <Route path="*">
                    <NotFound />
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