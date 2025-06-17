import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing"; // Landing Page for Login/Signup
import Home from "./components/Home"; // Home Page after authentication
import AddProblem from "./components/AddProblem.js";
import FolderFiles from "./components/FolderFiles.js";
import QuizPage from "./components/QuizPage.js";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} /> {/* Landing Page */}
        <Route path="/home" element={<Home />} /> {/* Redirect here after login */}
        <Route path="/add-problem" element={<AddProblem />} /> {/* Landing Page */}
        <Route path="/folder-files" element={<FolderFiles />} /> 
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </Router>
  );
}

export default App;
