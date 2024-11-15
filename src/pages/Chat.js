import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export default function Chat({chatData}) {
    
    const { summary, userSession, messages, setMessages, note_id, handleSaveChat} = chatData;
    const [newMessages, setNewMessages] = useState([]);
    const [input, setInput] = useState('');
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
        history: chatData.messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        })),
    });

    useEffect(() => {
        handleSaveChat(messages);
    }, [messages, handleSaveChat]);

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
        <div style={{ border: "solid 1px black", width: "800px", minWidth: "500px", maxWidth: "800px" }}> 
            <h1>Chat</h1>
            <ChatBox messages={chatData.messages} />
            <div style={{position: "fixed", bottom: "10px", width: "800px"}}>
                <input
                    type="text"
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ width: "30%", padding: "10px" }}
                />
                <button onClick={sendMessage} style={{ padding: "10px" }}>Send</button>
            </div>
        </div>
    );
}

function ChatBox({ messages }) {
    return (
        <div style={{ paddingBottom: "50px" }}>
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
                                padding: '10px',
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
