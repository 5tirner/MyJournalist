import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Login from './pages/Login';
import ChooseFields from './pages/ChooseFields';
import About from './pages/About';
import UserSpace from './pages/UserSpace';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('access_token'));

  const ProtectedRoute = ({ children }) => {
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(isAuthenticated);

    useEffect(() => {
      const validateToken = async () => {
        const token = Cookies.get('access_token');
        if (token) {
          try {
            const response = await axios.get('/auth/api/profile', {
              headers: { 'Access-Token': token },
            });
            if (response.status === 200) {
              setIsValid(true);
              setIsAuthenticated(true);
            } else {
              setIsValid(false);
              setIsAuthenticated(false);
              Cookies.remove('access_token');
            }
          } catch (error) {
            setIsValid(false);
            setIsAuthenticated(false);
            Cookies.remove('access_token');
          }
        } else {
          setIsValid(false);
          setIsAuthenticated(false);
        }
        setIsValidating(false);
      };

      validateToken();
    }, []);

    if (isValidating) {
      return <div>Loading...</div>;
    }

    return isValid ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-700 to-gray-600 text-gray-200 font-serif">
        <Header />
        <main className="flex-grow overflow-hidden bg-inherit">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup setAuth={setIsAuthenticated} />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
            <Route 
              path="/choose-fields" 
              element={
                <ProtectedRoute>
                  <ChooseFields />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user-space" 
              element={
                <ProtectedRoute>
                  <UserSpace />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;