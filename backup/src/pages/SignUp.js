import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "./assets/logo.png";

import TextField from '@mui/material/TextField';
import { Button, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';

export default function SignUp(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
          const params = new URLSearchParams();
            params.append('name', name);
            params.append('email', email);
            params.append('password', password);
            const response = await axios.post('http://localhost/api/signup.php', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                withCredentials: true
            });
            console.log(response.data);
          navigate('/');
        } catch (error) {
          console.log(error);
        }
      };

    return (
        <div className='SignUp SignInUp'>
          <ThemeProvider theme={theme}>
              <img src={logo} alt="Description of image" />
              <h1>SignUp</h1>
              <form onSubmit={handleSubmit}>
                  <TextField error={Error} sx={{marginBottom: 2, width: 250}} variant="outlined" label="Name" value={name} onChange={(e) => {setName(e.target.value); setError(false)}} required />
                  <TextField error={Error} sx={{marginBottom: 2, width: 250}} variant="outlined" label="Email" value={email} onChange={(e) => {setEmail(e.target.value); setError(false)}} required />
                  <TextField type='password' error={Error} sx={{marginBottom: 2, width: 250}} variant="outlined" label="Password" value={password} onChange={(e) => {setPassword(e.target.value); setError(false)}} required />
                  <Button sx={{margin: 2}} variant='contained' type='submit' color='primary'>Sign Up</Button>
              </form>
              <p>Do have account? <a href='#' onClick={() => navigate('/signin')}>Sign In</a></p>
          </ThemeProvider>
        </div>
    )
}