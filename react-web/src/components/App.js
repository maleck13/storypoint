import React, { Component } from 'react';
import { Redirect, Route, Switch } from "react-router-dom";

import './App.css';

import NavBar from './NavBar';
import JiraLogin from './JiraLogin';
import { CreateSession } from './CreateSession';
import { Session } from './Session';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sessionId: null
    }
  }

  onSessionIdCreated = sessionDetails => {
    window.localStorage.setItem("userName", sessionDetails.userName);
    this.setState(sessionDetails);
  };

  render() {
    return (
      <div className="App">
        <NavBar />

        <div className="Container">
          <Switch>
            {this.state.sessionId && <Redirect exact from='/' to={`/session/${this.state.sessionId}`} />}
            <Route exact path="/" render={() => <CreateSession onSessionId={this.onSessionIdCreated} />} />
            <Route exact path="/jira" component={JiraLogin} />
            <Route exact path="/session/:id" component={Session} />
            <Redirect to="/" />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
