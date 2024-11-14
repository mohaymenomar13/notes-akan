import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import Markdown from "react-markdown";
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

export default function Note({noteData}) {
    const { summary, setSummary, userSession, note_id, title, flashcards, messages, setMessages, fetchNote } = noteData;
    const [isEditing, setIsEditing] = useState(false);
    const [newSummary, setNewSummary] = useState(summary);
    const [fetching, setFetching] = useState(false);
    const [preview, setPreview] = useState(summary);
    const textareaRef = useRef(null);

    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const resizeTextArea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const toggleEditMode = () => {
        resizeTextArea();
        setIsEditing(!isEditing);
        handleSaveNote(newSummary);
    };

    const handleSaveNote = async (newSummarize) => {
        console.log('NEW SUMMARY:\n', newSummarize);
        setPreview(newSummarize);
        setSummary(newSummarize);
        try {
            const data = {
                user_id: userSession,
                note_id: note_id,
                title: title,
                summary: newSummarize
            };
            const response = await axios.put('http://localhost/api/savenote.php', data);
            console.log(response.data);
            fetchNote();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (event) => {
        console.log("----UPLOADING FILE----");
        const file = event.target.files[0];
        if (!file) return;

        const fileType = file.name.split('.').pop().toLowerCase();
        let fileContent = "";

        try {
            if (fileType === 'pdf') fileContent = await extractTextFromPDF(file);
            else if (fileType === 'docx') fileContent = await extractTextFromDocx(file);
            else if (fileType === 'txt') fileContent = await extractTextFromTxt(file);
            else return alert('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');

            const formattedPrompt = `
            Summarize the following content according to this format. Summarize as much as possible for study material:
              - Use "<Word Key> - <Description>." for single key-description items.
              - Don’t put too many chapters if not necessary.
              - You may use 'Markdown'
              - If the Description is an enumeration, format as: 
                "<Description>:
                  1. <Word Key>
                  2. <Word Key>
                  3. <Word Key>
                  ..."
              - If an image is present, it will be indicated by the placeholder "[image]".
            Important: Copy the exact wording of the descriptions as they appear in the text. Do not paraphrase or alter the descriptions in any way. If you have no choice, then do what necessary to avoid 'RECITATION'.
            Content to summarize:
          ${fileContent}`;

            let fullResponse = "";
            setPreview('');
            setNewSummary('');
            setSummary('');
            const result = await model.generateContentStream(formattedPrompt);

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;
                setPreview((prev) => prev + chunkText);  
                setNewSummary(fullResponse);
            }

            handleSaveNote(fullResponse); 
        } catch (error) {
            console.error("File processing error:", error);
            alert("There was an error processing the file.");
        } finally {
            setFetching(false);
        }
    };

    const extractTextFromPDF = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const pdfData = new Uint8Array(reader.result);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    let text = "";

                    for (let i = 0; i < pdf.numPages; i++) {
                        const page = await pdf.getPage(i + 1);
                        const content = await page.getTextContent();
                        const pageText = content.items.map(item => item.str).join(" ");
                        text += pageText + " ";

                        const operatorList = await page.getOperatorList();
                        for (let j = 0; j < operatorList.fnArray.length; j++) {
                            if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                                text += "[image] "; 
                            }
                        }
                    }
                    resolve(text.trim());
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const extractTextFromDocx = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const { value } = await mammoth.extractRawText({ arrayBuffer: reader.result });
                    resolve(value);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const extractTextFromTxt = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    return (
        <div>
            <div style={{ border: "solid 1px black" }}>
                <button onClick={toggleEditMode}>
                    {isEditing ? "View Markdown" : "Edit"}
                </button> <br/>
                <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt" /><br/>
            </div>
            <div style={{ border: "solid 1px black", width: "800px", minWidth: "500px", maxWidth: "800px" }}> 
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={newSummary}
                        onChange={(e) => {
                            resizeTextArea();
                            setNewSummary(e.target.value);
                            fetchNote();
                        }}
                    />
                ) : (
                    <Markdown>{preview}</Markdown>
                )}
            </div>
        </div>
    );
}
