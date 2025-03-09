import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { GoogleGenerativeAI } from '@google/generative-ai';

import theme from './theme';
import { ThemeProvider } from '@emotion/react';
import { Box, Button, Grid2, IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function Chat({chatData}) {
    
    const { fetching, setFetching, summary, userSession, messages, setMessages, note_id, handleSaveChat} = chatData;
    const apiUrl = process.env.REACT_APP_API_URL;
    const [newMessages, setNewMessages] = useState([]);
    const [input, setInput] = useState('');
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
        history: chatData.messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        })),
    });

    useEffect(() => {
        handleSaveChat(messages);
    }, [messages]);

    const sendMessage = async () => {
        try {
            const userMessage = { role: 'user', content: input };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setInput('');

            const response = await chat.sendMessageStream(input);

            let botMessageContent = '';
            for await (const chunk of response.stream) {
                const chunkText = chunk.text();
                botMessageContent += chunkText;
                
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    if (updatedMessages[updatedMessages.length - 1].role === 'model') {
                        updatedMessages[updatedMessages.length - 1].content = botMessageContent;
                    } else {
                        updatedMessages.push({ role: 'model', content: botMessageContent });
                    }
                    setNewMessages(updatedMessages)
                    return updatedMessages;
                });
            }
        } catch (err) {
            console.error(err);
            chatData.setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages.push({ role: 'model', content: "An Error occured." });
                return updatedMessages;
            })
        }
    };

    return (
        <>
        <Grid2 container justifyContent={'center'}>
        <ThemeProvider theme={theme}>
            
            <Grid2 sx={{ height: "73vh", width: window.innerWidth < 500 ? "100%":"60%",overflowY: "auto", fontSize: 17 , backgroundColor: "#b6c99b", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 3}} size={5.8}>
                <ChatBox messages={chatData.messages} />
            </Grid2>

            <div style={{position: "fixed", bottom: "0px", width: window.innerWidth < 500 ? "100%":"60%", overflow: "hidden"}}>
                <Box display={'flex'}>
                    <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message here..." multiline fullWidth maxRows={3} variant='filled' sx={{backgroundColor: "#88976C"}}></TextField>
                    <Grid2 container sx={{backgroundColor: "#88976C"}} justifyContent={'center'}>
                        <IconButton onClick={sendMessage}>
                            <SendIcon/>
                        </IconButton>
                    </Grid2>
                </Box>
            </div>
        </ThemeProvider>
        </Grid2>
        </>
    );
}

function ChatBox({ messages }) {
    return (
        <div style={{  height: "100%", paddingRight: 10, paddingLeft: 10}}>
            <div>
                {messages.slice(1).map((message, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '10px'
                        }}>
                        <div
                            style={{
                                maxWidth: message.role === 'user' ? '70%' : '100%',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                borderRadius: '10px',
                                backgroundColor: message.role === 'user' ? '#dcf8c6' : '#f1f0f0',
                                textAlign: 'left',
                            }}>
                            <Markdown>{message.content}</Markdown>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
