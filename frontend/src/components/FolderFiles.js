import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GitHubService from "../services/GitHubService";
import { motion } from "framer-motion";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";

import "./FolderFiles.css";
SyntaxHighlighter.registerLanguage("java", java);
export default function FolderFiles() {
  const location = useLocation();
  const navigate = useNavigate();
  const { githubUsername, githubToken, folderName } = location.state || {};

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fontSize, setFontSize] = useState(14);

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

  const fetchFileContent = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const text = await response.text();
      setSelectedFileContent(text);
      setSelectedFileName(fileName);
    } catch (err) {
      console.error("Failed to fetch file content:", err);
    }
  };

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 30));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 8));

  return (
    <div className="folder-files-container dark">
      <h1>📂 {folderName} Files</h1>
      <button
        className="back-btn"
        onClick={() => navigate("/home", { state: { githubUsername, githubToken } })}
      >
        🔙 Back
      </button>

      {loading ? (
        <p className="loading-text">Loading files...</p>
      ) : files.length > 0 ? (
        <motion.div className="files-grid">
          {files.map((file, index) => (
            <motion.div
              key={index}
              className="file-card"
              whileHover={{ scale: 1.05 }}
              onClick={() => fetchFileContent(file.download_url, file.name)}
            >
              <h3>{file.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="loading-text">No files found in this folder.</p>
      )}

      {selectedFileContent && (
        <div className="file-viewer">
          <h2>📄 {selectedFileName}</h2>

          <div className="font-controls">
            <button onClick={decreaseFontSize}>➖ A</button>
            <span>{fontSize}px</span>
            <button onClick={increaseFontSize}>➕ A</button>
          </div>

          <SyntaxHighlighter
            language="java"
            style={atomOneDark}
            customStyle={{
              padding: "20px",
              borderRadius: "10px",
              fontSize: `${fontSize}px`,
              backgroundColor: "#1e1e1e",
              whiteSpace: "pre-wrap",
            }}
          >
            {selectedFileContent}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
