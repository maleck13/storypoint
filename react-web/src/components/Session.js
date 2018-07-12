import React from 'react';
import { Nav, NavItem, TabContent, TabPane, Tabs } from 'patternfly-react';

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
      <div className="session-container">
        <header className="text-center">
          <h2> Welcome {this.props.userName} </h2>
          Copy the link in your browser and send it to other pointers
        </header>
        <div className="col-md-12">
          <Tabs id="basic-tabs-pf" defaultActiveKey={1}>
            <div>
              <Nav bsClass="nav nav-tabs nav-tabs-pf nav-justified">
                <NavItem eventKey={1}> Pointing </NavItem>
                <NavItem eventKey={2}> JIRA </NavItem>
                <NavItem eventKey={3}> Issues </NavItem>
              </Nav>
              <TabContent>
                <TabPane eventKey={1}>
                  <InlineEdit label="Story:" value={this.state.storyName} placeholder="Enter your story here" save={this.updateStory}/>
                  <StoryPointer sessionId={this.props.sessionId} userName={this.props.userName}></StoryPointer>
                </TabPane>
                <TabPane eventKey={2}>
                {/* JIRA Content */}
                </TabPane>
                <TabPane eventKey={3}>
                {/* Issues Content */}
                </TabPane>
              </TabContent>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }
}
