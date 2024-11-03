import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, useEffect, useCallback } from 'react';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import ReactMarkdown from 'react-markdown';

function App() {
  const [response, setResponse] = useState("");
  const [toPrompt, setToPrompt] = useState("");
  const [messages, setMessages] = useState([{ role: "user", content: "" }]);
  const [fetching, setFetching] = useState(false);
  const [lastProcessedMessageIndex, setLastProcessedMessageIndex] = useState(-1);

  // Initialize Google Generative AI client once
  const genAI = React.useMemo(() => new GoogleGenerativeAI('AIzaSyAo6PDHB40-sFxux21U99sgw2WTedBGBJM'), []);
  const model = React.useMemo(() => genAI.getGenerativeModel({ model: "gemini-1.5-flash" }), [genAI]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const fileType = file.name.split('.').pop().toLowerCase();
    let fileContent = "";
  
    try {
      setFetching(true);

      if (fileType === 'pdf') fileContent = await extractTextFromPDF(file);
      else if (fileType === 'docx') fileContent = await extractTextFromDocx(file);
      else if (fileType === 'txt') fileContent = await extractTextFromTxt(file);
      else return alert('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
  
      const formattedPrompt = `
        Summarize the following content according to this format. Summarize as much as possible for study material:
        - For each Chapter (If only there's chapters), start with "Chapter: <Chapter Title or Number>"
        - Within each Chapter:
          - Use "<Word Key> - <Description>." for single key-description items.
          - If the Description is an enumeration, format as: 
            "<Description>:
              1. <Word Key>
              2. <Word Key>
              3. <Word Key>
              ..."
          - If an image is present, it will be indicated by the placeholder "[image]".
        Important: Copy the exact wording of the descriptions as they appear in the text. Do not paraphrase or alter the descriptions in any way.
        Content to summarize:
      ${fileContent}
      `;

  
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
      setResponse(""); 
      let fullResponse = "";

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();  
        fullResponse += chunkText;
        setResponse((prev) => prev + chunkText);  
      }

      setMessages((prev) => [...prev, { role: "bot", content: fullResponse }]);
    } catch (error) {
      console.error("Error generating text:", error);
      setFetching(false); 
    }
  }, [model, messages]);
  
  

  useEffect(() => {
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
  

  return (
    <div className="App">
      <div>
        <input type="text" value={toPrompt} onChange={(e) => setToPrompt(e.target.value)} />
        <button onClick={handlePrompt} disabled={fetching}>
          {fetching ? "Loading..." : "Submit"}
        </button>
        <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
        <h1 style={{color: "#bb86fc"}}>Chatbot Response:</h1>
        <ReactMarkdown className="react-markdown">{response}</ReactMarkdown>
      </div>
    </div>
  );
}

export default App;