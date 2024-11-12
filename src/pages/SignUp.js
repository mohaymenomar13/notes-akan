import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
export default function SignUp(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
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
          setSuccess('Record created successfully');
          navigate('/');
        } catch (error) {
          setError('Error creating record');
          console.error(error);
        }
      };

    return (
        <div className='SignUp'>
            <h1>SignUp</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                <button type="submit">Submit</button>
            </form>
            <p>Do have account? <a href="/signin">Sign In</a></p>
            <a href="/forgotpass">Forgot Password</a>
        </div>
    )
}