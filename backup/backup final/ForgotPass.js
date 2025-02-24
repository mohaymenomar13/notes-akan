import React, { useState } from 'react';
import axios from 'axios';
import logo from "./assets/logo.png";

import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { Button, colors, createTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';

export default function ForgotPass() {
    const [email, setEmail] = useState('');
    const [Success, setSuccess] = useState(false);
    const [Error, setError] = useState(false);
    const [onSubmit, setOnSubmit] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setOnSubmit(true);
        e.preventDefault();
        try {
            const params = new URLSearchParams();
            params.append('email', email);
            const response = await axios.post('http://localhost/api/forgotpass.php', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            setSuccess(true);
        } catch (error) {
            if (error.response) {
                setError(true);
            } else {
                console.log("Error:", error.message);
            }
        }
        setOnSubmit(false);
    };

    return (
        <div className="ForgotPass SignInUp">
            <ThemeProvider theme={theme}>
                <img src={logo} alt="Description of image" />
                <h1>Forgot Password</h1>
                {Error && <Alert variant="filled" severity="error" sx={{marginBottom: 2}}>
                    Email not found.
                </Alert>}
                {Success && <Alert variant="filled" severity="success" sx={{marginBottom: 2}}>
                    The new password was successfully sent to your email.
                </Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField disabled={Success} error={Error} variant='outlined' type='email' label='Enter your email' onChange={(e) => {setEmail(e.target.value); setError(false)}} />
                    <Button disabled={Success || onSubmit} sx={{margin: 2}} variant='contained' type='submit'>Send Reset Link</Button>
                </form>
                <Button sx={{color: "#728156"}} onClick={() => navigate('/signin')} color='primary'>Sign in</Button>
                <Button sx={{color: "#728156"}} onClick={() => navigate('/signup')} color='primary'>Sign Up</Button>
            </ThemeProvider>
        </div>
    );
}
