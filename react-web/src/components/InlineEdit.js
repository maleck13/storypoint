import React from 'react';
import { Button, ControlLabel, FormControl } from 'patternfly-react';

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

  cancelEdit = () => {
    this.setState({editing: false});
  }

  setEditable = () => {
    this.setState({editing: true});
  }

  save = () => {
    const value = this.inputForm.value;
    this.currentValue = value;
    this.setState({editing: false});
    this.props.save && this.props.save(value);
  }

  clearInput = () => {
    this.inputForm.value = '';
  }

  render() {
    return( 
      <div className="inline-edit-container form-group">
        <ControlLabel className="control-label col-md-2">{this.props.label}</ControlLabel>
        <div className={"col-md-10 form-control-pf-editable " + (this.state.editing ? "form-control-pf-edit" : "")}>
          <Button className="form-control-pf-value" onClick={this.setEditable}>
            <span>{this.currentValue || this.props.placeholder}</span>
            <i className="glyphicon glyphicon-pencil"></i>
          </Button>
          <div className="form-control-pf-textbox">
            <FormControl 
              type="text" 
              placeholder={this.props.placeholder}
              inputRef={el => this.inputForm = el}/>
            <Button className="form-control-pf-empty" onClick={this.clearInput}>
              <span className="fa fa-times-circle fa-lg"></span>
            </Button>
          </div>
          <Button className="form-control-pf-save" bsStyle="primary" onClick={this.save}><i className="glyphicon glyphicon-ok"></i></Button>
          <Button className="form-control-pf-cancel" onClick={this.cancelEdit}><i className="glyphicon glyphicon-remove"></i></Button>
        </div>
      </div>
    );
  }
}