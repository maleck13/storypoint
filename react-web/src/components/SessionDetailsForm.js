import React from 'react';
import { withRouter } from 'react-router-dom';

import { UsernameForm } from './UsernameForm';

const USERNAME_STORAGE_KEY = 'userName';

class SessionDetailsForm extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      sessionId: this.props.match.params.id,
      [USERNAME_STORAGE_KEY]: this.getStoredUserName()
    };
  }

  getSessionId = () => {
    if (this.state.sessionId) {
      return Promise.resolve(this.state.sessionId);
    } else {
      return fetch(`${process.env.REACT_APP_API_HOST}/session`)
        .then(res => res.json())
        .then(response => {
          return response.id;
        });
    }
  };

  onFormComplete = userName => {
    this.getSessionId()
      .then(id => {
        this.storeUserName(userName);
        this.props.onSessionDetailsCreated && this.props.onSessionDetailsCreated({sessionId: id, userName: userName});
      });
  }

  storeUserName = userName => {
    window.sessionStorage.setItem(USERNAME_STORAGE_KEY, userName);
  }

  getStoredUserName = () => {
    return window.sessionStorage.getItem(USERNAME_STORAGE_KEY);
  }

  render = () => {
    const {sessionId} = this.state;
    const btnContext = sessionId ? 'Join Session' : 'Start Session';
    const greeting = sessionId ? 'Join Session' : 'Start a New Storypoint Session';
    return( 
      <div className="homepage">
        <header className="text-center">
          <h1>{greeting}</h1>
        </header>
          <UsernameForm onFormComplete={this.onFormComplete} btnContext={btnContext} />
      </div>
    );
  }
}

const SessionDetailsFormWithRouter = withRouter(SessionDetailsForm);

export { SessionDetailsFormWithRouter as SessionDetailsForm };