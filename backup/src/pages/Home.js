import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NoteList from './NoteList'
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

import AddIcon from '@mui/icons-material/Add';
import { ThemeProvider } from '@emotion/react';
import { Button, Box, Dialog, DialogActions, DialogContent, DialogContentText, Grid2, Menu, MenuItem, Avatar, Backdrop, CircularProgress, TextField, Alert } from '@mui/material'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import theme from './theme';

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
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    
    const handleClose = () => {
      setOpen(false);
    };
    const handleOpen = () => {
      setOpen(true);
    };

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
    }, [retrieveUserInfo]);

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
        navigate("/note/"+response.data);
      } catch (err) {
        console.error(err);
      }
    }

    const handleProfile = () => {
        navigate('/profile/'+props.user);
    }
    const handleLogout = () => {
      document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate('/signin');
  };

    return (
        <div className='home'>
        <ThemeProvider theme={theme}>
          <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={!name}
            onClick={handleClose}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          <ThemeProvider theme={theme}>
            <div className='header'>
              <h1 style={{fontFamily: "monospace"}}>NOTE-AKAN</h1>

              <PopupState variant="popover" popupId="demo-popup-menu">
                {(e) => (<>
                    <Avatar sx={{width: 50, height: 50}} {...bindTrigger(e)}>{name && name.charAt(0)}</Avatar>
                    <Menu {...bindMenu(e)}>
                      <MenuItem onClick={handleProfile}>Profile</MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                    </>
                )}
              </PopupState>
            </div>

            
            <Grid2 container spacing={2} sx={{marginLeft: 5}}>
              <Button variant='contained' color='primary' startIcon={<AddIcon fontSize="inherit" />} onClick={handleCreateNote}>Create New Note</Button>
              <Button sx={{color: "#728156"}} variant='outlined' color='secondary' onClick={handleCodeDiaOpen}>Enter Note Code</Button>
            </Grid2>
          </ThemeProvider>

            <NoteList user={props.user} />

            <Dialog open={codeDiaOpen} onClose={handleCodeDiaClose}> 
              <DialogContent>
                  <p>Enter the note's unique code:</p>
                  <TextField error={errorCopy} autoFocus color='primary' label="Code" type="text" onChange={(e) => {setNoteId(e.target.value); setErrorCopy(false)}} />
                  {errorCopy && <Alert variant="filled" severity="error" sx={{marginTop: 2}}>Error copying a note.</Alert>}
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

            <Dialog open={codeDiaOpen2} onClose={handleCodeDiaClose2} sx={{
              '& .MuiPaper-root': {
                backgroundColor: '#E7F5DC', 
                borderRadius: '12px', 
              },
            }}>
              <DialogContent>
                <DialogContentText>
                  <div style={{textAlign: "center"}}>
                    <p>Code: {copyData.note_id}</p>
                    <h2>{copyData.title}</h2>
                    <p style={{borderBottom: "solid 1px black", marginBottom: "30px"}}>from: <strong>{copyOwner}</strong></p>
                  </div>
                  <ReactMarkdown>{copyData.summary == null ? "No file content" : copyData.summary}</ReactMarkdown>
                </DialogContentText>  
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCodeDiaClose2} color="secondary">
                  CANCEL
                </Button>
                <Button onClick={handleCopyNote} color="secondary">
                  COPY
                </Button>
              </DialogActions>
            </Dialog>
          </ThemeProvider>
        </div>
    )
}