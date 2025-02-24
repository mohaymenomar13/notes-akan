import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ThemeProvider } from "@emotion/react";
import theme from './theme';
import { Box, Grid2, IconButton, Menu, MenuItem, } from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CopyAllIcon from '@mui/icons-material/CopyAll';

export default function NoteList(props) {
    const [data, setData] = useState([]);
    const [delDiaOpen, setDelDiaOpen] = useState(false);
    const [deleteNoteId, setDeleteNoteId] = useState('');
    const [copDiaOpen, setCopDiaOpen] = useState(false);
    const [copyNoteId, setCopyNoteId] = useState('');
    const navigate = useNavigate();

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
      const fetchNotesAsync = async () => {
        await fetchNotes();
      };
      fetchNotesAsync();
    }, [props.user]);

    const fetchNotes = async () => {
        try {
            const params = new URLSearchParams();
            params.append('user_id', props.user);
            const response = await axios.get('http://localhost/api/createnote.php', { params });
            setData(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDelete = async (noteId) => {
        try {
            const params = new URLSearchParams();
            params.append('note_id', noteId);
            params.append('user_id', props.user);
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
        } catch (err) {
          console.error("Failed to copy note ID: ", err);
        }
    };

    const handleSelectNote = (noteId) => {
      navigate('/note/'+noteId);
    }

    return (
        <div>
            {data.length > 0 ? (
                <><Grid2 container rowGap={3} columnGap={2} sx={{padding: 4.5}}>
                    {data.map(note => (
                      <Grid2 className="noteCards" container sx={{ justifyContent: "space-between", padding: 1, paddingLeft: 2, width: "350px", borderRadius: "10px", backgroundColor: note.is_public === 1 ? '#98A77C' : '#B6C99B'}}>
                          <div onClick={() => handleSelectNote(note.note_id)}>
                            <h2>{note.title}</h2>
                              <p style={{marginBottom: -15}}>Code: <strong>{note.note_id}</strong></p>
                              <p style={{marginBottom: -15}}>Time created: <strong>{note.created_at}</strong></p>
                              <p>Status: <strong >{note.is_public === 1 ? "Public" : "Private"}</strong></p>
                          </div>
                          
                          <Box>
                            <PopupState variant="popover" popupId="demo-popup-menu">
                              {(e) => (
                                <>
                                  <IconButton {...bindTrigger(e)}>
                                    <MoreHorizIcon sx={{marginTop: "8px"}} fontSize="large"/>
                                  </IconButton>
                                  <Menu {...bindMenu(e)}>
                                    <MenuItem onClick={() => {handleDelDiaOpen(note.note_id);e.close()}}><Button sx={{color: "red"}} startIcon={<DeleteIcon />}>Delete</Button></MenuItem>
                                    <MenuItem onClick={() => {handleIsPublic(note);e.close()}}><Button sx={{color: note.is_public === 1 ? "BLUE" : "LIME" }} startIcon={ note.is_public === 1 ? <VisibilityIcon/> : <VisibilityOffIcon/>}>{ note.is_public == 1 ? "PUBLIC" : "PRIVATE" }</Button></MenuItem>
                                    <MenuItem onClick={() => {handleCopDiaOpen(note.note_id);e.close()}}><Button sx={{color: "black"}} startIcon={<CopyAllIcon/>}>Copy note id</Button></MenuItem>
                                  </Menu>
                                </>
                              )}
                            </PopupState>
                          </Box>
                      </Grid2>
                    ))}
                  </Grid2></>
            ) : (
                  <h1 style={{
                    position: "absolute",
                    top: "50%", right: "50%",
                    transform: "translate(50%,-50%)"}}>You don't have any notes. <br/>Create one!</h1>
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
                <Button sx={{color: "red"}} onClick={() => {handleDelete(deleteNoteId); handleDelDiaClose();}} color="secondary">
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