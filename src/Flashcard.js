import React, { useState } from 'react';
import './Flashcard.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

function Flashcard(props) {
  const genAI = React.useMemo(() => new GoogleGenerativeAI(process.env.REACT_APP_API_KEY), []);
  const model = React.useMemo(() => genAI.getGenerativeModel({ model: "gemini-1.5-flash" }), [genAI]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState(Array(props.flashcards.length).fill(null));
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [dashboardMode, setDashboardMode] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setSelectedRating(null);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % props.flashcards.length);
    }, 300);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setSelectedRating(null);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + props.flashcards.length) % props.flashcards.length);
    }, 300);
  };

  const rateQuestion = (rating) => {
    const newRatings = [...ratings];
    newRatings[currentIndex] = rating;
    setRatings(newRatings);
    setSelectedRating(rating);
  };

  const review = () => {
    setDashboardMode(false);
    setReviewMode(true);
  };

  const reviewQuestions = () => {
    setReviewMode(false);
  };

  const startDashboard = () => {
    setDashboardMode(true);
    setReviewMode(false);
    setRatings(Array(props.flashcards.length).fill(null));
    setCurrentIndex(0);
  };

  const badQuestions = props.flashcards.filter((_, index) => ratings[index] === "Bad");

  const handleAddOrEditCard = () => {
    if (editIndex !== null) {
      const updatedFlashcards = [...props.flashcards];
      updatedFlashcards[editIndex] = { description: newQuestion, answer: newAnswer };
      props.setFlashcards(updatedFlashcards);
      setEditIndex(null);
    } else {
      props.setFlashcards([...props.flashcards, { description: newQuestion, answer: newAnswer }]);
    }
    setNewQuestion("");
    setNewAnswer("");
    setIsPopupOpen(false);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setEditIndex(null);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleEditCard = (index) => {
    setNewQuestion(props.flashcards[index].description);
    setNewAnswer(props.flashcards[index].answer);
    setEditIndex(index);
    setIsPopupOpen(true);
  };

  const handleDeleteCard = (index) => {
    const updatedFlashcards = props.flashcards.filter((_, i) => i !== index);
    props.setFlashcards(updatedFlashcards);
    setRatings((prevRatings) => {
      const newRatings = [...prevRatings];
      newRatings.splice(index, 1);
      return newRatings;
    });
  };

  const generateFlashcards = async () => {
    if (!props.summarizedFile) {
      alert("Please create a summarized file before generating flashcards.");
      return;
    }

    setIsLoading(true);

    const prompt = `
      Make an array of objects to generate based on the content to be generated for the flashcards as much as possible:
      - Don’t put too many chapters if not necessary.
      - If there's a possible enumeration question, add it.
      - Format: [{ description: "...", answer: "..." }]
      Content: ${props.summarizedFile}
    `;

    try {
      const result = await model.generateContent(prompt);
      let jsonString = await result.response.text();
      jsonString = jsonString.replace(/```json|```/g, '').trim();
      jsonString = jsonString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
      const parsed = JSON.parse(jsonString);
      props.setFlashcards(parsed);
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const backToSummarize = () => {
    props.setFlashcard(false);
  };

  return (
    <div className="App">
      <h1>Flashcards App</h1>
      {dashboardMode ? (
        <div className="dashboard">
          <h2>Dashboard</h2>
          <button onClick={() => setIsPopupOpen(true)} disabled={isLoading}>
            Add New Question
          </button>
          <button onClick={generateFlashcards} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Flashcards"}
          </button>
          <button onClick={backToSummarize} disabled={isLoading}>
            Back to Summarize
          </button>
          <h3>Current Flashcards:</h3>
          <table className="flashcard-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {props.flashcards.map((card, index) => (
                <tr key={index}>
                  <td>{card.description}</td>
                  <td>{card.answer}</td>
                  <td>
                    <button onClick={() => handleEditCard(index)} disabled={isLoading}>Edit</button>
                    <button onClick={() => handleDeleteCard(index)} disabled={isLoading}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={review} disabled={props.flashcards.length === 0 || isLoading}>Start Reviewing</button>
        </div>
      ) : reviewMode ? (
        <>
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
            <ReactMarkdown className="front">{props.flashcards[currentIndex].description}</ReactMarkdown>
            <ReactMarkdown className="back">{props.flashcards[currentIndex].answer}</ReactMarkdown>
          </div>
          <div className="navigation">
            <button onClick={prevCard} disabled={currentIndex === 0 || ratings[currentIndex] === null}>Previous</button>
            <button onClick={nextCard} disabled={currentIndex === props.flashcards.length - 1 || ratings[currentIndex] === null}>Next</button>
          </div>
          <div className="rating-buttons">
            <button className={`rating ${selectedRating === "Good" ? 'selected' : ''}`} onClick={() => rateQuestion("Good")}>
              Good
            </button>
            <button className={`rating ${selectedRating === "Bad" ? 'selected' : ''}`} onClick={() => rateQuestion("Bad")}>
              Bad
            </button>
          </div>
          <button onClick={startDashboard}>Back to Dashboard</button>
          {currentIndex === props.flashcards.length - 1 && (
            <button onClick={reviewQuestions}>Review Questions</button>
          )}
        </>
      ) : (
        <div>
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
          <button onClick={startDashboard}>Back to Dashboard</button>
        </div>
      )}

      {isPopupOpen && (
        <div className="popup-dialog">
          <div className="popup-content">
            <h2>{editIndex !== null ? 'Edit Question' : 'Add New Question'}</h2>
            <input
              type="text"
              placeholder="Question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              disabled={isLoading}
            />
            <textarea
              placeholder="Answer"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              disabled={isLoading}
            />
            <button onClick={handleAddOrEditCard} disabled={isLoading}>
              {editIndex !== null ? 'Update' : 'Add'}
            </button>
            <button onClick={closePopup} disabled={isLoading}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Flashcard;
