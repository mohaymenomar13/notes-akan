import React, { useState } from 'react';
import './Flashcard.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

function Flashcard(props) {
  const genAI = React.useMemo(() => new GoogleGenerativeAI('AIzaSyAo6PDHB40-sFxux21U99sgw2WTedBGBJM'), []);
  const model = React.useMemo(() => genAI.getGenerativeModel({ model: "gemini-1.5-flash" }), [genAI]);

  const [flashcards, setFlashcards] = useState([{}]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState(Array(flashcards.length).fill(null));
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [dashboardMode, setDashboardMode] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setSelectedRating(null);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }, 300);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setSelectedRating(null);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
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
    setRatings(Array(flashcards.length).fill(null)); // Reset ratings here
    setCurrentIndex(0); // Optionally reset the current index
  };

  const badQuestions = flashcards.filter((_, index) => ratings[index] === "Bad");

  const handleAddOrEditCard = () => {
    if (editIndex !== null) {
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[editIndex] = { description: newQuestion, answer: newAnswer };
      setFlashcards(updatedFlashcards);
      setEditIndex(null);
    } else {
      setFlashcards([...flashcards, { description: newQuestion, answer: newAnswer }]);
    }
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleEditCard = (index) => {
    window.scrollTo(0, 0);
    setNewQuestion(flashcards[index].description);
    setNewAnswer(flashcards[index].answer);
    setEditIndex(index);
  };

  const handleDeleteCard = (index) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(updatedFlashcards);
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

    setIsLoading(true); // Start loading

    const prompt = `
      Make a array of objects to generate based on the content to be generate for the flashcards as much as possible:
      -The format of array of objects should be like this and return your response only like this:

      [{ description: "The top of the hierarchy, responsible for making big decisions, setting the vision, and steering the organization in the right direction.", answer: "Executive Level" },
      { description: "Works under the executive level and manages specific units, ensuring everything runs smoothly within their areas.", answer: "Managerial Level" },
      { description: "Directly handles the tasks that make the organization function on a daily basis. They focus on specific tasks, like delivering services, preparing materials, and interacting with customers.", answer: "Operational Level"},]

      -If there's a possible enumarations question, do something like this format to add:
      { description: "Levels of an Organization", answer: "1. Executive Level 2. Managerial Level 3. Operational Level" },
      { description: "Key Areas of Finance", answer: "Investment Management, Financial Planning, Risk Management, Mergers and Acquisitions"}

      Important: 
        - Copy the exact wording of the descriptions as they appear in the text. Do not paraphrase or alter the descriptions in any way.
        - Don't add repeated answers.
      The content:
      ${props.summarizedFile}
    `;

    try {
      const result = await model.generateContent(prompt);
      let jsonString = await result.response.text();

      // Ensure JSON keys are properly formatted
      jsonString = jsonString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); 

      // Parse the JSON
      const parsed = JSON.parse(jsonString);
      setFlashcards(parsed);
      console.log(parsed)
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setIsLoading(false); // End loading
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
          <input
            type="text"
            placeholder="Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            disabled={isLoading}
          />
          <textarea
            type="text"
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            disabled={isLoading}
          /> <br />
          <button onClick={handleAddOrEditCard} disabled={isLoading}>
            {editIndex !== null ? 'Edit Question' : 'Add Question'}
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
              {flashcards.map((card, index) => (
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
          <button onClick={review} disabled={flashcards.length === 0 || isLoading}>Start Reviewing</button>
        </div>
      ) : reviewMode ? (
        <>
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
            <ReactMarkdown className="front">{flashcards[currentIndex].description}</ReactMarkdown>
            <ReactMarkdown className="back">{flashcards[currentIndex].answer}</ReactMarkdown>
          </div>
          <div className="navigation">
            <button onClick={prevCard} disabled={currentIndex === 0 || ratings[currentIndex] === null}>Previous</button>
            <button onClick={nextCard} disabled={currentIndex === flashcards.length - 1 || ratings[currentIndex] === null}>Next</button>
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
          {currentIndex === flashcards.length - 1 && (
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
    </div>
  );
}

export default Flashcard;
