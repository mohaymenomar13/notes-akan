import axios from 'axios';
import React, { useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import Chat from './Chat.js';
import Note from './Note.js';
import Flashcard from './Flashcard.js';
import { Backdrop, Box, Button, CircularProgress, Grid2, IconButton, Tab, Tabs, TextField } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import theme from './theme.js';
import { ThemeProvider } from '@emotion/react';
import AssistantIcon from '@mui/icons-material/Assistant';
import NoteIcon from '@mui/icons-material/Note';
import StyleIcon from '@mui/icons-material/Style';
import { Scale } from '@mui/icons-material';

export default function Notes() {
    // const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session=')).replace('user_session=', '');
    const userSession = localStorage.getItem('user_session');
    const { note_id } = useParams();
    const [data, setData] = useState([]);
    const [title, setTitle] = useState('');
    const [flashcards, setFlashcards] = useState([]);
    const [summary, setSummary] = useState('');
    const [summaryId, setSummaryId] = useState('');
    const [chatId, setChatId] = useState('');
    const [flashcardId, setFlashcardId] = useState('');
    const apiUrl = process.env.REACT_APP_API_URL;

    const navigate = useNavigate();
    const [chat, setChat] = useState(false);
    const [note, setNote] = useState(true);
    const [flashcard, setFlascard] = useState(false);
    const [fetching, setFetching] = useState(false);
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
            const response = await axios.get(apiUrl+'note.php', { params });
            setData(response.data.note);
            setSummary(response.data.summary.summary);
            setTitle(response.data.note.title);
            setChatId(response.data.note.chat_id);
            setSummaryId(response.data.note.summary_id);
            setFlashcardId(response.data.note.flashcard_id);
            if (response.data.chat.chat != 0 && response.data.chat.chat != "[]") {
                setMessages(JSON.parse(response.data.chat.chat));
            } 
            if (response.data.summary.summary.length > 0 && response.data.chat.chat == 0 || response.data.chat.chat == "[]") {
                setMessages([
                    { role: 'user', content: "Below is the summarized note of a user, he/she will gonna ask or wants to clarify something in his/her note: " + response.data.summary.summary },
                    { role: 'model', content: `Is there something about the note you’d like to talk about?` }
                ]);
            }
            if (response.data.flashcard.flashcard !== null && response.data.flashcard.flashcard.length > 0) {
                setFlashcards(JSON.parse(response.data.flashcard.flashcard));
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
                    note_id: note_id,
                    chat_id: chatId,
                    chat: JSON.stringify(newMessages)
                };
                const response = await axios.put(apiUrl+'savechat.php', data);
                console.log(response.data);
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
            const response = await axios.put(apiUrl+'savetitle.php', data);
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

    const noteData = { fetching, setFetching, chatId, summaryId, summary, setSummary, userSession, note_id, title, flashcards, messages, setMessages, fetchNote}
    const chatData = { fetching, setFetching, summary, userSession, messages, setMessages, note_id, handleSaveChat}
    const flashcardData = { fetching, setFetching, flashcardId, summary, userSession, note_id, flashcards, setFlashcards, fetchNote };

    return (<>
        {data == null ? 
        ((<div>
            <p>You don't have this note.</p>
            <button onClick={() => navigate("/")}>Back to Notes</button>
        </div>)) 
        :
        (<div>
            <ThemeProvider theme={theme}>
                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={title == ""}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Grid2 justifyContent={"space-between"} sx={{marginRight: 5, marginLeft: 5}} container>
                    <Grid2 container sx={{width: "28vh", fontSize: "1.5vh"}}>
                        {editTitle ? (<TextField  sx={{width: "18vh"}} color='primary' value={title} onChange={(e) => setTitle(e.target.value)}></TextField>) : (<h1>{title.slice(0, 14)}</h1>)}
                        <IconButton onClick={toggleEditTitle}><EditIcon sx={{fontSize: 40}}/></IconButton>
                    </Grid2>
                    <IconButton onClick={() => navigate("/")}><HomeIcon sx={{ fontSize: 50 }}/></IconButton>
                </Grid2>
                <Grid2 container justifyContent={'center'}>
                    <Tabs value={value} onChange={handleChange}>
                        <Tab disabled={summary == "" || fetching} label="Chat with AI" icon={<AssistantIcon />} />
                        <Tab disabled={fetching} label="Note" icon={<NoteIcon />} />
                        <Tab disabled={fetching} label="Flashcards" icon={<StyleIcon />} />
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