import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { useEffect, useState } from "react";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from "react-router-dom";

export default function Flashcard({flashcardData}) {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const { summary, userSession, note_id, flashcards, setFlashcards, fetchNote } = flashcardData;
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [editIndex, setEditIndex] = useState();
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [diaEditFlash, setDiaEditFlash] = useState(false);
    const [diaDelFlash, setDiaDelFlash] = useState(false);
    const navigate = useNavigate('');

    const startReviewing = () => {
      navigate('/note/'+note_id+'/review');
    }

    const diaDelFlashOpen = (index) => {
      setEditIndex(index);
      setNewQuestion(flashcards[index].description);
      setDiaDelFlash(true);
    }
    const diaDelFlashClose = () => {
      setDiaDelFlash(false);
      setEditIndex(null);
    }

    const diaEditFlashOpen = (index) => {
        setEditIndex(index)
        setDiaEditFlash(true);
        setNewQuestion(flashcards[index].description);
        setNewAnswer(flashcards[index].answer);
        setEditIndex(index);
    }
    const diaEditFlashClose = () => {
        setDiaEditFlash(false);
    }
    const handleSaveDelFlash = async () => {
      const updatedFlashcards = [...flashcards];
      updatedFlashcards.splice(editIndex, 1);
      await setFlashcards(updatedFlashcards);
      handleSaveFlashcards(updatedFlashcards);
      setEditIndex(null);
      setNewQuestion('');
      setNewAnswer('');
      diaDelFlashClose();
    }

    const handleSaveEditFlash = async () => {
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[editIndex] = { description: newQuestion, answer: newAnswer};
      await setFlashcards(updatedFlashcards);
      handleSaveFlashcards(updatedFlashcards);
      setEditIndex(null);
      setNewQuestion('');
      setNewAnswer('');
      diaEditFlashClose();
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
                <button onClick={startReviewing}>Start Reviewing</button>
            </div>
            <div style={{ border: "solid 1px black", width: "800px", minWidth: "500px", maxWidth: "800px" }}> 
            </div>

              <div>
                {flashcards.map((card, index) => (
                <div style={{border: "solid 1px black"}} key={index}>
                  <p><strong>Question: </strong>{card.description}</p><br/>
                  <p><strong>Answer: </strong>{card.answer}</p><br/>
                  <button onClick={(e) => diaEditFlashOpen(index)}>Edit</button>
                  <button onClick={(e) => diaDelFlashOpen(index)}>Delete</button>
                </div>
                ))}
            </div>

            <Dialog
              open={diaEditFlash}
              onClose={diaEditFlashClose}
            >
              <DialogTitle>Edit Flashcard</DialogTitle>
              <DialogContent>
                <DialogContentText>
                <input type="text" placeholder="Question" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}/>
                <textarea placeholder="Answer" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)}/>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={diaEditFlashClose} color="secondary">
                  Close
                </Button>
                <Button onClick={handleSaveEditFlash} color="primary">
                  Update
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={diaDelFlash}
              onClose={diaDelFlashClose}
            >
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this flashcard?<br/>
                  <strong>Question: </strong>{newQuestion}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={diaDelFlashClose} color="secondary">
                  Close
                </Button>
                <Button onClick={handleSaveDelFlash} color="primary">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
        </div>
    );
}