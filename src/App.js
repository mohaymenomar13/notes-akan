import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ForgotPass from './pages/ForgotPass';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import Profile from './pages/Profile';
import Notes from './pages/Notes';
import Reviewing from './pages/Reviewing';
import Admin from './pages/Admin';

function App() {
  return (
    <div>
      <Router>
        <AppRouter />
      </Router>
    </div>
  );
}

function AppRouter() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session='));
    const userSession = localStorage.getItem('user_session');
    
    if (userSession) {
      setUser(userSession.replace('user_session=', ''));
      if (window.location.pathname === '/signin' || window.location.pathname === '/signup') {
        navigate('/');
      }
    } else {
      setUser(null);
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup' && window.location.pathname !== '/forgotpass') {
        navigate('/signin');  
      }
    }

    console.log(userSession);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home user={user} />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgotpass" element={<ForgotPass />} />
      <Route path="/note/:note_id" element={<Notes />} />
      <Route path="/note/:note_id/review" element={<Reviewing />}/>
      <Route path="/profile/:user_id" element={<Profile />} />
      <Route path="/admin/" element={<Admin />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
}

export default App;
