import "./QuizPage.css";
import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function QuizPage() {
  const location = useLocation();
  const { githubUsername, subfolders } = location.state || {};

  const [selectedFolder, setSelectedFolder] = useState("");
  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [visibleHintLines, setVisibleHintLines] = useState(0);
 const [showSubmittedAnswer, setShowSubmittedAnswer] = useState(false);

  const fetchQuestion = async () => {
    setFeedback("");
    setUserAnswer("");
    setVisibleHintLines(0);
    try {
      const res = await axios.post("https://algoeas-back.vercel.app/getRandomQuestion", {
        githubUsername,
        folderName: selectedFolder,
      });
      setQuestionData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch question");
    }
  };

const checkAnswer = () => {
  if (!questionData) return;

  const isCorrect = userAnswer.trim() === questionData.answer.trim();
  setFeedback(isCorrect ? "✅ Correct!" : "❌ Incorrect.");
  setShowSubmittedAnswer(true); // show full code block
};


  const handleHintClick = () => {
    if (!questionData?.answer) return;
    const totalLines = questionData.answer.split("\n").length;
    setVisibleHintLines((prev) => Math.min(prev + 1, totalLines));
  };

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">🧠 Code Test</h2>

      <select
        className="quiz-dropdown"
        value={selectedFolder}
        onChange={(e) => setSelectedFolder(e.target.value)}
      >
        <option value="">Select a category</option>
        {subfolders?.map((f, i) => (
          <option key={i} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>

      <button className="ranbtn" onClick={fetchQuestion} disabled={!selectedFolder}>
        Get Random Question
      </button>

      {questionData && (
        <>
          <div className="explanation-box">
            <h4>📝 Explanation</h4>
            <pre className="quiz-explanation">{questionData.explanation}</pre>
          </div>

          <div className="quiz-answer-box">
            <h4>🔳 Fill in the Code</h4>
            <textarea
              className="quiz-textarea"
              rows={12}
              placeholder="Write your code here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
          </div>

          <div className="quiz-buttons">
            <button className="ansbtn" onClick={checkAnswer}>Submit Answer</button>
            <button className="hintbtn" onClick={handleHintClick}>Hint</button>
          </div>

        {feedback && (
  <pre
    className={`quiz-feedback-box ${
      feedback.startsWith("✅") ? "correct" : "incorrect"
    }`}
  >
    {feedback}
    {showSubmittedAnswer && (
  <div className="submitted-answer-block">
    <h4>📘 Correct Code:</h4>
    <pre>{questionData.answer}</pre>
    <button className="close-answer-btn" onClick={() => setShowSubmittedAnswer(false)}>
      Close Answer
    </button>
  </div>
)}

  </pre>
)}


          {visibleHintLines > 0 && (
            <div className="hint-section">
              <h4>💡 Hint (Showing {visibleHintLines} {visibleHintLines === 1 ? "line" : "lines"})</h4>
              <pre className="quiz-hint-code">
                {questionData.answer
                  .split("\n")
                  .slice(0, visibleHintLines)
                  .join("\n")}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
