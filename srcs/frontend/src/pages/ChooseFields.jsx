import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './ChooseFields.css';

function ChooseFields() {

  const handleAuthClick = async (path) => {
    const token = Cookies.get('access_token');
    if (token) {
      try {
        const response = await axios.get('/auth/api/profile', {
          headers: { 'Access-Token': token },
        });
        if (response.status === 200) {
          console.log(response.data);
          if (response.data.Fields == true){
            navigate('/user-space')
          }
          return;
        }
      } catch (error) {
        console.error('Profile fetch failed:', error);
        navigate('/')
      }
    }
    navigate(path);
  };
  handleAuthClick('/choose-fields')
  const [selectedFields, setSelectedFields] = useState([]);
  const navigate = useNavigate();
  const fields = [
    { name: 'football', icon: '⚽' },
    { name: 'ai', icon: '🤖' },
    { name: 'it', icon: '💻' },
    { name: 'cybersec', icon: '🔒' },
    { name: 'politic', icon: '🏛️' },
    { name: 'crypto', icon: '₿' },
  ];

  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('access_token');
      await axios.post(
        '/auth/api/fields',
        { fields: selectedFields },
        { headers: { 'Access-Token': token } }
      );
      navigate('/user-space');
    } catch (error) {
      console.error('Field selection failed:', error);
    }
  };

  return (
    <div className="choose-fields-container">
      <form onSubmit={handleSubmit} className="choose-fields-form">
        <h2>Choose Your Interests</h2>
        <div className="fields-grid">
          {fields.map((field) => (
            <button
              key={field.name}
              type="button"
              onClick={() => toggleField(field.name)}
              className={`field-btn ${selectedFields.includes(field.name) ? 'selected' : ''}`}
            >
              <span className="field-icon">{field.icon}</span>
              <span className="no-select">{field.name}</span>
            </button>
          ))}
        </div>
        <button type="submit" className="submit-btn">
          <span className="no-select">Save Preferences</span>
        </button>
      </form>
    </div>
  );
}

export default ChooseFields;