import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import './App.css';

import NavBar from './NavBar';
import { SessionDetailsForm } from './SessionDetailsForm';
import { Session } from './Session';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sessionId: null,
      userName: null
    };
  }

  onSessionDetailsCreated = sessionDetails => {
    this.setState(sessionDetails);
  };

  render = () => {
    const {sessionId, userName} = this.state;

    return (
      <div className="App">
        <NavBar />
        <Switch>
          <Route exact path="/" render={() => {
              if (!sessionId) {
                return <SessionDetailsForm onSessionDetailsCreated={this.onSessionDetailsCreated} />
              } else if (sessionId) {
                return <Redirect exact to={`/session/${sessionId}`} />
              }
            }
          }/>
          <Route exact path="/session/:id" render={routeData => {
            if (!userName) {
              return <SessionDetailsForm onSessionDetailsCreated={this.onSessionDetailsCreated} />
            } else {
              return <Session sessionId={routeData.match.params.id} userName={this.state.userName}/>}
            }
          }/>
          {/* Default redirect */}
          <Redirect to="/" />
        </Switch>
      </div>
    );
  }
}

export default App;
