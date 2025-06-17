import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GitHubService from "../services/GitHubService";
import axios from "axios";
import "./Home.css";

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const githubUsername = location.state?.githubUsername || "";

  const [githubToken, setGithubToken] = useState("");
  const [repoExists, setRepoExists] = useState(false);
  const [subfolders, setSubfolders] = useState([]);
  const [newCard, setNewCard] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingFolders, setFetchingFolders] = useState(false);
const goToQuiz = () => {
  navigate("/quiz", { state: { githubUsername, subfolders } });
};

  useEffect(() => {
    if (!githubUsername) return;

    async function fetchGitHubCredentials() {
      try {
        const response = await axios.get(
          `https://algoeas-back.vercel.app/getGithubCredentials/${githubUsername}`
        );
        if (response.data.token) {
          setGithubToken(response.data.token);
        }
      } catch (error) {
        console.error("Error fetching GitHub credentials:", error);
      }
    }

    fetchGitHubCredentials();
  }, [githubUsername]);

  useEffect(() => {
    if (!githubUsername || !githubToken) return;

    async function checkRepoAndLoadSubfolders() {
      setFetchingFolders(true);
      try {
        const exists = await GitHubService.checkRepoExists(
          githubUsername,
          githubToken
        );
        setRepoExists(exists);

        if (exists) {
          const folders = await GitHubService.fetchSubfolders(
            githubUsername,
            githubToken
          );
          setSubfolders(folders);
        } else {
          // 🚀 Repo does NOT exist, create it with default folders
          await createRepoWithDefaultFolders();
        }
      } catch (error) {
        console.error("Error checking repo:", error);
      }
      setFetchingFolders(false);
    }

    checkRepoAndLoadSubfolders();
  }, [githubUsername, githubToken]);

  // 🚀 Function to create a repo and add default folders
  const createRepoWithDefaultFolders = async () => {
    try {
      const created = await GitHubService.createRepo(githubUsername, githubToken);
      if (created) {
        // 📂 Default folders to add
        const defaultFolders = ["Arrays", "Strings", "Graphs", "Dynamic Programming"];
        for (const folder of defaultFolders) {
          await GitHubService.createFolder(githubUsername, githubToken, folder);
        }

        // 🔄 Fetch updated folder list
        const updatedFolders = await GitHubService.fetchSubfolders(githubUsername, githubToken);
        setSubfolders(updatedFolders);
        setRepoExists(true);

        alert(`✅ EasAlgo repository created successfully!\n📂 Added folders: ${defaultFolders.join(", ")}`);
      } else {
        alert("❌ Failed to create repository.");
      }
    } catch (error) {
      console.error("Error creating repo with default folders:", error);
    }
  };

  const addCard = async () => {
    if (newCard.trim() === "") return;

    setLoading(true);
    try {
      if (repoExists) {
        await GitHubService.createFolder(githubUsername, githubToken, newCard);

        const updatedFolders = await GitHubService.fetchSubfolders(githubUsername, githubToken);
        setSubfolders(updatedFolders);

        alert(`✅ Category "${newCard}" added successfully!`);
      }

      setNewCard("");
    } catch (error) {
      console.error("Error adding folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToFolderFiles = (folderName) => {
    navigate("/folder-files", { state: { githubUsername, githubToken, folderName } });
  };

  const goToAddProblem = () => {
    navigate("/add-problem", { state: { githubUsername, githubToken, subfolders } });
  };

  const handleLogout = () => {
    setGithubToken("");
    navigate("/");
  };

  return (
    <div className="home-container">
      <h1 style={{ color: "rgba(47, 255, 0, 0.5)" }}>EasAlgo</h1>
      <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>

      <div className="github-info">
        <p><strong>GitHub Username:</strong> {githubUsername || "Loading..."}</p>
        {repoExists ? (
          <p className="repo-status">✅ GitHub Repo Exists: EasAlgo</p>
        ) : (
          <button className="create-repo-btn" onClick={createRepoWithDefaultFolders}>
            🚀 Create GitHub Repo
          </button>
        )}
      </div>

      <div className="add-card">
        <input
          type="text"
          placeholder="Enter category name"
          value={newCard}
          onChange={(e) => setNewCard(e.target.value)}
          disabled={loading}
        />
        <button onClick={addCard} disabled={loading}>
          {loading ? "Adding..." : "+ Add Card"}
        </button>
      </div>

      {fetchingFolders && <p className="loading-text">🔄 Loading folders...</p>}

      <div className="cards-grid">
        {subfolders.length > 0
          ? subfolders.map((folder, index) => (
              <div key={index} className="card" onClick={() => goToFolderFiles(folder.name)}>
                {folder.name}
              </div>
            ))
          : <p>No categories yet. Add one!</p>}
      </div>

      <button className="add-problem-btn" onClick={goToAddProblem}>
        ➕ Add a Problem
      </button>
      <button className="goto-btn" onClick={goToQuiz}>🧠 Start Quiz</button>
      
    </div>
  );
}
