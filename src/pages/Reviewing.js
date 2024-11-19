import axios from "axios";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";

export default function Reviewing() {
    const userSession = document.cookie.split(';').find(cookie => cookie.trim().startsWith('user_session=')).replace('user_session=', '');
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
            const response = await axios.get('http://localhost/api/note.php', { params });
            setTitle(response.data.title);
            if (response.data.flashcards !== null) {
                setEmptyFlashcards(false);
                setFlashcards(JSON.parse(response.data.flashcards));
                randomizeFlashcards(JSON.parse(response.data.flashcards));
                setRatings(Array(JSON.parse(response.data.flashcards).length).fill(null));
            } else {
                setEmptyFlashcards(true);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const reviewQuestions = () => {
        setReviewMode(true);
        setBadQuestions(flashcards.filter((_, index) => ratings[index] === "Bad"))
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
            <h1>Reviewing</h1>
            {emptyFlashcards ? 
            (<>
            <h2>There's no flashcards existing to this note.</h2>
            </>) 
            : 
            !reviewMode ? 
            (<>
                <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                  <Markdown className="front">{randomizedFlashcards[currentIndex].description}</Markdown>
                  <Markdown className="back">{randomizedFlashcards[currentIndex].answer}</Markdown>
                </div>
                <div className="navigation">
                  <button onClick={prevCard} disabled={currentIndex === 0 || ratings[currentIndex] === null}>Previous</button>
                  <button onClick={nextCard} disabled={currentIndex === randomizedFlashcards.length - 1 || ratings[currentIndex] === null}>Next</button>
                </div>
                <div className="rating-buttons">
                  <button className={`rating ${selectedRating === "Good" ? 'selected' : ''}`} onClick={() => rateQuestion("Good")}>
                    Good
                  </button>
                  <button className={`rating ${selectedRating === "Bad" ? 'selected' : ''}`} onClick={() => rateQuestion("Bad")}>
                    Bad
                  </button>
                </div>
                <button onClick={(e) => navigate('/note/'+note_id)}>Back to Dashboard</button>
                <button onClick={reviewQuestions} disabled={ratings.some((rating) => rating === null)}>Review Questions</button>
            </>)
            :
            (
            <div>
                <div>
                    <p><strong>Score: </strong>{calculateScore()}</p>
                    <p><strong>Percentage: </strong>{calculatePercentage()}%</p>
                    <p><strong>Time used: </strong>{calculateTimeUsed()}</p>
                </div>
                <h2>Questions You Found Difficult</h2>
                {badQuestions.length > 0 ? (
                    badQuestions.map((card, index) => (
                    <div key={index}>
                        <p>{card.description}</p>
                        <p><strong>Answer:</strong> {card.answer}</p>
                    </div>
                    ))
                ) : (
                    <p>All questions were rated as good!</p>
                )}
                <button onClick={(e) => navigate('/note/'+note_id)}>Back to Dashboard</button>
                </div>
            )}
        </div>
    )
}