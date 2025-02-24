import axios from 'axios';
import React, { useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Chat from './Chat.js';
import Note from './Note.js';
import Flashcard from './Flashcard.js';
import { Box, Button, Grid2, IconButton, Tab, Tabs, TextField } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import theme from './theme.js';
import { ThemeProvider } from '@emotion/react';
import AssistantIcon from '@mui/icons-material/Assistant';
import NoteIcon from '@mui/icons-material/Note';
import StyleIcon from '@mui/icons-material/Style';

export default function Notes() {
    const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session=')).replace('user_session=', '');
    const { note_id } = useParams();
    const [data, setData] = useState([]);
    const [title, setTitle] = useState('');
    const [flashcards, setFlashcards] = useState([]);
    const [summary, setSummary] = useState('');

    const navigate = useNavigate();
    const [chat, setChat] = useState(false);
    const [note, setNote] = useState(false);
    const [flashcard, setFlascard] = useState(false);
    const [editTitle, setEditTitle] = useState(false);
    const [messages, setMessages] = useState([]);

    const [value, setValue] = useState(1);
    const handleChange = (event, newValue) => {
        setValue(newValue);
        if (newValue === 0) {
            handleChat();
        } else if (newValue === 1) {
            handleNote();
        } else if (newValue === 2) {
            handleFlashcard();
        }
    };

    const fetchNote = async () => {
        try {
            const params = new URLSearchParams();
            params.append('user_id', userSession);
            params.append('note_id', note_id);
            const response = await axios.get('http://localhost/api/note.php', { params });
            setData(response.data);
            setSummary(response.data.summary);
            setTitle(response.data.title);
            if (response.data.chat !== null) {
                setMessages(JSON.parse(response.data.chat));
            } 
            if (response.data.summary !== null && response.data.chat === null || response.data.chat == "[]") {
                setMessages([
                    { role: 'user', content: "Below is the summarized note of a user, he/she will gonna ask or wants to clarify something in his/her note: " + response.data.summary },
                    { role: 'model', content: `Do you have something you want to talk about the note?` }
                ]);
            }
            if (response.data.flashcards !== null && response.data.flashcards !== "null") {
                setFlashcards(JSON.parse(response.data.flashcards));
            }
            handleNote();
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchNote();
    }, []);

    const handleSaveChat = async (newMessages) => {
        if (newMessages.length > 0) {
            try {
                const data = {
                    user_id: userSession,
                    note_id: note_id,
                    chat: JSON.stringify(newMessages)
                };
                const response = await axios.put('http://localhost/api/savechat.php', data);
            } catch (err) {
                console.error(err);
            }
        }
    }

    const handleSaveTitle = async () => {
        try {
            const data = {
                user_id: userSession,
                note_id: note_id,
                title: title
            };
            const response = await axios.put('http://localhost/api/savetitle.php', data);
        } catch (err) {
            console.error(err);
        }
    }

    const handleChat = () => {
        setChat(true);
        setNote(false);
        setFlascard(false);
    }
    const handleNote = () => {
        setChat(false);
        setNote(true);
        setFlascard(false);
    }
    const handleFlashcard = () => {
        setChat(false);
        setNote(false);
        setFlascard(true);
    }

    const toggleEditTitle = () => {
        handleSaveTitle();
        setEditTitle(!editTitle);
    }

    const noteData = { summary, setSummary, userSession, note_id, title, flashcards, messages, setMessages, fetchNote}
    const chatData = { summary, userSession, messages, setMessages, note_id, handleSaveChat}
    const flashcardData = { summary, userSession, note_id, flashcards, setFlashcards, fetchNote };

    return (<>
        {data == null ? 
        ((<div>
            <p>You don't have this note.</p>
            <button onClick={() => navigate("/")}>Back to Notes</button>
        </div>)) 
        :
        (<div>
            <ThemeProvider theme={theme}>
                <Grid2 justifyContent={"space-between"} sx={{marginRight: 5, marginLeft: 5}} container>
                    <Grid2 container>
                        {editTitle ? (<TextField color='primary' value={title} onChange={(e) => setTitle(e.target.value)}></TextField>) : (<h1>{title}</h1>)}
                        <IconButton onClick={toggleEditTitle}><EditIcon sx={{fontSize: 40}}/></IconButton>
                    </Grid2>
                    <IconButton onClick={() => navigate("/")}><HomeIcon sx={{ fontSize: 50 }}/></IconButton>
                </Grid2>
                <Grid2 container justifyContent={'center'}>
                    <Tabs value={value} onChange={handleChange}>
                        <Tab disabled={messages.length === 0 || summary == ""} label="Chat with AI" icon={<AssistantIcon />} />
                        <Tab label="Note" icon={<NoteIcon />} />
                        <Tab label="Flashcards" icon={<StyleIcon />} />
                    </Tabs>
                </Grid2>
                {chat && <Chat chatData={chatData}/>}
                {note && <Note noteData={noteData} />}
                {flashcard && <Flashcard flashcardData={flashcardData} />}
            </ThemeProvider>
        </div>)
        }
    </>)
}