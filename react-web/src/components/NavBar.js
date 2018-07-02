import React from 'react';
import { Masthead } from 'patternfly-react';
import logo from '../imgs/logo.png';

class NavBar extends React.Component {
  render() {
    return( 
      <div>
        <Masthead
          titleImg={logo}
          title="Storypoint.me"
          navToggle={false}
          href="/"
        />
      </div>
    );
  }
}
  
export default NavBar;