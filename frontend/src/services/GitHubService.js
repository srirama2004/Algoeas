import axios from "axios";

const GITHUB_API_URL = "https://api.github.com";

export default {
  async checkRepoExists(username, token) {
    try {
      const response = await axios.get(
        `${GITHUB_API_URL}/repos/${username}/EasAlgo`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      return response.status === 200;
    } catch (error) {
      return false; // Repo doesn't exist
    }
  },

  async createRepo(username, token) {
    try {
      const response = await axios.post(
        `${GITHUB_API_URL}/user/repos`,
        {
          name: "EasAlgo",
          private: true, // Set false for public repo
        },
        {
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.status === 201;
    } catch (error) {
      console.error("❌ Error creating repo:", error.response?.data || error);
      return false;
    }
  },

  async fetchSubfolders(username, token) {
    try {
      const response = await axios.get(
        `${GITHUB_API_URL}/repos/${username}/EasAlgo/contents`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );

      return response.data.filter((item) => item.type === "dir");
    } catch (error) {
      console.error("❌ Error fetching subfolders:", error);
      return [];
    }
  },

  async createFolder(username, token, folderName) {
    try {
      const url = `${GITHUB_API_URL}/repos/${username}/EasAlgo/contents/${folderName}/.gitkeep`;

      const response = await axios.put(
        url,
        {
          message: `Created folder: ${folderName}`,
          content: btoa(" "), // Base64 encoded empty content
          committer: {
            name: "EasAlgo Bot",
            email: "bot@easalgo.com",
          },
        },
        {
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.status === 201;
    } catch (error) {
      console.error("❌ Error creating folder:", error.response?.data || error);
      return false;
    }
  },

  async pushFileToRepo(githubUsername, repoName, folderName, fileName, fileContent) {
    try {
      const response = await axios.post("https://algoeas-back.vercel.app/pushToRepo", {
        githubUsername,
        repoName,
        folderName,
        fileName,
        fileContent,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error pushing file to GitHub:", error.response?.data || error.message);
      throw error;
    }
  },

 async fetchFilesInFolder(username, token, folderName) {
  try {
    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${username}/EasAlgo/contents/${folderName}`,
      {
        headers: { Authorization: `token ${token}` },
      }
    );

    return response.data
      .filter((item) => item.type === "file" && item.name.endsWith(".java"))
      .map((file) => ({
        name: file.name,
        html_url: file.html_url, // GitHub view URL
        download_url: file.download_url, // for fetching raw content
        path: file.path, // for identifying file path
      }));
  } catch (error) {
    console.error("❌ Error fetching .java files:", error);
    return [];
  }
}

