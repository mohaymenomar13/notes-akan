import React, { useState, useEffect } from 'react';
import './App.css';
import { HfInference } from "@huggingface/inference";
import * as mammoth from 'mammoth'; // For DOCX files
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry'; // Import the worker for PDF.js

function App() {
  const apikey = "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";
  const model = "meta-llama/Llama-3.2-3B-Instruct";
  const maxTokens = 1000;

  const [response, setResponse] = useState("");
  const [toPrompt, setToPrompt] = useState("");
  const [messages, setMessages] = useState([{ role: "user", content: "Hi!" }]);
  const [fetching, setFetching] = useState(false);

  const fetchResponse = async () => {
    const client = new HfInference(apikey);
    const stream = client.chatCompletionStream({
      model,
      messages,
      max_tokens: maxTokens,
    });

    let fullResponse = "";
    setFetching(true);

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        const newContent = chunk.choices[0].delta.content;
        fullResponse += newContent;
        console.log(newContent);
      }
      setResponse(fullResponse);
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: fullResponse }
    ]);

    setFetching(false);
  };

  const handlePrompt = () => {
    setMessages((prevMessages) => [...prevMessages, { role: "user", content: toPrompt }]);
    setToPrompt("");
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop();
    let fileContent = "";

    if (fileType === 'pdf') {
      fileContent = await extractTextFromPDF(file);  // Extract text from PDF
    } else if (fileType === 'docx') {
      fileContent = await extractTextFromDocx(file);
    } else if (fileType === 'txt') {
      fileContent = await extractTextFromTxt(file);
    } else {
      alert('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (fileContent) {
      setMessages((prevMessages) => [...prevMessages, { role: "user", content: `Summarize: ${fileContent}` }]);
    }
  };

  const extractTextFromPDF = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const pdfData = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        let text = "";

        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const content = await page.getTextContent();
          content.items.forEach((item) => {
            text += item.str + " ";
          });
        }
        resolve(text.trim());  // Return the extracted text
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromDocx = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const { value } = await mammoth.extractRawText({ arrayBuffer: reader.result });
        resolve(value);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromTxt = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsText(file);
    });
  };

  useEffect(() => {
    if (fetching || messages[messages.length - 1].role !== "user") return;
    fetchResponse();
  }, [messages]);

  return (
    <div className="App">
      <div>
        <input type="text" value={toPrompt} onChange={(e) => setToPrompt(e.target.value)} />
        <button onClick={handlePrompt}>Submit</button>
        <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
        <h1>Chatbot Response:</h1>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default App;
