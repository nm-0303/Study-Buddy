import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, HelpCircle, Zap } from 'lucide-react';
import PDFUpload from './components/PDFUpload';
import Explain from './components/Explain';
import Quiz from './components/Quiz';
import Flashcards from './components/Flashcards';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <div className="nav-content">
        <Link to="/" className="nav-title">
          <BookOpen style={{ marginRight: '8px' }} />
          Study Buddy
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <FileText style={{ marginRight: '4px' }} />
            Upload PDF
          </Link>
          <Link 
            to="/explain" 
            className={`nav-link ${location.pathname === '/explain' ? 'active' : ''}`}
          >
            <HelpCircle style={{ marginRight: '4px' }} />
            Explain
          </Link>
          <Link 
            to="/quiz" 
            className={`nav-link ${location.pathname === '/quiz' ? 'active' : ''}`}
          >
            <Zap style={{ marginRight: '4px' }} />
            Quiz
          </Link>
          <Link 
            to="/flashcards" 
            className={`nav-link ${location.pathname === '/flashcards' ? 'active' : ''}`}
          >
            <BookOpen style={{ marginRight: '4px' }} />
            Flashcards
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/" element={<PDFUpload />} />
            <Route path="/explain" element={<Explain />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/flashcards" element={<Flashcards />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 