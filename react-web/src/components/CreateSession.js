import React from 'react';

import { UsernameForm } from './UsernameForm';

export class CreateSession extends React.Component {
  getSessionId = userName => {
    fetch(process.env.REACT_APP_API_HOST + "/session")
      .then(res => res.json())
      .then(response => {
        this.props.onSessionId({sessionId: response.id, userName: userName});
      });
  };

  render() {
    return( 
      <div className="homepage">
        <header className="text-center">
          <h1> Start a New Storypoint Session </h1>
        </header>
        <UsernameForm onFormComplete={this.getSessionId} btnContext='Start Session' />
      </div>
    );
  }
}