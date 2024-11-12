import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate instead of useHistory

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState('');
    const navigate = useNavigate(); // initialize useNavigate

    // Check if the user is already signed in by checking the cookie
    useEffect(() => {
        const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session='));
        if (userSession) {
            setResult(userSession)
        } else {
            setResult('');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams();
            params.append('email', email);
            params.append('password', password);
            const response = await axios.post('http://localhost/api/signin.php', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                withCredentials: true
            });
            setResult(response.data.message); // Set the result message based on the server response
            if (response.data.message === "Sign-in successful") {
                navigate('/'); // Redirect to the home or dashboard page
            }
        } catch (error) {
            if (error.response) {
                setResult(error.response.data.message); // Log error message from server
            } else {
                console.log("Error:", error.message);
            }
        }
    }

    return (
        <div className="SignIn">
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit">Sign In</button>
            </form>
            <a href="/forgotpass">Forgot Password</a>
            <p>Don't have an account? <a href="/signup">Sign Up</a></p>
            {result && <p>{result}</p>}
        </div>
    );
}
