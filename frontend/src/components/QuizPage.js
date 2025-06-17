import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Prism from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/themes/prism-tomorrow.css";
import "./QuizPage.css";

export default function QuizPage() {
  const location = useLocation();
  const { githubUsername, subfolders } = location.state || {};

  const [selectedFolder, setSelectedFolder] = useState("");
  const [questionData, setQuestionData] = useState(null);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    Prism.highlightAll(); // apply syntax highlighting
  }, [questionData, hintIndex]);

  const fetchQuestion = async () => {
    setHintIndex(0);
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

  const showNextHint = () => {
    if (questionData && hintIndex < questionData.answer.split("\n").length) {
      setHintIndex(prev => prev + 1);
    }
  };

  const extractExplanation = (code) => {
    const match = code.match(/\/\*([\s\S]*?)\*\//);
    return match ? match[1].trim() : "No explanation provided.";
  };

  return (
    <div className="quiz-container">
      <h2>🧠 Code Quiz</h2>
      <select
        value={selectedFolder}
        onChange={(e) => setSelectedFolder(e.target.value)}
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

          <div className="hint-section">
            <h3>💡 Hint</h3>
            <button onClick={showNextHint} disabled={hintIndex >= questionData.answer.split("\n").length}>
              Show Next Line
            </button>
            <pre className="language-java">
              <code className="language-java">
                {
                  questionData.answer
                    .split("\n")
                    .slice(0, hintIndex)
                    .join("\n")
                }
              </code>
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
