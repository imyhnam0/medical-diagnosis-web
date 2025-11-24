import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import IsDiseaseRightPage from './components/IsDiseaseRightPage';
import AgePage from './components/AgePage';
import ChatPage from './components/ChatPage';
import ResultPage from './components/ResultPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/isdiseaseright" element={<IsDiseaseRightPage />} />
          <Route path="/age" element={<AgePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/ChatPage" element={<ChatPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
