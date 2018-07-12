import React from 'react';
import { ButtonGroup, Button } from 'patternfly-react';

export class PointSelector extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(evt) {
    if (evt.type === 'click' && evt.target.className === 'btn btn-default') {
      this.props.onPointSelected && this.props.onPointSelected(evt.target.textContent);
    }
  }

  render() {
    return(
      <div className="pointselector" onClick={this.handleClick}>
        <div>
          <ButtonGroup bsSize="large">
            <Button >1</Button><Button>2</Button><Button>3</Button>
          </ButtonGroup>
        </div>
        <div>
          <ButtonGroup bsSize="large">
            <Button>5</Button><Button>8</Button><Button>13</Button>
          </ButtonGroup>
        </div>
        <div>
          <ButtonGroup bsSize="large">
            <Button>21</Button><Button>34</Button><Button>?</Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}