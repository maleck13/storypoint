import React from 'react';
import { Link } from "react-router-dom";

class NavBar extends React.Component {
  render() {
    return( 
      <div className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <Link to='/' className="navbar-brand"><p>Storypoint.me</p></Link>
          </div>
        </div>
      </div>
    );
  }
}
  
export default NavBar;