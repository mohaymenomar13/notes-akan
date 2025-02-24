import axios from "axios";
import React, { useEffect, useState } from "react";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session=')).replace('user_session=', '');

  const [isAdmin, setIsAdmin] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [searchNote, setSearchNote] = useState("");
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [ownerNames, setOwnerNames] = useState([]);
  const [ownerNotesCount, setOwnerNotesCount] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [editFormData, setEditFormData] = useState({ name: '', email: '', password: '' });
  const [openEditNoteDialog, setOpenEditNoteDialog] = useState(false);
  const [openDeleteNoteDialog, setOpenDeleteNoteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState({});
  const [editNoteFormData, setEditNoteFormData] = useState({ title: '', owner: '', note_id: '', is_public: '' });
  const navigate = useNavigate();

  const checkAdmin = async () => {
    try {
      const params = new URLSearchParams();
      params.append("user_id", userSession);
      const response = await axios.get("http://localhost/api/admin.php", {params});
      setIsAdmin(response.data);
      console.log(response.data+" "+userSession);
    } catch (err) {
      console.error(err);
    }
  }

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      password: user.password
    });
    setOpenEditDialog(true);
  };

  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
  };

  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleEdit = async (user, formData) => {
    try {
      const params = new URLSearchParams();
      params.append("user_id", user.user_id);
      params.append("name", formData.name);
      params.append("email", formData.email);
      params.append("password", formData.password);
      const response = await axios.put("http://localhost/api/adminusers.php", null, {params});
    } catch (err) {
      console.error(err);
    }
    fetchUsers();
    handleEditClose();
  };

  const handleDelete = async () => {
    console.log('Delete user:', selectedUser);
    try {
      const params = new URLSearchParams();
      params.append("user_id", selectedUser.user_id);
      const response = await axios.delete("http://localhost/api/adminusers.php", {params});
      console.log(response.data);
      fetchUsers();
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
    handleDeleteClose();
  };

  const handleEditNoteOpen = (note) => {
    setSelectedNote(note);
    setEditNoteFormData({
      title: note.title,
      user_id: note.user_id,
      note_id: note.note_id,
      is_public: note.is_public
    });
    setOpenEditNoteDialog(true);
  };
  
  const handleDeleteNoteOpen = (note) => {
    setSelectedNote(note);
    setOpenDeleteNoteDialog(true);
  };
  
  const handleEditNoteClose = () => {
    setOpenEditNoteDialog(false);
  };
  
  const handleDeleteNoteClose = () => {
    setOpenDeleteNoteDialog(false);
  };
  
  const handleEditNote = async () => {
    console.log('Edit note:', selectedNote, 'with data:', editNoteFormData);
    try {
      const params = new URLSearchParams();
      params.append("note_id", selectedNote.note_id);
      params.append("new_note_id", editNoteFormData.note_id);
      params.append("user_id", selectedNote.user_id);
      params.append("new_user_id", editNoteFormData.user_id);
      params.append("title", editNoteFormData.title);
      params.append("is_public", editNoteFormData.is_public);
      const response = await axios.put("http://localhost/api/adminnotes.php", null, {params});
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
    fetchNotes();
    handleEditNoteClose();
  };
  
  const handleDeleteNote = async () => {
    console.log('Delete note:', selectedNote);
    try {
      const params = new URLSearchParams();
      params.append("note_id", selectedNote.note_id);
      params.append("user_id", selectedNote.user_id);
      const response = await axios.delete("http://localhost/api/adminnotes.php", {params});
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
    fetchNotes();
    handleDeleteNoteClose();
  };

  const fetchUsers = async() => {
    try {
      const response = await axios.get('http://localhost/api/adminusers.php');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  const fetchNotes = async() => {
    try {
      const response = await axios.get('http://localhost/api/adminnotes.php');
      setNotes(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchNotes();
    fetchUsers();
    checkAdmin();
  },[])

  useEffect(() => {
    const fetchOwnerNames = async () => {
      const ownerNamesObj = {};
      for (const note of notes) {
        try {
          const params = new URLSearchParams();
          params.append("user_id", note.user_id);
          const response = await axios.get('http://localhost/api/fetchname.php', {params});
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
        <p>You don't have permission to enter to this page.</p><br/>
        <button onClick={() => navigate("/")}>Back to Home</button>
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
                  <td>{user.time_created}</td>
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
                    <button className="btn edit" onClick={() => handleEditOpen(user)}>Edit</button>
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

      <Dialog open={openEditDialog} onClose={handleEditClose} aria-labelledby="edit-dialog-title" aria-describedby="edit-dialog-description">
        <DialogContent>
          <DialogContentText id="edit-dialog-description">
            Edit User Details
          </DialogContentText>
          <input  type="text"  placeholder="name"  value={editFormData.name}  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} /><br/>
          <input type="email" placeholder="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} /><br/>
          <input type="text" placeholder="password" value={editFormData.password} onChange={(e) => setEditFormData({...editFormData, password: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={() => handleEdit(selectedUser, editFormData)}>Edit</Button>
        </DialogActions>
      </Dialog>

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
                    <button className="btn edit" onClick={() => handleEditNoteOpen(note)}>Edit</button>
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

      <Dialog open={openEditNoteDialog} onClose={handleEditNoteClose} aria-labelledby="edit-note-dialog-title" aria-describedby="edit-note-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="edit-note-dialog-description">
            Edit Note Details
          </DialogContentText>
          <input type="text" placeholder="title" value={editNoteFormData.title} onChange={(e) => setEditNoteFormData({...editNoteFormData, title: e.target.value})} /><br/>
          <input type="text" placeholder="owner" value={editNoteFormData.user_id} onChange={(e) => setEditNoteFormData({...editNoteFormData, user_id: e.target.value})} /><br/>
          <input type="text" placeholder="note_id" value={editNoteFormData.note_id} onChange={(e) => setEditNoteFormData({...editNoteFormData, note_id: e.target.value})} /><br/>
          <select value={editNoteFormData.is_public} onChange={(e) => setEditNoteFormData({...editNoteFormData, is_public: e.target.value})}><option value="1">Public</option><option value="0">Private</option>
          </select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditNoteClose}>Cancel</Button>
          <Button onClick={() => handleEditNote(selectedNote, editNoteFormData)}>Edit</Button>
        </DialogActions>
      </Dialog>

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