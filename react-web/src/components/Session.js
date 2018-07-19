import React from 'react';
import { Grid, Row } from 'patternfly-react';

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
          <header className="text-center">
            <h2> Welcome {this.props.userName} </h2>
            Copy the link in your browser and send it to other pointers
          </header>
        </Row>
        <Row>
          <InlineEdit value={this.state.storyName} placeholder="Enter your story here" save={this.updateStory}/>
          <StoryPointer sessionId={this.props.sessionId} userName={this.props.userName}></StoryPointer>
        </Row>
      </Grid>
    );
  }
}
