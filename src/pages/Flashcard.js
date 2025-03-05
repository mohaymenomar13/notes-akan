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
import { Box, Checkbox, FormControlLabel, Grid2, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField } from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { CheckBox } from "@mui/icons-material";

export default function Flashcard({flashcardData}) {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const apiUrl = process.env.REACT_APP_API_URL;

    const { fetching, setFetching, flashcardId, summary, userSession, note_id, flashcards, setFlashcards, fetchNote } = flashcardData;
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [editIndex, setEditIndex] = useState();
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [diaAddFlash, setDiaAddFlash] = useState(false);
    const [diaEditFlash, setDiaEditFlash] = useState(false);
    const [diaDelFlash, setDiaDelFlash] = useState(false);
    const [select, setSelect] = useState(false);
    const [selectedFlashcards, setSelectedFlashcards] = useState([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const navigate = useNavigate('');

    const startReviewing = () => {
      navigate('/note/'+note_id+'/review');
    }

    const diaAddFlashOpen = () => {
      setDiaAddFlash(true);
      setNewQuestion('');
      setNewAnswer('');
    }
    const diaAddFlashClose = () => {
      setDiaAddFlash(false);
      setNewQuestion('');
      setNewAnswer('');
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
      if (answer.length > 0 || flashcards.length > 0) {
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[editIndex] = { description: newQuestion, answer: newAnswer};
        await setFlashcards(updatedFlashcards);
        handleSaveFlashcards(updatedFlashcards);
        setEditIndex(null);
        setNewQuestion('');
        setNewAnswer('');
        diaEditFlashClose();
      } else {
        setIsEmpty(true);
      }
    }

    const handleSaveFlashcards = async (flashCards) => {
        try {
            const data = {
                flashcardId: flashcardId,
                flashcards: JSON.stringify(flashCards)
            }
            console.log(data);
            const response = await axios.put(apiUrl+'saveflashcards.php', data);
            console.log(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    const generateFlashcards = async () => {
      console.log(summary);
      setFetching(true);
        if (!summary) {
          alert("Please create a summarized file before generating flashcards.");
          return;
        }
    
        const prompt = `
          Make an array of objects to generate based on the content to be generated for the flashcards:
          - Make more of flashcards with the number based on every key words in the content.
          - This is for JSON generation.
          - If there's a possible enumeration question, add it.
          - Format: [{ description: "<Description of Word Key>", answer: "<Word Key>" }]
          Content: 
          ${summary}
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
        } finally {
          setFetching(false);
        }
      };

    const addFlashcard = () => {
        if (answer.length > 0 || question.length > 0) {
          const updatedFlashcards = [...flashcards, { description: question, answer: answer }];
          setFlashcards(updatedFlashcards);
          handleSaveFlashcards(updatedFlashcards);
          setQuestion('');
          setAnswer('');
        } else {
          setIsEmpty(true);
        }
    }

    const toggleSelect = () => {
      setSelect(!select);
      setSelectedFlashcards([]);
    };

    const handleCheckboxToggle = (index) => {
      if (selectedFlashcards.includes(index)) {
        setSelectedFlashcards((prev) =>
          prev.filter((selectedIndex) => selectedIndex !== index)
        );
      } else {
        setSelectedFlashcards((prev) => [...prev, index]);
      }
    };
  
    const deleteSelectedFlashcards = async () => {
      const updatedFlashcards = flashcards.filter(
        (_, index) => !selectedFlashcards.includes(index)
      );
      await setFlashcards(updatedFlashcards);
      setSelectedFlashcards([]); 
      handleSaveFlashcards(updatedFlashcards); 
      setSelect(false);
    };
    
    return (
        <div>
          <Grid2 container columns={11} justifyContent={'center'} spacing={2}>
            <Grid2 size={2} hidden={window.innerWidth < 500}></Grid2>
            <Grid2 size={6} sx={{ height: "81vh", width: window.innerWidth < 500 ? "100%":"60%", overflowY: "auto",fontSize: 17 , backgroundColor: "#CFE1B9", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 3}}>
              <p style={{marginTop:"-20px"}}>Flashcards: <strong>{flashcards.length}</strong></p>
              <Box sx={{marginBottom: 1}}>
                {select && (
                  <>
                    <Button color="secondary" variant="contained" sx={{ color: "white", backgroundColor: "#728156", marginRight: 2,
                      }}
                      onClick={() => {
                        if (selectedFlashcards.length === flashcards.length) {
                          setSelectedFlashcards([]); 
                        } else {
                          setSelectedFlashcards(flashcards.map((_, index) => index)); 
                        }
                      }}
                    >
                      {selectedFlashcards.length === flashcards.length ? "Deselect All" : "Select All"}
                    </Button>
                    <Button color="primary" variant="contained" sx={{ color: "white", backgroundColor: "#728156", marginRight: 2, }} onClick={deleteSelectedFlashcards} disabled={selectedFlashcards.length === 0}>
                      Delete Selected
                    </Button>
                  </>
                )}
              </Box>
              {flashcards.map((card, index) => (
                <Box
                  key={index}
                  sx={{ borderRadius: 5, padding: 1, backgroundColor: "#E7F5DC", color: "#728156", marginBottom: 2,
                  }}
                  onClick={() => handleCheckboxToggle(index)}
                >
                  {select && (
                    <Checkbox checked={selectedFlashcards.includes(index)} onChange={() => handleCheckboxToggle(index)} inputProps={{ "aria-label": `Select Flashcard ${index + 1}` }}/>
                  )}
                  <p>
                    <strong>Question: </strong>
                    {card.description}
                  </p>
                  <p>
                    <strong>Answer: </strong>
                    {card.answer}
                  </p>
                  {!select && (
                    <>
                      <Button
                        color="primary"
                        variant="contained"
                        sx={{
                          color: "white",
                          backgroundColor: "#728156",
                          marginRight: 2,
                        }}
                        onClick={() => diaEditFlashOpen(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="primary"
                        variant="contained"
                        sx={{
                          color: "white",
                          backgroundColor: "#728156",
                        }}
                        onClick={() => diaDelFlashOpen(index)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              ))}
              
            </Grid2>
              <Grid2 size={2} spacing={10} hidden={window.innerWidth < 500}>
                <Button disabled={fetching} sx={{ fontSize: 16, marginBottom: 2}} size='large' fullWidth variant='contained' onClick={diaAddFlashOpen} startIcon={<AddIcon/>}><strong>Add Flashcard</strong></Button>
                <Button disabled={fetching} sx={{ fontSize: 16, marginBottom: 2, backgroundColor: select && "#CFE1B9"}} size='large' fullWidth variant='contained' onClick={toggleSelect} startIcon={<ChecklistIcon/>}><strong>Select Flashcards</strong></Button>
                <Button disabled={fetching || summary == ""} sx={{ fontSize: 15, marginBottom: 2}} size='large' fullWidth variant='contained' onClick={generateFlashcards} startIcon={<AutoAwesomeIcon/>}><strong>{fetching ? "Generating..." : "Generate Flashcards"}</strong></Button>
                <Button disabled={fetching || flashcards.length === 0} sx={{ fontSize: 16, marginBottom: 2}} size='large' fullWidth variant='contained' onClick={startReviewing} startIcon={<QuestionAnswerIcon/>}><strong>Start Reviewing</strong></Button>
              </Grid2>
          </Grid2>

            <Dialog open={diaAddFlash} onClose={diaAddFlashClose}>
              <DialogTitle>Add Flashcard</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  <Grid2 display={'grid'}>
                    <TextField error={isEmpty} label="Question" multiline maxRows={5} sx={{marginTop:1, width: window.innerWidth < 500 ? "auto" : 400}} value={question} onChange={(e) => {setQuestion(e.target.value); setIsEmpty(false)}}/>
                    <TextField error={isEmpty} label="Answer" variant="filled" multiline maxRows={5} sx={{marginTop:1, width: window.innerWidth < 500 ? "auto" : 400}} value={answer} onChange={(e) => {setAnswer(e.target.value); setIsEmpty(false)}}/>
                  </Grid2>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={diaAddFlashClose} color="secondary">
                  Close
                </Button>
                <Button onClick={addFlashcard} color="primary">
                  Add
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={diaEditFlash} onClose={diaEditFlashClose}>
              <DialogTitle>Edit Flashcard</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  <Grid2 display={'grid'}>
                    <TextField error={isEmpty} maxRows={5} label="Question" multiline sx={{marginTop:1, width: 400}} value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}/>
                    <TextField error={isEmpty} maxRows={5} label="Answer" variant="filled" multiline sx={{marginTop:1}} value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)}/>
                  </Grid2>
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

            <SpeedDial
                ariaLabel="SpeedDial basic example"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
                hidden={window.innerWidth > 500}
                disabled={fetching}
            >
              <SpeedDialAction
                key={"Start Reviewing"}
                icon={<QuestionAnswerIcon />}
                tooltipTitle={"Start Reviewing"}
                onClick={startReviewing}
                disabled={fetching || flashcards.length === 0}
              />
              <SpeedDialAction
                key={"Generate Flashcards"}
                icon={<AutoAwesomeIcon />}
                tooltipTitle={"Generate Flashcards"}
                onClick={generateFlashcards}
                disabled={fetching || summary == ""}
              />
              <SpeedDialAction
                key={"Select Flashcards"}
                icon={<ChecklistIcon />}
                tooltipTitle={"Select Flashcards"}
                onClick={toggleSelect}
                disabled={fetching}
              />
              <SpeedDialAction
                key={"Add Flashcards"}
                icon={<AddIcon />}
                tooltipTitle={"Add Flashcards"}
                onClick={diaAddFlashOpen}
                disabled={fetching}
              />
            </SpeedDial>
        </div>
    );
}