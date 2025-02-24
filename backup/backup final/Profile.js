import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import theme from './theme';
import { Avatar, Box, Grid2, IconButton, Menu, MenuItem, TextField, ThemeProvider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

export default function Profile() {
    const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session=')).replace('user_session=', '');
    const [data, setData] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notes, setNotes] = useState([]);
    const [publicNotes, setPublicNotes] = useState([]);
    const { user_id } = useParams();
    const navigate = useNavigate();

    const [edit, setEdit] = useState(false);
    const [passDia, setPassDia] = useState(false);
    const [notifPass, setNotifPass] = useState(false);
    const [copDiaOpen, setCopDiaOpen] = useState(false);
    const [copyNoteId, setCopyNoteId] = useState('');

    const editDiaOpen = () => {
        fetchUser();
        setEdit(true);
    }

    const editDiaClose = () => {
        setEdit(false);
    }

    const passDiaClose = () => {
        setPassDia(false);
    }

    const notifPassClose = () => {
        setNotifPass(false);
    }

    useEffect(() => {
        fetchNotes();
        fetchUser();
        if (userSession !== user_id) {
            fetchNotesPublic();
        }
    },[])

    const fetchUser = async () => {
        try {
            const params = new URLSearchParams();
            params.append("user_id", user_id);
            const response = await axios.get('http://localhost/api/profile.php', { params });
            setData(response.data);
            setEmail(response.data.email);
            setName(response.data.name);
            setPassword(response.data.password);
        } catch (err) {
            console.log(err);
        }
    }

    const updateNameEmail = async () => {
        try {
            const params = new URLSearchParams();
            params.append("user_id", user_id);
            params.append("name", name);
            params.append("email", email);
            const response = await axios.put('http://localhost/api/profile.php', null, { params });
            editDiaClose();
            fetchUser();
        } catch (err) {
            console.error(err);
        }
    }

    const changePassword = async () => {
        if (currentPassword === password && newPassword === confirmPassword) {
            try {
                const params = new URLSearchParams();
                params.append("user_id", user_id);
                params.append("newPassword", newPassword);
                params.append("currentPassword", password);
                await axios.put('http://localhost/api/changepass.php', null, { params });
                fetchUser();
                setNotifPass(true);
            } catch (err) {
                console.error(err);
            }
        } else {
            setPassDia(true);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    const fetchNotes = async () => {
        try {
            const params = new URLSearchParams();
            params.append("user_id", user_id);
            const response = await axios.get('http://localhost/api/createnote.php', { params });
            setNotes(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchNotesPublic = async () => {
        try {
            const params = new URLSearchParams();
            params.append("user_id", user_id);
            const response = await axios.get('http://localhost/api/notespublic.php', { params });
            setPublicNotes(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    const handleLogout = () => {
        document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/signin');
    };

    const handleCopDiaOpen = (noteId) => {
        setCopDiaOpen(true);
        setCopyNoteId(noteId);
        handleCopyNoteId(noteId);
    }
    const handleCopDiaClose = () => {
        setCopDiaOpen(false);
        setCopyNoteId('');
    }

    const handleCopyNoteId = async (noteId) => {
        try {
          await navigator.clipboard.writeText(noteId);
        } catch (err) {
          console.error("Failed to copy note ID: ", err);
        }
    };

    return (
        <div>
        <ThemeProvider theme={theme}>
            
            <Grid2 justifySelf={"center"} width={800} sx={{padding: 2}}>
                <Grid2 justifyContent={"space-between"} sx={{marginRight: 5}} container>
                    <Grid2 container>
                        <h1>Profile Page</h1>
                    </Grid2>
                    <IconButton onClick={() => navigate("/")}><HomeIcon sx={{ fontSize: 50 }}/></IconButton>
                </Grid2>
                <Grid2 display={'flex'} alignItems={'center'}>
                    <Box><Avatar sx={{width: 70, height: 70, marginRight: 2}}></Avatar></Box>
                    <Box>
                        { userSession === user_id ? (
                            <div>
                            <p style={{marginBottom: -15}}>{data.name}</p>
                            <p style={{marginBottom: 5}}>{data.email}</p>
                            <Button variant='contained' onClick={editDiaOpen}>Edit</Button>
                            </div>
                        ) : (
                            <>
                                <h2 >{data.name}</h2>
                            </>
                        )}
                    </Box>
                </Grid2>
                <Grid2>
                { userSession !== user_id && (
                        <div>
                        <h2>Public Notes</h2>
                            {publicNotes.length > 0 && (
                                <div>
                                {publicNotes.map((note) => (
                                    <Grid2 className="noteCards" sx={{ justifyContent: "space-between", padding: 1, paddingLeft: 2, marginBottom: 2, borderRadius: "10px", backgroundColor: note.is_public === 1 ? '#98A77C' : '#B6C99B'}}>
                                        <div>
                                        <h2>{note.title}</h2>
                                            <p style={{marginBottom: -15}}>Code: <strong>{note.note_id}</strong></p>
                                            <p>Total Flashcards: <strong>{JSON.parse(note.flashcards) !== null ? JSON.parse(note.flashcards).length : "0"}</strong></p>
                                        </div>
                                        <Button variant='contained' sx={{backgroundColor: "#CFE1B9", color: "#728156"}}>Copy Code</Button>
                                    </Grid2>
                                ))}
                                </div>
                            )}
                        </div>
                    )}
                </Grid2>
                {userSession == user_id && (
                <div>
                <h2>Account Settings</h2>
                    <TextField sx={{marginBottom: 2}} fullWidth variant='outlined' label="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password"/>
                    <TextField sx={{marginBottom: 2}} fullWidth variant='outlined' label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password"/>
                    <TextField sx={{marginBottom: 2}} fullWidth variant='outlined' label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password"/>
                    <Button variant='contained' onClick={changePassword}>Save Changes</Button>
                <h2>Analytics Overview</h2>
                <p>Number of Notes: {notes.length}</p>
                <Button variant='contained' onClick={handleLogout}>Logout</Button>
                </div>
                )}
            </Grid2>
            {/* <p>{data.name}</p>
            {userSession == user_id && (
            <div>
            <h2>Account Settings</h2>
            <label>
                Current Password:
                <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" />
            </label><br/>
            <label>
                New Password:
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
            </label><br/>
            <label>
                Confirm Password:
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
            </label><br/>
            <button onClick={changePassword}>Save Changes</button><br/>
            <h2>Analytics Overview</h2>
            <p>Number of Notes: {notes.length}</p>
            <button onClick={handleLogout}>Logout</button>
            </div>
            )} */}

            <Dialog open={edit} onClose={editDiaClose}>
                <DialogTitle id="edit-dialog-title">Edit Profile</DialogTitle>
                <DialogContent>
                        <TextField fullWidth sx={{marginTop: 2}} label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder={data.name} />
                        <TextField fullWidth sx={{marginTop: 2}} label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={data.email}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={editDiaClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={updateNameEmail} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={passDia} onClose={passDiaClose}>
                <DialogTitle id="pass-dialog-title">Password Change Failed</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Current password does not match or new passwords do not match. Please try again.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={passDiaClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={notifPass} onClose={notifPassClose}>
                <DialogTitle id="notif-dialog-title">Password Change Successful</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Password has been successfully changed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={notifPassClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
              open={copDiaOpen}
              onClose={handleCopDiaClose}
            >
              <DialogTitle>Copy Note ID</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  The note ID has been copied to your clipboard.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCopDiaClose} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
        </ThemeProvider>
        </div>
    )
}