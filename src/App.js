// src/App.js
import React from "react";
import TaskList from "./TaskList"; // Importa el componente TaskList
import "./App.css";

function App() {
  return (
    <div className="App">
      <TaskList /> {/* Incorpora el componente TaskList */}
    </div>
  );
}

export default App;
