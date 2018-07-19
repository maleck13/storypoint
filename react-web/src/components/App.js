import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import './App.css';

import NavBar from './NavBar';
import { CreateSession } from './CreateSession';
import { JoinSession } from './JoinSession';
import { Session } from './Session';

const USERNAME_STORAGE_KEY = 'userName';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sessionId: null,
      [USERNAME_STORAGE_KEY]: null
    };
  }

  componentDidMount = () => {
    this.setState({
      [USERNAME_STORAGE_KEY]: this.getStoredUserName()
    });
  }

  onSessionStarted = sessionDetails => {
    this.storeUserName(sessionDetails.userName);
    this.setState(sessionDetails);
  };

  storeUserName = userName => {
    window.sessionStorage.setItem(USERNAME_STORAGE_KEY, userName);
  }

  getStoredUserName = () => {
    return window.sessionStorage.getItem(USERNAME_STORAGE_KEY);
  }

  render = () => {
    const {sessionId, userName} = this.state;

    return (
      <div className="App">
        <NavBar />
        <Switch>
          <Route exact path="/" render={() => {
              if (!sessionId) {
                return <CreateSession onSessionCreated={this.onSessionStarted} />
              } else if (sessionId) {
                return <Redirect exact to={`/session/${sessionId}`} />
              }
            }
          }/>
          <Route exact path="/session/:id" render={routeData => {
            if (!userName) {
              return <JoinSession sessionId={routeData.match.params.id} onSessionJoined={this.onSessionStarted}></JoinSession>
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
