import React, { useState, useEffect } from "react";
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
  const [visibleHintLines, setVisibleHintLines] = useState(0);

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
    if (userAnswer.trim() === questionData.answer.trim()) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Incorrect. Correct answer: ${questionData.answer}`);
    }
  };

  const handleHintClick = () => {
    setVisibleHintLines((prev) =>
      Math.min(prev + 1, questionData?.answer.split("\n").length || 0)
    );
  };

  return (
    <div>
      <h2>🧠 Code Quiz</h2>

      <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}>
        <option value="">Select a category</option>
        {subfolders?.map((f, i) => (
          <option key={i} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>

      <button onClick={fetchQuestion} disabled={!selectedFolder}>
        Get Random Question
      </button>

      {questionData && (
        <>
          <h4>📝 Explanation</h4>
          <pre>{questionData.explanation}</pre>

          <h4>🔳 Fill in the Missing Code</h4>
          <textarea
            placeholder="Write missing lines here..."
            rows={6}
            cols={60}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />

          <div>
            <button onClick={checkAnswer}>Submit Answer</button>
            <button onClick={handleHintClick}>Hint</button>
          </div>

          {feedback && <p>{feedback}</p>}

          {visibleHintLines > 0 && (
            <>
              <h4>💡 Hints</h4>
              <pre>
                {questionData.answer
                  .split("\n")
                  .slice(0, visibleHintLines)
                  .join("\n")}
              </pre>
            </>
          )}
        </>
      )}
    </div>
  );
}
