import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GitHubService from "../services/GitHubService";
import "./AddProblem.css";

export default function AddProblem() {
  const location = useLocation();
  const navigate = useNavigate();
  const { githubUsername, githubToken, subfolders } = location.state || {};

  const [title, setTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [code, setCode] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(subfolders.length > 0 ? subfolders[0].name : "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !explanation || !code || !selectedRepo) {
      alert("⚠️ Please fill out all fields.");
      return;
    }

    // Combine explanation and code into a single Java file
    const javaContent = `
/*
Explanation:
${explanation}
*/

${code}
`;

    const fileName = `${title.replace(/\s+/g, "_")}`;

    try {
      const success = await GitHubService.pushFileToRepo(
        githubUsername,
        "EasAlgo",
        selectedRepo,
        fileName,
        javaContent
      );

      if (success) {
        alert("✅ Problem added as Java file!");
        navigate("/home", { state: { githubUsername } });
      } else {
        alert("❌ Failed to add problem.");
      }
    } catch (error) {
      alert("🚫 Error pushing to GitHub.");
      console.error(error);
    }
  };

  return (
    <div className="add-problem-container">
      <h2>Add a Java Problem</h2>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input
          type="text"
          placeholder="Problem title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Explanation:</label>
        <textarea
          placeholder="Describe the problem or logic here..."
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          required
        ></textarea>

        <label>Java Code:</label>
        <textarea
          placeholder="Enter your Java solution here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        ></textarea>

        <label>Select Category (Folder):</label>
        <select value={selectedRepo} onChange={(e) => setSelectedRepo(e.target.value)}>
          {subfolders.map((folder, index) => (
            <option key={index} value={folder.name}>
              {folder.name}
            </option>
          ))}
        </select>

        <button type="submit">📤 Submit Problem</button>
      </form>
    </div>
  );
}
