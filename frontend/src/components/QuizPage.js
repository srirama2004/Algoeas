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
  const [hintShown, setHintShown] = useState(false);

  const fetchQuestion = async () => {
    setFeedback("");
    setUserAnswer("");
    setHintShown(false);

    try {
      const res = await axios.post("https://algoeas-back.vercel.app/getRandomQuestion", {
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

  const revealHint = () => {
    if (!questionData || hintShown) return;
    setUserAnswer(questionData.answer);
    setHintShown(true);
  };

  const extractExplanation = (code) => {
    const match = code.match(/\/\*([\s\S]*?)\*\//);
    return match ? match[1].trim() : "";
  };

  const extractCodeWithoutExplanation = (code) => {
    return code.replace(/\/\*[\s\S]*?\*\//, "").trim();
  };

  return (
    <div className="quiz-container">
      <h2>🧠 Code Quiz</h2>
      <select
        value={selectedFolder}
        onChange={e => setSelectedFolder(e.target.value)}
      >
        <option value="">Select a category</option>
        {subfolders.map((f, i) => (
          <option key={i} value={f.name}>{f.name}</option>
        ))}
      </select>
      <button onClick={fetchQuestion} disabled={!selectedFolder}>
        Get Random Question
      </button>

      {questionData && (
        <>
          <div className="explanation-box">
            <h3>📘 Explanation</h3>
            <p>{extractExplanation(questionData.question)}</p>
          </div>

          <div className="question-box">
            <h3>💻 Code</h3>
            <pre>
              {extractCodeWithoutExplanation(questionData.question)
                .split("\n")
                .map((line, i) =>
                  line.includes("// 🔲 Fill in this line") ? (
                    <div key={i}>
                      <code className="blank-line">// {'-'.repeat(40)}</code>
                    </div>
                  ) : (
                    <div key={i}>
                      <code>{line}</code>
                    </div>
                  )
                )}
            </pre>

            <textarea
              placeholder="Write the missing code line here"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={checkAnswer}>Submit Answer</button>
              <button onClick={revealHint}>Show Hint</button>
            </div>
            {feedback && <p className="feedback">{feedback}</p>}
          </div>
        </>
      )}
    </div>
  );
}
