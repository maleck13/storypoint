import React from 'react';
import { StoryPointer } from './StoryPointer';

export class Session extends React.Component {

  render() {
    return( 
      <div className="session">
        <header className="text-center">
          <h1> Session </h1>
        </header>
        <StoryPointer sessionId={this.props.sessionId} userName={this.props.userName}></StoryPointer>
      </div>
    );
  }
}
