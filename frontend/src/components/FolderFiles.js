import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GitHubService from "../services/GitHubService";
import { motion } from "framer-motion";
import "./FolderFiles.css";

export default function FolderFiles() {
  const location = useLocation();
  const navigate = useNavigate();
  const { githubUsername, githubToken, folderName } = location.state || {};

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!githubUsername || !githubToken || !folderName) {
      navigate("/");
      return;
    }

    async function fetchFiles() {
      try {
        const response = await GitHubService.fetchFilesInFolder(githubUsername, githubToken, folderName);
        setFiles(response);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, [githubUsername, githubToken, folderName, navigate]);

  // ✅ Open file in GitHub when clicked
  const openFileInGitHub = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="folder-files-container">
      <h1>📂 {folderName} Files</h1>
      <button className="back-btn" onClick={() => navigate("/home", { state: { githubUsername, githubToken } })}>
  🔙 Back
</button>


      {loading ? (
        <p>Loading files...</p>
      ) : files.length > 0 ? (
        <motion.div className="files-grid">
          {files.map((file, index) => (
            <motion.div
              key={index}
              className="file-card"
              whileHover={{ scale: 1.05 }}
              onClick={() => openFileInGitHub(file.html_url)} // ✅ Open in GitHub
            >
              <h3>{file.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p>No files found in this folder.</p>
      )}
    </div>
  );
}
