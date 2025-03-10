import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GitHubService from "../services/GitHubService";
import "./AddProblem.css";

export default function AddProblem() {
  const location = useLocation();
  const navigate = useNavigate();
  const { githubUsername, githubToken, subfolders } = location.state || {};

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(subfolders.length > 0 ? subfolders[0].name : "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !code || !selectedRepo) {
      alert("Please fill out all fields.");
      return;
    }

    const success = await GitHubService.pushFileToRepo(githubUsername,"EasAlgo", selectedRepo, title, code);
    if (success) {
      alert("Problem added successfully!");
      navigate("/home", { state: { githubUsername } });
    } else {
      alert("Failed to add problem.");
    }
  };

  return (
    <div className="add-problem-container">
      <h2>Add a Problem</h2>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input
          type="text"
          placeholder="Problem title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Code:</label>
        <textarea
          placeholder="Enter code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        ></textarea>

        <label>Select Repository:</label>
        <select value={selectedRepo} onChange={(e) => setSelectedRepo(e.target.value)}>
          {subfolders.map((folder, index) => (
            <option key={index} value={folder.name}>
              {folder.name}
            </option>
          ))}
        </select>

        <button type="submit">Submit Problem</button>
      </form>
    </div>
  );
}
