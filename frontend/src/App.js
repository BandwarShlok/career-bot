import React, { useState } from "react";
import Login from "./components/Login";
import ChatBot from "./components/ChatBot";
import "./App.css"; // optional global styling

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="App">
      {loggedIn ? (
        <ChatBot />       // Show chatbot after login
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />  // Show login page
      )}
    </div>
  );
}

export default App;
