import axios from "axios";
import React, { useEffect, useState } from "react";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@emotion/react';
import theme from "./theme";
import logo from "./assets/logo.png";

export default function Admin() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [searchNote, setSearchNote] = useState("");
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [ownerNames, setOwnerNames] = useState([]);
  const [ownerNotesCount, setOwnerNotesCount] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [openDeleteNoteDialog, setOpenDeleteNoteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState({});
  const [Error, setError] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        const response = await axios.post(apiUrl+'admin.php', params.toString());
        if (response.data == 'success') {
          setIsAdmin(true);
        } else {
          setError(true);
        }
    } catch (error) {
        if (error.response) {
            setError(true);
        } else {
            console.log("Error:", error.message);
        }
    }
  }

  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    console.log('Delete user:', selectedUser);
    try {
      const params = new URLSearchParams();
      params.append("user_id", selectedUser.user_id);
      const response2 = await axios.post(apiUrl+"adminusers.php", params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      const response = await axios.delete(apiUrl+"adminusers.php", {params});
      console.log(response.data);
      fetchUsers();
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
    handleDeleteClose();
  };
  
  const handleDeleteNoteOpen = (note) => {
    setSelectedNote(note);
    setOpenDeleteNoteDialog(true);
  };
  
  const handleDeleteNoteClose = () => {
    setOpenDeleteNoteDialog(false);
  };
  
  const handleDeleteNote = async () => {
    console.log('Delete note:', selectedNote);
    try {
      const params = new URLSearchParams();
      params.append("note_id", selectedNote.note_id);
      params.append("user_id", selectedNote.user_id);
      const response = await axios.delete(apiUrl+"adminnotes.php", {params});
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
    fetchNotes();
    handleDeleteNoteClose();
  };

  const fetchUsers = async() => {
    try {
      const response = await axios.get(apiUrl+'adminusers.php');
      setUsers(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  const fetchNotes = async() => {
    try {
      const response = await axios.get(apiUrl+'adminnotes.php');
      setNotes(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchNotes();
    fetchUsers();
  },[])

  useEffect(() => {
    const fetchOwnerNames = async () => {
      const ownerNamesObj = {};
      for (const note of notes) {
        try {
          const params = new URLSearchParams();
          params.append("user_id", note.user_id);
          const response = await axios.get(apiUrl+'fetchname.php', {params});
          ownerNamesObj[note.user_id] = response.data;
        } catch (err) {
          console.error(err);
        }
      }
      setOwnerNames(ownerNamesObj);
    };
    fetchOwnerNames();
  }, [notes]);

  useEffect(() => {
    const countNotesByOwner = () => {
      const ownerNotes = {};
      notes.forEach((note) => {
        const owner = ownerNames[note.user_id]?.name;
        ownerNotes[owner] = (ownerNotes[owner] || 0) + 1;
      });
      setOwnerNotesCount(ownerNotes);
    };
    countNotesByOwner();
  }, [notes, ownerNames]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchNote.toLowerCase()) ||
      ownerNames[note.user_id]?.name.toLowerCase().includes(searchNote.toLowerCase()) ||
      note.note_id.toLowerCase().includes(searchNote.toLowerCase())
  );

  const togglePasswordVisibility = (index) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (<>
    {!isAdmin ? 
      (
      <div>
        <div className="SignIn SignInUp">
            <ThemeProvider theme={theme}>
              <img src={logo} alt="Description of image" /><br/>
              <h2>ADMIN</h2>
              <p>Sign In</p>
              <form onSubmit={handleSubmit}>
                  {Error && <Alert variant="filled" severity="error" sx={{marginBottom: 2}}>
                      Invalid username or password. Please try again.
                  </Alert>}
                  <TextField error={Error} sx={{marginBottom: 2, width: 250}} variant="outlined" label="Username" value={username} onChange={(e) => {setUsername(e.target.value); setError(false)}} required />
                  <TextField error={Error} sx={{marginBottom: 2, width: 250}} variant="outlined" label="Password" type="password" value={password} onChange={(e) => {setPassword(e.target.value); setError(false)}} required />
                  <Button sx={{marginBottom: 2}} type="submit" variant="contained">Sign In</Button>
              </form>
            </ThemeProvider>
        </div>
      </div>
      )
      :
      (
      <div className="admin-panel">
      <h1>Admin Panel</h1>
      <section className="section analytics">
        <h2>Analytics Dashboard</h2>
        <div className="analytics-cards">
          <div className="card">
            <h3>System Overview</h3>
            <ul>
              <li>Total Registered Users: <strong>{users.length}</strong></li>
              <li>Total Notes Existing: <strong>{notes.length}</strong></li>
            </ul>
          </div>
          <div className="card">
            <h3>Notes by User</h3>
            <ul>
              {Object.keys(ownerNotesCount).map((owner, index) => (
                <li key={index}>{owner}: <strong>{ownerNotesCount[owner]}</strong></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>User Management</h2>
        <input
          type="text"
          placeholder="Search users by name or email..."
          className="search-bar"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <table className="table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Date Joined</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.created_at}</td>
                  <td>
                    <span className="password">
                      {passwordVisibility[index] ? user.password : "••••••••••"}
                    </span>
                    <button
                      className="btn toggle-password"
                      onClick={() => togglePasswordVisibility(index)}
                    >
                      {passwordVisibility[index] ? "Hide" : "Show"}
                    </button>
                  </td>
                  <td>
                    <button className="btn delete" onClick={() => handleDeleteOpen(user)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete <strong>{selectedUser.name}</strong>?
        </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <section className="section">
        <h2>Note Moderation</h2>
        <input
          type="text"
          placeholder="Search notes..."
          className="search-bar"
          value={searchNote}
          onChange={(e) => setSearchNote(e.target.value)}
        />
        <table className="table">
          <thead>
            <tr>
              <th>Note Title</th>
              <th>Owner</th>
              <th>Unique Code</th>
              <th>Visibility</th>
              <th>Time Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note, index) => (
                <tr key={index}>
                  <td>{note.title}</td>
                  <td>{ownerNames[note.user_id]?.name}</td>
                  <td>{note.note_id}</td>
                  <td>
                    <span className={`visibility ${note.is_public === 1 ? "public" : "private"}`}>
                      {note.is_public === 1 ? "public" : "private"}
                    </span>
                  </td>
                  <td>{note.created_at}</td>
                  <td>
                    <button className="btn delete" onClick={() => handleDeleteNoteOpen(note)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No notes found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Dialog open={openDeleteNoteDialog} onClose={handleDeleteNoteClose} aria-labelledby="delete-note-dialog-title" aria-describedby="delete-note-dialog-description">
        <DialogContent>
          <DialogContentText id="delete-note-dialog-description">
            Are you sure you want to delete {selectedNote.title}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteNoteClose}>Cancel</Button>
          <Button onClick={() => handleDeleteNote(selectedNote)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
      )}
  </>);
};