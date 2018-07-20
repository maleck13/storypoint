import React from 'react';
import { Grid, Row, Col, Button, FormControl } from 'patternfly-react';

export class InlineEdit extends React.Component {
  constructor(props) {
    super(props);

    this.currentValue = '';
    this.state = {
      editing: false
    };
  }

  componentWillReceiveProps(props) {
    if (props.value) {
      this.currentValue = props.value;
    }
  }

  componentDidUpdate = () => {
    if (this.state.editing) {
      this.textInput.focus();
    }
  }

  cancelEdit = () => {
    this.textInput.value = this.currentValue;
    this.setState({editing: false});
  }

  setEditable = () => {
    this.setState({editing: true});
  }

  setRef = ref => {
    this.textInput = ref;
  }

  save = () => {
    const value = this.textInput.value;
    this.currentValue = value;
    this.setState({editing: false});
    this.props.save && this.props.save(value);
  }

  clearInput = () => {
    this.textInput.value = '';
  }

  render() {
    return( 
      <div className={"inline-edit-container form-control-pf-editable " + (this.state.editing ? "form-control-pf-edit" : "")}>
        <Button className="form-control-pf-value col-md-12" onClick={this.setEditable} bsSize="large">
          <span className={"pull-left " + (this.currentValue ? "current-value" : "placeholder")}>{this.currentValue || this.props.placeholder}</span>
          <i className="glyphicon glyphicon-pencil"></i>
        </Button>
        <div className="form-control-pf-textbox">
          <FormControl 
            type="text"
            inputRef={this.setRef}/>
          <Button className="form-control-pf-empty" onClick={this.clearInput}>
            <span className="fa fa-times-circle fa-lg"></span>
          </Button>
        </div>
        <Button className="form-control-pf-save" bsStyle="primary" onClick={this.save}><i className="glyphicon glyphicon-ok"></i></Button>
        <Button className="form-control-pf-cancel" onClick={this.cancelEdit}><i className="glyphicon glyphicon-remove"></i></Button>
      </div>
    );
  }
}