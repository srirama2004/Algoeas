import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./QuizPage.css";

export default function QuizPage() {
  const location = useLocation();
  const { githubUsername, subfolders } = location.state || {};

  const [selectedFolder, setSelectedFolder] = useState("");
  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchQuestion = async () => {
    setFeedback("");
    setUserAnswer("");
    try {
      const res = await axios.post("/getRandomQuestion", {
        githubUsername,
        folderName: selectedFolder
      });
      setQuestionData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch question");
    }
  };

  const checkAnswer = () => {
    if (!questionData) return;
    if (userAnswer.trim() === questionData.answer.trim()) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Incorrect. Correct answer: ${questionData.answer}`);
    }
  };

  return (
    <div className="quiz-container">
      <h2>🧠 Code Quiz</h2>
      <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
        <option value="">Select a category</option>
        {subfolders.map((f, i) => (
          <option key={i} value={f.name}>{f.name}</option>
        ))}
      </select>
      <button onClick={fetchQuestion} disabled={!selectedFolder}>Get Random Question</button>

      {questionData && (
        <div className="question-box">
          <pre>{questionData.question}</pre>
          <textarea
            placeholder="Fill in the missing line"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
          />
          <button onClick={checkAnswer}>Submit Answer</button>
          {feedback && <p className="feedback">{feedback}</p>}
        </div>
      )}
    </div>
  );
}
