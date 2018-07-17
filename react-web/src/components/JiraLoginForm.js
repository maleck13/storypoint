import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, Button } from 'patternfly-react';

export class JiraLoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      'jira-host': '',
      'jira-username': '',
      'jira-password': ''
    };

    this.handleControlChange = this.handleControlChange.bind(this);
  }

  handleControlChange(evt) {
    this.setState({[evt.target.id]: evt.target.value.trim()});
  }

  render() {
    return (
      <div>
        <Form>
          <FormGroup>
            <ControlLabel>
              Jira Host:
            </ControlLabel>
            <FormControl type="text" id="jira-host" required onChange={this.handleControlChange} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>
              Jira Username:
            </ControlLabel>
            <FormControl type="text" id="jira-username" required onChange={this.handleControlChange} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>
              Jira Password:
            </ControlLabel>
            <FormControl type="text" id="jira-password" required onChange={this.handleControlChange} />
          </FormGroup>
          <Button className="pull-right" bsStyle="primary" type="submit" value="Submit">
            Link to Jira
          </Button>
        </Form>
      </div>
    );
  }
}
