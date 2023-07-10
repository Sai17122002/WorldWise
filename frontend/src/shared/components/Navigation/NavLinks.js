import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = props => {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink className="nav-link" to="/" exact>
          ALL USERS
        </NavLink>
      </li>
      {auth.isLoggedIn && (
        <li>
          <NavLink className="nav-link" to={`/${auth.userId}/places`}>MY PLACES</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink className="nav-link" to="/places/new">ADD PLACE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink className="nav-link" to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <button onClick={auth.logout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
