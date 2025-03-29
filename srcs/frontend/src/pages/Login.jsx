import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Login.css';

function Login({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/api/signin', { email, password });
      Cookies.set('access_token', response.data['Access-Token']);
      setAuth(true);
      navigate('/choose-fields');
    } catch (error) {
      setError(error.response.data[Object.keys(error.response.data)[0]] || 'Login failed. Please try again.');
      if (error.response.data[Object.keys(error.response.data)[0]] == 'Email Activation Required'){
        navigate('/verify', { state: { email } });
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="submit-btn">
          <span className="no-select">Login</span>
        </button>
      </form>
    </div>
  );
}

export default Login;