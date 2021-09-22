import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import SidebarContextProvider from './Contexts/sidebarContext';
import CurrentUserContextProvider from './Contexts/currentUserContext';
import CompletedContextProvider from './Contexts/completedContext';
import ExpiredContextProvider from './Contexts/expiredContext';

ReactDOM.render(
  <React.StrictMode>
    <CurrentUserContextProvider>
      <CompletedContextProvider>
        <ExpiredContextProvider>
          <SidebarContextProvider>
            <App />
          </SidebarContextProvider>
        </ExpiredContextProvider>
      </CompletedContextProvider>
    </CurrentUserContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
