import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Verify.css';

function Verify() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleCodeChange = (e) => {
    const value = e.target.value;
    if (value.length <= 8) {
      setCode(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('No email provided. Please sign up or log in first.');
      return;
    }
    setIsLoading(true);
    try {
      await axios.post('/auth/api/verify', { email, verification_code: code });
      navigate('/login');
    } catch (error) {
      setError(error.response.data[Object.keys(error.response.data)[0]] || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <form onSubmit={handleSubmit} className="verify-form">
        <h2>Verify Your Account</h2>
        {error && <p className="error-message">{error}</p>}
        <p className="email-info">Code sent to: {email}</p>
        <input
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={handleCodeChange}
          maxLength={8}
          className="input-field"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={`submit-btn ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          <span className="no-select">{isLoading ? 'Loading...' : 'Verify'}</span>
        </button>
      </form>
    </div>
  );
}

export default Verify;