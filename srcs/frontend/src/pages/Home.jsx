import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const fields = [
    { name: 'Football', description: 'Latest scores and highlights', icon: '⚽' },
    { name: 'AI', description: 'Advances in artificial intelligence', icon: '🤖' },
    { name: 'IT', description: 'Tech trends and innovations', icon: '💻' },
    { name: 'Cyber Security', description: 'Protecting the digital world', icon: '🔒' },
    { name: 'Politics', description: 'Global news and policies', icon: '🏛️' },
    { name: 'Crypto', description: 'Blockchain and currency updates', icon: '₿' },
  ];

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
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Journalist AI</h1>
        <p>Your personalized news companion</p>
        <div className="fields-grid">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`field-card ${field.name.toLowerCase().replace(' ', '-')}`}
            >
              <span className="field-icon">{field.icon}</span>
              <h3>{field.name}</h3>
              <p>{field.description}</p>
            </div>
          ))}
        </div>
        <div className="button-group">
          <button onClick={() => handleAuthClick('/login')} className="btn btn-login">
            <span className="no-select">Login</span>
          </button>
          <button onClick={() => handleAuthClick('/signup')} className="btn btn-signup">
            <span className="no-select">Sign Up</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;