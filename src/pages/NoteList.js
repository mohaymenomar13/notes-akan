import axios from "axios";
import React, { useState, useEffect } from "react";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function NoteList(props) {
    const [data, setData] = useState([]);
    const [delDiaOpen, setDelDiaOpen] = useState(false);
    const [deleteNoteId, setDeleteNoteId] = useState('');
    const [copDiaOpen, setCopDiaOpen] = useState(false);
    const [copyNoteId, setCopyNoteId] = useState('');

    const handleDelDiaOpen = (noteId) => {
        setDelDiaOpen(true);
        setDeleteNoteId(noteId);
    }
    const handleDelDiaClose = () => {
        setDelDiaOpen(false);
        setDeleteNoteId('');
    }

    const handleCopDiaOpen = (noteId) => {
        setCopDiaOpen(true);
        setCopyNoteId(noteId);
        handleCopyNoteId(noteId);
    }
    const handleCopDiaClose = () => {
        setCopDiaOpen(false);
        setCopyNoteId('');
    }

    useEffect(() => {
        fetchNotes();
    }, [props.user])


    const fetchNotes = async () => {
        try {
            const params = new URLSearchParams();
            params.append('user_id', '99297b10e84898151ed30fd408adb0bc');
            const response = await axios.get('http://localhost/api/createnote.php', { params });
            setData(response.data);
            console.log(response.data, props.user);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDelete = async (noteId) => {
        try {
            const params = new URLSearchParams();
            params.append('note_id', noteId);
            params.append('user_id', props.user);
            console.log(noteId, props.user)
            const response = await axios.delete('http://localhost/api/createnote.php', { params });
            fetchNotes();
        } catch (err) {
            console.error(err);
        }
    }

    const handleIsPublic = async (note) => {
        try {
          const params = new URLSearchParams();
          params.append('note_id', note.note_id);
          params.append('is_public', note.is_public === 1 ? 0 : 1);
          params.append('user_id', props.user);
          const response = await axios.put('http://localhost/api/createnote.php', null, {
            params,
          });
          fetchNotes();
        } catch (err) {
          console.error(err);
        }
    };

    const handleCopyNoteId = async (noteId) => {
        try {
          await navigator.clipboard.writeText(noteId);
          console.log("Note ID copied to clipboard");
        } catch (err) {
          console.error("Failed to copy note ID: ", err);
        }
    };

    return (
        <div>
            <p>{props.user}</p>
            <h1>Note List</h1>
            {data.length > 0 ? (
                <ul>
                    {data.map(note => (
                        <li key={note.note_id}>
                            <h3>{note.title}</h3>
                            <p>{note.note_id}</p>
                            <p>{note.is_public}</p>
                            <p>{note.created_at}</p>
                            <button>Select</button>
                            {/*<button onClick={() => handleDelete(note.note_id)}>Delete</button>*/}
                            <button onClick={() => handleDelDiaOpen(note.note_id)}>Delete</button>
                            <button onClick={() => handleIsPublic(note)}>Toggle is_public</button>
                            <button onClick={() => handleCopDiaOpen(note.note_id)}>Copy note id</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No notes found</p>
            )}
            <Dialog
              open={delDiaOpen}
              onClose={handleDelDiaClose}
            >
              <DialogTitle>Delete Note</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this note?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDelDiaClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={() => {handleDelete(deleteNoteId); handleDelDiaClose();}} color="secondary">
                  Delete
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
        </div>
    )
}