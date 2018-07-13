import React from 'react';
import { Alert } from 'patternfly-react';
import { JiraLoginForm } from './JiraLoginForm'

export class JiraLogin extends React.Component {
  
  render() {
    return( 
      <div>
        <header className="text-center">
          <h1>Link to Jira</h1>
        </header>
        <div>
            <Alert type="info">
            Username and password are never stored. They are only used to generate a session token.
            </Alert>

            <JiraLoginForm />
        </div>
      </div>
    );
  }
}
