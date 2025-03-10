import { Backdrop, Box, Button, CircularProgress, Grid2, IconButton, LinearProgress, Paper, styled, TextField, ThemeProvider } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import theme from "./theme";
import HomeIcon from '@mui/icons-material/Home';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

export default function Reviewing() {
    // const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session=')).replace('user_session=', '');
    const userSession = localStorage.getItem('user_session');
    const [flashcards, setFlashcards] = useState([]);
    const [title, setTitle] = useState('');
    const [emptyFlashcards, setEmptyFlashcards] = useState(true);
    const [randomizedFlashcards, setRandomizedFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [ratings, setRatings] = useState(Array(flashcards.length).fill(null));
    const [badQuestions, setBadQuestions] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;
    const { note_id } = useParams(); 
    const navigate = useNavigate();

    const nextCard = () => {
        setIsFlipped(false);
        setSelectedRating(null);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % randomizedFlashcards.length);
        }, 300);
    };
    
    const prevCard = () => {
        setIsFlipped(false);
        setSelectedRating(null);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + randomizedFlashcards.length) % randomizedFlashcards.length);
        }, 300);
    };

    const rateQuestion = (rating) => {
        const newRatings = [...ratings];
        newRatings[currentIndex] = rating;
        setRatings(newRatings);
        setSelectedRating(rating);

    };

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
      };

    const fetchNote = async () => {
        try {
            const params = new URLSearchParams();
            params.append('user_id', userSession);
            params.append('note_id', note_id);
            const response = await axios.get(apiUrl+'note.php', { params });
            setTitle(response.data.title);
            if (response.data.flashcard.flashcard !== null || response.data.flashcard.flashcard !== "null") {
                setEmptyFlashcards(false);
                setFlashcards(JSON.parse(response.data.flashcard.flashcard));
                randomizeFlashcards(JSON.parse(response.data.flashcard.flashcard));
                setRatings(Array(JSON.parse(response.data.flashcard.flashcard).length).fill(null));
            } else {
                setEmptyFlashcards(true);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const reviewQuestions = () => {
        console.log(ratings);
        console.log(randomizedFlashcards);
        setReviewMode(true);
        setBadQuestions(randomizedFlashcards.filter((_, index) => ratings[index] === "Bad"))
    };

    useEffect(() => {
        fetchNote();
    },[]);

    const randomizeFlashcards = async (flashcards) => {
        if (flashcards.length > 0) {
            setRandomizedFlashcards(shuffleArray(flashcards));
        }
    }

    useEffect(() => {
    },[randomizedFlashcards]);

    useEffect(() => {
        console.log(`
            Current index: ${currentIndex}
            Current rating: ${ratings}
            Flashcards length: ${flashcards.length}
            Progress: ${(currentIndex+1)/flashcards.length*100}
        `);
    },[prevCard, nextCard])

    const calculateScore = () => {
        return ratings.filter((rating) => rating === "Good").length;
    };
    const calculatePercentage = () => {
        const score = calculateScore();
        return flashcards.length > 0 ? ((score / flashcards.length) * 100).toFixed(2) : 0;
    };
    const [startTime, setStartTime] = useState(null);
    useEffect(() => {
        setStartTime(Date.now()); // Set the time when the component mounts or the review starts
    }, []);

    const calculateTimeUsed = () => {
        const endTime = Date.now();
        const timeDiff = endTime - startTime; // Time difference in milliseconds
        const seconds = Math.floor((timeDiff / 1000) % 60);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    
    return (
        <div>
        <ThemeProvider theme={theme}>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={title == ""}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Grid2 justifyContent={"space-between"} sx={{marginRight: 5, marginLeft: 5}} container>
                <Grid2 container>
                    <h1>{title}</h1>
                </Grid2>
                <IconButton onClick={() => navigate("/")}><HomeIcon sx={{ fontSize: 50 }}/></IconButton>
            </Grid2>
            {emptyFlashcards ? 
            (<>
            <h2>There's no flashcards existing to this note.</h2>
            </>) 
            : 
            !reviewMode ? 
            (<>            
            <Grid2 container display={'grid'}>
                <Grid2>
                    <div style={{width: window.innerWidth < 500 ? "80%":"80vh"}} className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                        <Markdown className="front">{randomizedFlashcards[currentIndex].description}</Markdown>
                        <Markdown className="back">{randomizedFlashcards[currentIndex].answer}</Markdown>
                    </div>
                </Grid2>
                <Grid2 container display={'grid'} justifyContent={'center'} rowSpacing={1} sx={{marginTop: 5}} columnSpacing={{ xs: 1, sm: 1, md: 3 }}>
                    <LinearProgress variant="buffer" value={(currentIndex+1)/flashcards.length*100}/>
                    <Box sx={{ width: '100%' }}>
                        <Grid2 container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid2 size={6}>
                            <Button fullWidth onClick={prevCard} disabled={currentIndex === 0 || ratings[currentIndex] === null} variant="contained">Previous</Button>
                            </Grid2>
                            <Grid2 size={6}>
                            <Button fullWidth onClick={nextCard} disabled={currentIndex === randomizedFlashcards.length - 1 || ratings[currentIndex] === null} variant="contained">Next</Button>
                            </Grid2>
                            <Grid2 size={6}>
                            <Button fullWidth className={`rating ${selectedRating === "Good" ? 'selected' : ''}`} onClick={() => rateQuestion("Good")} variant="contained">Good</Button>
                            </Grid2>
                            <Grid2 size={6}>
                            <Button fullWidth className={`rating ${selectedRating === "Bad" ? 'selected' : ''}`} onClick={() => rateQuestion("Bad")} variant="contained">Bad</Button>
                            </Grid2>
                        </Grid2>
                    </Box>
                </Grid2>
                <Grid2 container justifyContent={'center'} sx={{marginTop:2}}>
                    <Grid2 sx={{width: 380}}>
                        <Button sx={{marginBottom: 2}} fullWidth variant="contained" onClick={(e) => navigate('/note/'+note_id)}>Back to Dashboard</Button>
                        <Button fullWidth variant="contained" onClick={reviewQuestions} disabled={ratings.some((rating) => rating === null)}>Review Result</Button>
                    </Grid2>
                </Grid2>
            </Grid2>
            </>)
            :
            (
                <>
                    <Grid2 container justifyContent={'center'}>
                        <Grid2 sx={{ width: window.innerWidth < 500 ? "100%":"60%", padding: 2, fontSize: 17 , backgroundColor: "#b6c99b", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 3}} size={6.4}>
                            <Box sx={{ borderRadius: 5, padding: 1, backgroundColor: "#E7F5DC", color: "#728156", marginBottom: 2, }}>
                                <p><strong>Score: </strong>{calculateScore()} / {flashcards.length}</p>
                                <p><strong>Percentage: </strong>{calculatePercentage()}%</p>
                                <p><strong>Time used: </strong>{calculateTimeUsed()}</p>    
                            </Box>
                            <h2>Questions you found difficult:</h2>
                        </Grid2>
                        <Grid2 sx={{ width: window.innerWidth < 500 ? "100%":"60%", padding: 2, fontSize: 17 , backgroundColor: "#b6c99b"}} size={6.4}>
                            {badQuestions.length > 0 ? (
                                badQuestions.map((card, index) => (
                                    <Box sx={{ color: "white", borderRadius: 5, padding: 1, backgroundColor: "#E7F5DC", color: "#728156", marginBottom: 2, }}>
                                        <p><strong>Question:</strong> {card.description}</p>
                                        <p><strong>Answer:</strong> {card.answer}</p>
                                    </Box>
                                ))
                                )
                                : 
                                (
                                <p>All questions were rated as good!</p>
                            )}
                            <Button sx={{marginBottom: 2}} fullWidth variant="contained" onClick={(e) => navigate('/note/'+note_id)}>Back to Dashboard</Button>
                        </Grid2>
                    </Grid2>
                </>
            )}
        </ThemeProvider>
        </div>
    )
}