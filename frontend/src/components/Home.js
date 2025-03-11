import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GitHubService from "../services/GitHubService";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";

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
  const [loading, setLoading] = useState(false); // Spinner for adding category
  const [fetchingFolders, setFetchingFolders] = useState(false); // Spinner for fetching folders
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  useEffect(() => {
    if (!githubUsername) return;

    async function fetchGitHubCredentials() {
      try {
        const response = await axios.get(`https://algoeas-back.vercel.app/getGithubCredentials/${githubUsername}`);
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
        const exists = await GitHubService.checkRepoExists(githubUsername, githubToken);
        setRepoExists(exists);

        if (exists) {
          const folders = await GitHubService.fetchSubfolders(githubUsername, githubToken);
          setSubfolders(folders);
        }
      } catch (error) {
        console.error("Error checking repo:", error);
      }
      setFetchingFolders(false);
    }

    checkRepoAndLoadSubfolders();
  }, [githubUsername, githubToken]);

  const addCard = async () => {
    if (newCard.trim() === "") return;

    setLoading(true); // Start spinner
    try {
      if (repoExists) {
        await GitHubService.createFolder(githubUsername, githubToken, newCard);

        // Fetch updated folder list after GitHub confirmation
        const updatedFolders = await GitHubService.fetchSubfolders(githubUsername, githubToken);
        setSubfolders(updatedFolders);

        alert("✅ Card added successfully!");
      }

      setNewCard("");
    } catch (error) {
      console.error("Error adding folder:", error);
    } finally {
      setLoading(false); // Stop spinner
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
    navigate("/login");
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
          <button className="create-repo-btn" onClick={() => console.log("Create Repo")}>
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
      <button className="offcanvas-btn" onClick={() => setShowOffcanvas(true)}>📌 Menu</button>

<Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)}>
  <Offcanvas.Header closeButton>
    <Offcanvas.Title>Resources</Offcanvas.Title>
  </Offcanvas.Header>
  <Offcanvas.Body>
    <Button variant="success" href="https://practice.geeksforgeeks.org/problem-of-the-day" target="_blank">
      🔗 Geeks for Geeks Problem of the Day
    </Button>
    <br /><br />
    <Button variant="primary" href="https://leetcode.com/problemset/all/" target="_blank">
      🔗 LeetCode Problems
    </Button>
  </Offcanvas.Body>
</Offcanvas>
    </div>
  );
}
