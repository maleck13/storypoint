import React from 'react';
import { PointSelector } from './pointSelector';

export class Session extends React.Component {

  constructor(props) {
    super(props);

    this.pointSelected = this.pointSelected.bind(this);
  }

  pointSelected(value) {
    // Handle point value
  }

  render() {
    return( 
      <div className="session">
        <header className="text-center">
          <h1> Session </h1>
        </header>
        <PointSelector onPointSelected={this.pointSelected}></PointSelector>
      </div>
    );
  }
}