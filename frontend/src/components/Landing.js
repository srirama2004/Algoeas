import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Landing() {
  const [githubUsername, setGithubUsername] = useState("");
  const [password, setPassword] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "login" : "signup";
      const response = await axios.post(`https://algoeas.vercel.app/${endpoint}`, {
        githubUsername,
        password,
        githubToken: isLogin ? undefined : githubToken,
      });

      if (response.data.success) {
        console.log(githubUsername);
        navigate("/home", { state: { githubUsername } });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Glow */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      {/* Logo */}
      <h1 style={styles.logo}>EasAlgo</h1>

      {/* Form Container */}
      <div style={styles.formContainer}>
        <h2 style={styles.title}>{isLogin ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="GitHub Username"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="GitHub Token"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              required
              style={styles.input}
            />
          )}
          <button type="submit" style={styles.button}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Between Login & Signup */}
        <button onClick={() => setIsLogin(!isLogin)} style={styles.toggle}>
          {isLogin ? "Create an account" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

// 🎨 CSS Styles as JS Objects
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to bottom right, #1a1a1a, #333)",
    color: "white",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  glow1: {
    position: "absolute",
    top: "10%",
    left: "10%",
    width: "150px",
    height: "150px",
    backgroundColor: "rgba(0, 255, 100, 0.3)",
    borderRadius: "50%",
    filter: "blur(50px)",
  },
  glow2: {
    position: "absolute",
    bottom: "10%",
    right: "10%",
    width: "120px",
    height: "120px",
    backgroundColor: "rgba(0, 100, 255, 0.3)",
    borderRadius: "50%",
    filter: "blur(50px)",
  },
  logo: {
    fontSize: "42px",
    fontWeight: "bold",
    color: "#2fff00",
    marginBottom: "20px",
    animation: "pulse 1.5s infinite",
  },
  formContainer: {
    background: "rgba(34, 34, 34, 0.9)",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
    width: "350px",
    boxShadow: "0 0 10px rgba(0, 255, 100, 0.5)",
  },
  title: {
    fontSize: "22px",
    marginBottom: "15px",
    color: "#ddd",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    borderRadius: "5px",
    border: "none",
    fontSize: "16px",
    textAlign: "center",
    backgroundColor: "#333",
    color: "white",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2fff00",
    color: "black",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "all 0.3s",
  },
  toggle: {
    marginTop: "15px",
    color: "#2fff00",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
  },
};

// 🔥 CSS Animations (for pulse effect)
document.head.insertAdjacentHTML(
  "beforeend",
  `<style>
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  </style>`
);
