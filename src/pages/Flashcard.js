import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { useEffect, useState } from "react";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function Flashcard({flashcardData}) {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { summary, userSession, note_id, flashcards, setFlashcards, fetchNote } = flashcardData;
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [diaEditFlash, setDiaEditFlash] = useState(false);

    const diaEditFlashOpen = () => {
        setDiaEditFlash(true);
    }
    const diaEditFlashClose = () => {
        setDiaEditFlash(false);
    }

    const handleSaveFlashcards = async (flashCards) => {
        try {
            const data = {
                user_id: userSession,
                note_id: note_id,
                flashcards: JSON.stringify(flashCards)
            }
            const response = await axios.put('http://localhost/api/saveflashcards.php', data);
        } catch (err) {
            console.error(err);
        }
    }

    const generateFlashcards = async () => {
        if (!summary) {
          alert("Please create a summarized file before generating flashcards.");
          return;
        }
    
        const prompt = `
          Make an array of objects to generate based on the content to be generated for the flashcards:
          - Make it as much as possible that the content is familiarized.
          - This is for JSON generation.
          - If there's a possible enumeration question, add it.
          - Format: [{ description: "...", answer: "..." }]
          Content: ${summary}
        `;
    
        try {
          const result = await model.generateContent(prompt);
          let jsonString = await result.response.text();
          jsonString = jsonString.replace(/```json|```/g, '').trim();
          jsonString = jsonString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
          const parsed = JSON.parse(jsonString);
          console.log(parsed);
          await handleSaveFlashcards(parsed);
          await setFlashcards(parsed);
        } catch (error) {
          console.error("Error generating flashcards:", error);
        }
      };

    const addFlashcard = () => {
        const updatedFlashcards = [...flashcards, { description: question, answer: answer }];
        setFlashcards(updatedFlashcards);
        handleSaveFlashcards(updatedFlashcards);
        setQuestion('');
        setAnswer('');
    }
    
    return (
        <div>
            <div style={{ border: "solid 1px black" }}>
                <input type="text" placeholder="question" value={question} onChange={(e) => setQuestion(e.target.value)}/><br/>
                <textarea type="text" placeholder="answer" value={answer} onChange={(e) => setAnswer(e.target.value)}/><br/>
                <button onClick={addFlashcard}>Add Question</button> <br/>
                <button onClick={generateFlashcards}>Generate Flashcards</button> <br/>
                <button>Start Reviewing</button>
            </div>
            <div style={{ border: "solid 1px black", width: "800px", minWidth: "500px", maxWidth: "800px" }}> 
            </div>

            <div>
                <table>
                <thead>
                    <tr>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {flashcards.map((card, index) => (
                    <tr key={index}>
                        <td>{card.description}</td>
                        <td>{card.answer}</td>
                        <td>
                        <button onClick={diaEditFlashOpen}>Edit</button>
                        <button>Delete</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            <Dialog
              open={diaEditFlash}
              onClose={diaEditFlashClose}
            >
              <DialogTitle>Edit Flashcard</DialogTitle>
              <DialogContent>
                <DialogContentText>
                <input type="text" placeholder="Question" />
                <textarea placeholder="Answer" />
                <button>Update</button>
                <button>Close</button>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={diaEditFlashClose} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
        </div>
    );
}