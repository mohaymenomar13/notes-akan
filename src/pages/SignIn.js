import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import logo from "./assets/logo.png";

import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { Button, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Error, setError] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams();
            params.append('email', email);
            params.append('password', password);
    
            const response = await axios.post(apiUrl+'signin.php', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                withCredentials: true,
            });
            console.log(response.data);
    
            if (response.data.message === "Sign-in successful") {
                // Set user ID or session token in local storage
                const userId = response.data.user_id; // Assuming the server sends 'user_id' in the response
                if (userId) {
                    localStorage.setItem('user_session', userId);
                    console.log('User session set in local storage:', userId);
                }
    
                // Navigate to the home page
                navigate('/');
            } else {
                console.log(response.data.message);
            }
        } catch (error) {
            if (error.response) {
                setError(true);
                console.error('Response error:', error.response.data.message);
            } else {
                console.error('Error:', error.message);
            }
        }
    };
    

    return (
        <div className="SignIn SignInUp">
            <ThemeProvider theme={theme}>
                <img src={logo} alt="Description of image" />
                <h2>Note-Akan</h2>
                <p>Streamline Your Studies with AI</p>
                <form onSubmit={handleSubmit}>
                    {Error && <Alert variant="filled" severity="error" sx={{marginBottom: 2}}>
                        Invalid email or password. Please try again.
                    </Alert>}
                    <TextField error={Error} sx={{marginBottom: 2, width: 250}} variant="outlined" label="Email" value={email} onChange={(e) => {setEmail(e.target.value); setError(false)}} required />
                    <TextField error={Error} sx={{marginBottom: 2, width: 250}} variant="outlined" label="Password" type="password" value={password} onChange={(e) => {setPassword(e.target.value); setError(false)}} required />
                    <Button sx={{marginBottom: 2}} type="submit" variant="contained">Sign In</Button>
                </form>
                <Button sx={{color: "#728156"}} onClick={() => navigate('/forgotpass')} color='primary'>Forgot Password</Button>
                <p>Don't have an account? <a href='#' onClick={() => navigate('/signup')}>Sign Up</a></p>
            </ThemeProvider>
        </div>
    );
}
