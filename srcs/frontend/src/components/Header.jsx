import { data, Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import './Header.css';

function Header({ newsCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isSignupPage = location.pathname === '/signup';
  const isLoginPage = location.pathname === '/login';
  const isAboutPage = location.pathname === '/about';
  const isVerifyPage = location.pathname === '/verify';
  const isUserSpace = location.pathname === '/user-space';
  const isAuthenticated = !!Cookies.get('access_token');

  const handleAuthClick = async (path) => {
    const token = Cookies.get('access_token');
    if (token) {
      try {
        const response = await axios.get('/auth/api/profile', {
          headers: { 'Access-Token': token },
        });
        if (response.status === 200) {
          console.log(response.data);
          if (response.data.Fields == false){
            navigate('/choose-fields');
          }
          else{
            navigate('/user-space')
          }
          return;
        }
      } catch (error) {
        console.error('Profile fetch failed:', error);
      }
    }
    navigate(path);
  };

  return (
    <header className="header">
      <Link to="/about" className="logo">Journalist</Link>
      
      <div className="nav-buttons">
        {(isSignupPage || isAboutPage || isVerifyPage) && (
          <button
            onClick={() => handleAuthClick('/login')}
            className="nav-btn login-btn"
          >
            <span className="no-select">Login</span>
          </button>
        )}
        {(isLoginPage || isAboutPage || isVerifyPage) && (
          <button
            onClick={() => handleAuthClick('/signup')}
            className="nav-btn signup-btn"
          >
            <span className="no-select">Signup</span>
          </button>
        )}
      </div>

      {}
      {!isHomePage && !isUserSpace && (
        <Link to="/" className="home-btn">
          <span className="no-select">Home</span>
        </Link>
      )}
      {isUserSpace && isAuthenticated && (
        <button className="notifications-btn" title="Notifications">
          🔔 ({newsCount})
        </button>
      )}
    </header>
  );
}

export default Header;