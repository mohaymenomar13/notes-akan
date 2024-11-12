import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NoteList from './NoteList'
import axios from 'axios';

export default function Home(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [note_id, setNoteId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        retrieveUserInfo();
    }, [props.user]);

    const retrieveUserInfo = async () => {
        try {
          const params = new URLSearchParams();
          params.append('user_id', props.user); 
          const response = await axios.get('http://localhost/api/home.php', { params });
          setName(response.data.name);
          setEmail(response.data.email);
          setPassword(response.data.password);
        } catch (err) {
          console.log(err);
        }
      };
      
    const handleLogout = () => {
        document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/signin');
    };

    const handleCreateNote = async () => {
      try {
        const params = new URLSearchParams();
        params.append('user_id', props.user)
        const response = await axios.post('http://localhost/api/createnote.php', params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        navigate("/createnote/"+response.data.note_id);
      } catch (err) {
        console.log(err);
      }
    }

    return (
        <div>
            <h1>Welcome back, {name}!</h1>
            <p>This is a simple React application.</p>
            <button onClick={handleLogout}>Logout</button><br/>
            <button onClick={handleCreateNote}>Create New Note</button>
            <NoteList user={props.user} />
        </div>
    )
}