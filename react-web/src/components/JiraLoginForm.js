import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, Button, HelpBlock } from 'patternfly-react';

export class JiraLoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hostEntered: false,
      userEntered: false,
      passEntered: false
    }
  }

  handleHostChange = (e) => {
    if (!this.state.hostEntered) {
      this.setState({ hostEntered: true });
    }
    this.setState({ host: e.target.value.trim() });
  }

  handleUserChange = (e) => {
    if (!this.state.userEntered) {
      this.setState({ userEntered: true });
    }
    this.setState({ username: e.target.value.trim() });
  }

  handlePassChange = (e) => {
    if (!this.state.passEntered) {
      this.setState({ passEntered: true });
    }
    this.setState({ password: e.target.value.trim() });
  }

  handleSubmit = event => {
    event.preventDefault();
    console.log('Form submitted:', this.state.host, this.state.username, this.state.password);
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormGroup controlId="host" validationState={this.state.hostEntered && !this.state.host ? 'error' : null}>
            <ControlLabel>
              Jira Host:
            </ControlLabel>
            <FormControl type="text" onChange={this.handleHostChange} />
            {(this.state.hostEntered && !this.state.host) && <HelpBlock> Jira Host can't be empty </HelpBlock>}
          </FormGroup>

          <FormGroup controlId="username" validationState={this.state.userEntered && !this.state.username ? 'error' : null}>
            <ControlLabel>
              Jira Username:
            </ControlLabel>
            <FormControl type="text" onChange={this.handleUserChange} />
            {(this.state.userEntered && !this.state.username) && <HelpBlock> Username can't be empty </HelpBlock>}
          </FormGroup>

          <FormGroup controlId="password" validationState={this.state.passEntered && !this.state.password ? 'error' : null}>
            <ControlLabel>
              Jira Password:
            </ControlLabel>
            <FormControl type="text" onChange={this.handlePassChange} />
            {(this.state.passEntered && !this.state.password) && <HelpBlock> Password can't be empty </HelpBlock>}
          </FormGroup>

          <Button className="pull-right" bsStyle="primary" type="submit" value="Submit" disabled={this.state.host && this.state.username && this.state.password ? false : true}>
            {this.props.btnContext}
          </Button>
        </Form>
      </div>
    );
  }
}