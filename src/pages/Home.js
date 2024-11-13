import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NoteList from './NoteList'
import axios from 'axios';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function Home(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [note_id, setNoteId] = useState('');
    const [codeDiaOpen, setCodeDiaOpen] = useState(false);
    const navigate = useNavigate();

    const handleCodeDiaOpen = () => {
      setCodeDiaOpen(true);
    }

    const handleCodeDiaClose = () => {
      setCodeDiaOpen(false);
    }

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

    const handleProfile = () => {
        navigate('/profile/'+props.user);
    }

    return (
        <div>
            <h1>Welcome back, {name}!</h1>
            <button onClick={handleProfile}>Profile</button><br/>
            <button onClick={handleCreateNote}>Create New Note</button>
            <button onClick={handleCodeDiaOpen}>Enter Note Code</button>
            <NoteList user={props.user} />

            <Dialog open={codeDiaOpen} onClose={handleCodeDiaClose}> 
              <DialogContent>
                <DialogContentText>
                  Enter the note's unique code:<br/>
                </DialogContentText>
                <input type='text'></input>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCodeDiaClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleCodeDiaClose} color="primary">
                  Continue
                </Button>
              </DialogActions>
            </Dialog>
        </div>
    )
}