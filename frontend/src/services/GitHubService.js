import axios from "axios";

const GITHUB_API_URL = "https://api.github.com";

export default {
  async checkRepoExists(username, token) {
    try {
      const response = await axios.get(
        `${GITHUB_API_URL}/repos/${username}/EasAlgo`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      return response.status === 200;
    } catch (error) {
      return false; // Repo doesn't exist or other errors
    }
  },

  async createRepo(username, token) {
    try {
      const response = await axios.post(
        `${GITHUB_API_URL}/user/repos`,
        {
          name: "EasAlgo",
          private: true, // Set to false if you want a public repo
        },
        {
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.status === 201; // Returns true if repo was created
    } catch (error) {
      console.error("Error creating repo:", error.response?.data || error);
      return false;
    }
  },

  async fetchSubfolders(username, token) {
    try {
      const response = await axios.get(
        `${GITHUB_API_URL}/repos/${username}/EasAlgo/contents`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );

      const subfolders = response.data.filter((item) => item.type === "dir");
      return subfolders;
    } catch (error) {
      console.error("Error fetching subfolders:", error);
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
      console.error("Error creating folder:", error.response?.data || error);
      return false;
    }
  },
  async pushFileToRepo(githubUsername, repoName,folderName, fileName, fileContent) {
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
      console.error("❌ [ERROR] Failed to push file to GitHub:", error.response?.data || error.message);
      throw error;
    }
  },
  async fetchFilesInFolder(username, token, folderName) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${username}/EasAlgo/contents/${folderName}`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
  
      return response.data
        .filter((item) => item.type === "file")
        .map((file) => ({
          name: file.name,
          html_url: file.html_url, // ✅ Ensure this exists
        }));
    } catch (error) {
      console.error("Error fetching files:", error);
      return [];
    }
  }
};
