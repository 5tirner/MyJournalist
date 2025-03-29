import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

function Signup({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/api/signup', { email, password });
      setAuth(false);
      navigate('/verify', { state: { email } });
    } catch (error) {
      if (error.response.data[Object.keys(error.response.data)[0]] == 'auth_db with this email already exists.')
      {
        setError('This Email Already Used');
      }
      else{
        setError(error.response.data[Object.keys(error.response.data)[0]] || 'Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Sign Up</h2>
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
          <span className="no-select">Sign Up</span>
        </button>
      </form>
    </div>
  );
}

export default Signup;