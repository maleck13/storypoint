import React from 'react';
import { withRouter } from 'react-router-dom';
import { Grid } from 'patternfly-react'

import { UsernameForm } from './UsernameForm';

class SessionDetailsForm extends React.Component {
  
  constructor(props) {
    super(props);

    this.sessionId = this.props.match.params.id;
  }

  getSessionId = () => {
    if (this.sessionId) {
      return Promise.resolve(this.sessionId);
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
        this.props.onSessionDetailsCreated && this.props.onSessionDetailsCreated({sessionId: id, userName: userName});
      });
  }

  render = () => {
    const {sessionId} = this;
    const btnContext = sessionId ? 'Join Session' : 'Start Session';
    const greeting = sessionId ? 'Join Session' : 'Start a New Storypoint Session';

    return( 
      <Grid>
        <header className="text-center">
          <h1>{greeting}</h1>
        </header>
        <UsernameForm onFormComplete={this.onFormComplete} btnContext={btnContext} />
      </Grid>
    );
  }
}

const SessionDetailsFormWithRouter = withRouter(SessionDetailsForm);

export { SessionDetailsFormWithRouter as SessionDetailsForm };