import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPass() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams();
            params.append('email', email);
            const response = await axios.post('http://localhost/api/forgotpass.php', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            console.log(response.data);
            setMessage(response.data.message);
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                console.log("Error:", error.message);
            }
        }
    };

    return (
        <div className="ForgotPass">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    required 
                />
                <button type="submit">Send Reset Link</button>
            </form>
            <a href="/signin">Sign in</a><br/>
            <a href="/signup">Sign Up</a>
            {message && <p>{message}</p>}
        </div>
    );
}
