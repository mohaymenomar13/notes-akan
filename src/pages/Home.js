import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NoteList from './NoteList'
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

export default function Home(props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [note_id, setNoteId] = useState('');
    const [errorCopy, setErrorCopy] = useState(false);
    const [copyData, setCopyData] = useState([]);
    const [copyOwner, setCopyOwner] = useState('');
    const [codeDiaOpen, setCodeDiaOpen] = useState(false);
    const [codeDiaOpen2, setCodeDiaOpen2] = useState(false);
    const navigate = useNavigate();

    const handleCodeDiaOpen = () => {
      setCodeDiaOpen(true);
    }
    const handleCodeDiaClose = () => {
      setCodeDiaOpen(false);
      setErrorCopy(false);
    }

    const handleCodeDiaOpen2 = () => {
      setCodeDiaOpen2(true);
    }
    const handleCodeDiaClose2 = () => {
      setCodeDiaOpen2(false);
    }

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

    useEffect(() => {
      retrieveUserInfo();
    }, []);

    const handleCreateNote = async () => {
      try {
        const params = new URLSearchParams();
        params.append('user_id', props.user)
        const response = await axios.post('http://localhost/api/createnote.php', params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        navigate("/note/"+response.data.note_id);
      } catch (err) {
        console.log(err);
      }
    }

    const fetchCopyNote = async () => {
      console.log(note_id);
      try {
        const params = new URLSearchParams();
        params.append('note_id', note_id)
        const response = await axios.get('http://localhost/api/copynote.php', { params });
        console.log(response.data)
        fetchName(response.data.user_id);
        setCopyData(response.data);
        if (response.data == null) {
          setErrorCopy(true);
        } else {
          handleCodeDiaClose();
          handleCodeDiaOpen2();
        }
      } catch (err) {
        setErrorCopy(true);
        console.error(err);
      }
    }

    const fetchName = async (userid) => {
      try {
        const params = new URLSearchParams();
        params.append('user_id', userid)
        const response = await axios.get('http://localhost/api/fetchname.php', { params });
        console.log(response.data);
        setCopyOwner(response.data.name);
      } catch (err) {
        console.error(err);
      }
    }

    const handleCopyNote = async () => {
      try {
        const params = new URLSearchParams();
        params.append('user_id', props.user);
        params.append('title', copyData.title);
        params.append('summary', copyData.summary);
        params.append('flashcards', copyData.flashcards);
        const response = await axios.post('http://localhost/api/copynote.php', params.toString(), {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          }});
        console.log(response.data);
      } catch (err) {
        console.error(err);
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
                  Enter the note's unique code:<br/>
                <input onChange={(e) => setNoteId(e.target.value)} type='text' autoFocus></input>
                <p>{errorCopy && 'Error copying a note.'}</p>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCodeDiaClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={fetchCopyNote} color="primary">
                  Continue
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={codeDiaOpen2} onClose={handleCodeDiaClose2}>
              <DialogContent>
                <DialogContentText>
                  <p>Note Code: {copyData.note_id}</p>
                  <h2>{copyData.title}</h2><p>from: <strong>{copyOwner}</strong></p>
                  <ReactMarkdown>{copyData.summary == null ? "No file content" : copyData.summary}</ReactMarkdown>
                </DialogContentText>  
              </DialogContent>
              <p>Are you sure to copy it?</p>
              <DialogActions>
                <Button onClick={handleCodeDiaClose2} color="secondary">
                  Cancel
                </Button>
                <Button onClick={handleCopyNote} color="primary">
                  Continue
                </Button>
              </DialogActions>
            </Dialog>
        </div>
    )
}