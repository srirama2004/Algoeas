const express = require("express");
const cors = require("cors");
const pg = require("pg");
const bcrypt = require("bcrypt");
const axios = require("axios"); // ✅ Import Axios
const app = express();
// ✅ Fix CORS properly
app.use(cors());
// ✅ Middleware for JSON
app.use(express.json());
const db = new pg.Pool({
  user: "ascscs",
  host: "postgresql-ascscs.alwaysdata.net",
  database: "ascscs_shortner",
  password: "@7sdDgVUuhCXjD6",
  port: 5432,
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { githubUsername, password, githubToken } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (github_username, password, github_token) VALUES ($1, $2, $3)",
      [githubUsername, hashedPassword, githubToken]
    );
    res.json({ success: true, message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "User already exists" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { githubUsername, password } = req.body;

  try {
    const user = await db.query("SELECT * FROM users WHERE github_username = $1", [githubUsername]);

    if (user.rows.length > 0 && (await bcrypt.compare(password, user.rows[0].password))) {
      res.json({ success: true, githubToken: user.rows[0].github_token, githubUsername });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// Fetch GitHub Credentials for Logged-in User
app.get("/getGithubCredentials/:githubUsername", async (req, res) => {
  const { githubUsername } = req.params;
  console.log("\n🔹 [DEBUG] Received request to /getGithubCredentials/:githubUsername");
  console.log("➡️  Extracted githubUsername from URL:", githubUsername);

  if (!githubUsername) {
    console.error("❌ [ERROR] GitHub username is missing in request.");
    return res.status(400).json({ error: "GitHub username is required" });
  }

  console.log("Fetching GitHub credentials for:", githubUsername);

  try {
    const result = await db.query(
      "SELECT github_username, github_token FROM users WHERE github_username = $1",
      [githubUsername]
    );

    if (result.rows.length > 0) {
      res.json({ username: result.rows[0].github_username, token: result.rows[0].github_token });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});
// Push File to GitHub Repo
// Push File to GitHub Repo
app.post("/pushToRepo", async (req, res) => {
  const { githubUsername, repoName,folderName, fileName, fileContent } = req.body;

console.log("\n🔹 [DEBUG] Received request to /pushToRepo");
console.log("➡️ GitHub Username:", githubUsername);
console.log("➡️ Folder Name:", folderName);
console.log("➡️ File Name:", fileName);
console.log("➡️ File Content:", fileContent);


  if (!githubUsername || !folderName || !fileName || !fileContent) {
    return res.status(400).json({ error: "Missing required fields in request" });
  }

  try {
    // Fetch GitHub Token from Database
    const userResult = await db.query(
      "SELECT github_token FROM users WHERE github_username = $1",
      [githubUsername]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const githubToken = userResult.rows[0].github_token;
    console.log("🔑 GitHub Token:", githubToken);
    // Correct API URL with proper variable interpolation
    const url = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${folderName}/${fileName}.java`;

    // Check if the file already exists to get its SHA
    let sha = null;
    try {
      const fileResponse = await axios.get(url, {
        headers: { Authorization: `token ${githubToken}` },
      });
      sha = fileResponse.data.sha; // Extract SHA if the file exists
      console.log("🔹 File exists. Updating...");
    } catch (error) {
      console.log("🔹 File does not exist. Creating a new one.");
    }

    // Convert file content to Base64 encoding
    const encodedContent = Buffer.from(fileContent, "utf-8").toString("base64");

    // Push or update the file
    const response = await axios.put(
      url,
      {
        message: `Added/Updated ${fileName}.txt`,
        content: encodedContent,
        sha: sha || undefined, // Include SHA if updating an existing file
        branch: "main", // Ensure it's committed to the main branch
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    console.log("✅ File successfully pushed to GitHub:", response.data);
    res.json({ success: true, data: response.data });

  } catch (error) {
    console.error("❌ [ERROR] GitHub API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to push file to GitHub", details: error.response?.data || error.message });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));
