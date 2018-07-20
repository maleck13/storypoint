import React from 'react';
import { Grid, Row, Col } from 'patternfly-react';

import { StoryPointer } from './StoryPointer';
import { InlineEdit } from './InlineEdit';

export class Session extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      storyName: ''
    };
  }

  updateStory() {
    /// Handle update story here....
  }

  render() {
    return( 
      <Grid>
        <Row>
          <header className="text-center" style={{marginBottom: "25px"}}>
            <h2> Welcome {this.props.userName} </h2>
            Copy the link in your browser and send it to other pointers
          </header>
        </Row>
        <Row>
          <Col sm={12} md={10} mdOffset={1} style={{marginBottom: "50px"}}>
            <InlineEdit value={this.state.storyName} placeholder="Enter your story here" save={this.updateStory}/>
          </Col>
          <Col sm={12} md={8} mdOffset={2}>
            <StoryPointer sessionId={this.props.sessionId} userName={this.props.userName}></StoryPointer>
          </Col>
        </Row>
      </Grid>
    );
  }
}
