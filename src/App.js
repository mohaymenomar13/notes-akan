import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import ReactMarkdown from 'react-markdown';

import './Flashcard';
import Flashcard from './Flashcard';

function App() {
  const [response, setResponse] = useState("");
  const [toPrompt, setToPrompt] = useState("");
  const [messages, setMessages] = useState([{ role: "user", content: "" }]);
  const [fetching, setFetching] = useState(false);
  const [flashcard, setFlashcard] = useState(false);
  const [summarizedFile, setSummarizedFile] = useState("");
  const [hasSummarizedFile, setHasSummarizedFile] = useState(false);
  const [lastProcessedMessageIndex, setLastProcessedMessageIndex] = useState(-1);
  const [flashcards, setFlashcards] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // New state for edit mode

  const toggleEditMode = () => {
    resizeTextArea();
    setIsEditing(!isEditing); // Toggle between edit and view modes
  };
  
  const textareaRef = useRef(null);

  const resizeTextArea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Initialize Google Generative AI client once
  const genAI = React.useMemo(() => new GoogleGenerativeAI(process.env.REACT_APP_API_KEY), []);
  const model = React.useMemo(() => genAI.getGenerativeModel({ model: "gemini-1.5-flash" }), [genAI]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    let fileContent = "";

    if (!hasSummarizedFile) {
      setHasSummarizedFile(true);
    }

    try {
      setFetching(true);

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
      ${fileContent}
      `;

      setResponse("");
      setMessages((prev) => [...prev, { role: "user", content: formattedPrompt }]);
    } catch (error) {
      console.error("File processing error:", error);
      alert("There was an error processing the file.");
    } finally {
      setFetching(false);
    }
  }, []);

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

            // Check for images on the page
            const operatorList = await page.getOperatorList();
            for (let j = 0; j < operatorList.fnArray.length; j++) {
              if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                text += "[image] "; // Append placeholder for images
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

  const handlePrompt = useCallback(() => {
    if (toPrompt.trim()) {
      setMessages((prevMessages) => [...prevMessages, { role: "user", content: toPrompt.trim() }]);
      setToPrompt("");
    }
  }, [toPrompt]);

  const textGenTextOnlyPromptStreaming = useCallback(async () => {
    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");

    try {
      await setResponse("");
      let fullResponse = "";

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setResponse((prev) => prev + chunkText);  
      }

      setMessages((prev) => [...prev, { role: "bot", content: fullResponse }]);

      if (hasSummarizedFile) {
        setSummarizedFile(fullResponse);
        localStorage.setItem("summarizedFile", JSON.stringify(fullResponse));
        setHasSummarizedFile(false);
      }
    } catch (error) {
      console.error("Error generating text:", error);
      setFetching(false); 
    } 
  }, [model, messages]);

  useEffect(() => {
    (async () => {
      const storedSummarizedfile = await localStorage.getItem("summarizedFile");
      const storedFlashcards = await localStorage.getItem("flashcards");

      if (storedSummarizedfile !== "") {
        await setSummarizedFile(JSON.parse(storedSummarizedfile));
        await setResponse(JSON.parse(storedSummarizedfile));
      }

      if (storedFlashcards !== "" && storedFlashcards !== null) {
        await setFlashcards(JSON.parse(storedFlashcards));
      }
      
    }) ();
    const newMessageIndex = messages.length - 1;
    if (!fetching && newMessageIndex > lastProcessedMessageIndex && messages[newMessageIndex].role === "user") {
      if (newMessageIndex !== 0) {
        setFetching(true);
        textGenTextOnlyPromptStreaming().finally(() => {
          setFetching(false);
          setLastProcessedMessageIndex(newMessageIndex);
        });
      }
    }
  }, [messages, lastProcessedMessageIndex, textGenTextOnlyPromptStreaming]);

  console.log(flashcards)

  const gotoFlashcard = () => {
    setFlashcard(true);
  }
  
  return (
    <div>
      {!flashcard ? (
        <div className="App">
          <div>
            <input type="text" value={toPrompt} onChange={(e) => setToPrompt(e.target.value)} />
            <button onClick={handlePrompt} disabled={fetching}>
              {fetching ? "Loading..." : "Submit"}
            </button>
            <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
            <button disabled={fetching} onClick={gotoFlashcard}>Flashcards</button>
            <h1>Chatbot Response:</h1>
            {isEditing ? (
              <textarea
                className="react-markdown"
                ref={textareaRef}
                value={summarizedFile}
                onChange={(e) => {
                  setSummarizedFile(e.target.value);
                  setResponse(e.target.value);
                  resizeTextArea();
                  localStorage.setItem("summarizedFile", JSON.stringify(e.target.value));
                }}
              />
            ) : (
              <ReactMarkdown className="react-markdown">{response}</ReactMarkdown>
            )}

            <button onClick={toggleEditMode}>
              {isEditing ? "View Markdown" : "Edit"}
            </button>
          </div>
        </div>
      ) : (
        <Flashcard summarizedFile={summarizedFile} setFlashcard={setFlashcard} setFlashcards={setFlashcards} flashcards={flashcards} />
      )}
    </div>
  );
}

export default App;
