import React, { useState } from 'react';
import { HelpCircle, Send, Lightbulb } from 'lucide-react';
import axios from 'axios';

const Explain = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await axios.post('/explain/', {
        question: question.trim()
      });
      
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Explain error:', error);
      setError(error.response?.data?.detail || 'Failed to get explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "What is machine learning?",
    "Explain photosynthesis in simple terms",
    "How does the water cycle work?",
    "What are the main principles of economics?",
    "Explain quantum physics basics"
  ];

  return (
    <div className="card">
      <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
        <HelpCircle size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
        Ask for Explanations
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="question" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            What would you like me to explain?
          </label>
          <textarea
            id="question"
            className="textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask any question about your study material..."
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={isLoading || !question.trim()}
          style={{ width: '100%' }}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
              Getting explanation...
            </>
          ) : (
            <>
              <Send size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Get Explanation
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {answer && (
        <div className="answer-box">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <Lightbulb size={20} style={{ marginRight: '8px' }} />
            Explanation
          </h3>
          <div style={{ lineHeight: '1.6' }}>
            {answer.split('\n').map((paragraph, index) => (
              <p key={index} style={{ marginBottom: '12px' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>
          <HelpCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Example Questions
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Try asking questions like these to get started:
        </p>
        <div className="grid">
          {exampleQuestions.map((example, index) => (
            <button
              key={index}
              className="btn-secondary"
              onClick={() => setQuestion(example)}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>
          <Lightbulb size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Tips for Better Explanations
        </h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Be specific in your questions</li>
          <li>Ask for simple explanations of complex topics</li>
          <li>Request examples or analogies</li>
          <li>Ask follow-up questions for deeper understanding</li>
        </ul>
      </div>
    </div>
  );
};

export default Explain; 