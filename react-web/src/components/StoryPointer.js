import React from 'react';
import { Button, Col, Grid, Row } from 'patternfly-react';

import { PointSelector } from './PointSelector';
import { PointerTable } from './PointerTable';

const POINTERS_EVENT = 'pointers';
const SCORE_EVENT = 'score';
const SHOW_EVENT = 'show';
const CLEAR_EVENT = 'clear';

const isNewPointerJoined = data => {
  return data.event === POINTERS_EVENT;
};

const isScoreUpdated = data => {
  return data.event === SCORE_EVENT;
};

const isShowPoints = data => {
  return data.event === SHOW_EVENT;
};

const isClearPoints = data => {
  return data.event === CLEAR_EVENT;
};

const createEvent = type => {
  return {'event': type}
};

export class StoryPointer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pointers: []
    };

    this.pointSelected = this.pointSelected.bind(this);
    this.showPoints = this.showPoints.bind(this);
    this.clearPoints = this.clearPoints.bind(this);
  }

  componentDidMount() {
    this.connectToSession(); 
  }

  componentWillUnmount() {
    this.disconnectFromSession();
  }

  connectToSession() {
    const url = `${process.env.REACT_APP_WS_HOST}/session/${this.props.sessionId}?name=${this.props.userName}`;
    this.socket = new WebSocket(url);
    this.socket.onopen = () => {
      this.socket.onmessage = this.onMessage.bind(this);
      this.socket.onerror = this.onError.bind(this);
    };
  }

  disconnectFromSession() {
    this.socket.close();
  }

  createUpdatedStoryPoints(data) {
    let pointerIndex = this.state.pointers.findIndex(pointer => pointer.name === data.name);
    const result = [...this.state.pointers];
    if (pointerIndex > -1) {
      let pointer = result[pointerIndex];
      result[pointerIndex] = {
        name: data.name,
        score: data.score,
        show: pointer.show
      };
    }
    return result;
  }

  createPointersAsShowing() {
    return this.state.pointers.map(pointer => Object.assign({}, pointer, {show: true}));
  }

  createClearedPointers() {
    return this.state.pointers.map(pointer => Object.assign({}, pointer, {score: '', show: false}));
  }

  onMessage(evt) {
    const data = JSON.parse(evt.data);

    let pointers = [];
    if (isNewPointerJoined(data)) {
      pointers = data.points;
    }

    if (isScoreUpdated(data)) {
      pointers = this.createUpdatedStoryPoints(data);
    }

    if (isShowPoints(data)) {
      pointers = this.createPointersAsShowing();
    }

    if (isClearPoints(data)) {
      pointers = this.createClearedPointers();
    }

    this.setState({pointers: pointers});
  }

  onError(evt) {
    this.props.onError && this.props.onError(evt);
  }

  pointSelected(score) {
    const scoreEvent = createEvent(SCORE_EVENT);
    scoreEvent[SCORE_EVENT] = score;
    this.sendEvent(scoreEvent);
  }

  showPoints() {
    const showEvent = createEvent(SHOW_EVENT);
    this.sendEvent(showEvent);
  }

  clearPoints() {
    const clearEvent = createEvent(CLEAR_EVENT);
    this.sendEvent(clearEvent);
  }

  sendEvent(evt) {
    this.socket.send(JSON.stringify(evt));
  }

  render() {
    return(
      <div className="storypointer-container">
        <PointSelector onPointSelected={this.pointSelected}></PointSelector>
        <div className="table-container pull-right">
          <PointerTable pointers={this.state.pointers}></PointerTable>
          <div className="pull-right">
            <Button onClick={this.showPoints} bsStyle="primary">Show</Button>
            <Button onClick={this.clearPoints}>Clear</Button>
          </div>
        </div>
      </div>
    );
  }
}
