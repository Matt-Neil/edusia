import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import SidebarContextProvider from './Contexts/sidebarContext';
import CurrentUserContextProvider from './Contexts/currentUserContext';
import CompletedContextProvider from './Contexts/completedContext';

ReactDOM.render(
  <React.StrictMode>
    <CurrentUserContextProvider>
      <CompletedContextProvider>
        <SidebarContextProvider>
          <App />
        </SidebarContextProvider>
      </CompletedContextProvider>
    </CurrentUserContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
