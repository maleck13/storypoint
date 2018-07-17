import React from 'react';

import { UsernameForm } from './UsernameForm';

export class JoinSession extends React.Component {
  constructor(props) {
    super(props);

    this.onFormComplete = this.onFormComplete.bind(this);
  }

  onFormComplete(userName) {
    this.props.onSessionJoined({
      sessionId: this.props.sessionId,
      userName
    });
  }

  render() {
    // TODO: Better way to extend this needed.
    return( 
      <div className="homepage">
        <header className="text-center">
          <h1>Join Session</h1>
        </header>
        <UsernameForm onFormComplete={this.onFormComplete} btnContext='Join Session' />
      </div>
    );
  }
}
