import React, { useState } from 'react';
import { Zap, Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import axios from 'axios';

const Quiz = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const generateQuiz = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError('');
    setQuestions([]);
    setIsTakingQuiz(false);
    setShowResults(false);
    setSelectedAnswers({});

    try {
      const response = await axios.post('/generate_quiz/', {
        topic: topic.trim(),
        num_questions: numQuestions
      });
      
      setQuestions(response.data.questions);
      setIsTakingQuiz(true);
      setCurrentQuestion(0);
    } catch (error) {
      console.error('Quiz generation error:', error);
      setError(error.response?.data?.detail || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAnswer = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setIsTakingQuiz(false);
    setShowResults(false);
    setSelectedAnswers({});
    setCurrentQuestion(0);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const isCorrect = (questionIndex, answer) => {
    return questions[questionIndex].correct_answer === answer;
  };

  const getOptionClass = (questionIndex, answer) => {
    if (!showResults) {
      return selectedAnswers[questionIndex] === answer ? 'selected' : '';
    }
    
    if (isCorrect(questionIndex, answer)) {
      return 'correct';
    }
    if (selectedAnswers[questionIndex] === answer && !isCorrect(questionIndex, answer)) {
      return 'incorrect';
    }
    return '';
  };

  if (isTakingQuiz && questions.length > 0) {
    const question = questions[currentQuestion];
    const score = getScore();

    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Quiz: {topic}</h1>
          <div style={{ textAlign: 'right' }}>
            <div>Question {currentQuestion + 1} of {questions.length}</div>
            {showResults && (
              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                Score: {score.correct}/{score.total} ({score.percentage}%)
              </div>
            )}
          </div>
        </div>

        {!showResults ? (
          <>
            <div className="quiz-question">
              <h3 style={{ marginBottom: '16px' }}>{question.question}</h3>
              <div className="quiz-options">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`quiz-option ${getOptionClass(currentQuestion, option)}`}
                    onClick={() => selectAnswer(currentQuestion, option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button
                className="btn-secondary"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              
              <button
                className="btn"
                onClick={nextQuestion}
                disabled={!selectedAnswers[currentQuestion]}
              >
                {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2>Quiz Complete!</h2>
              <div style={{ fontSize: '24px', marginTop: '16px' }}>
                Your Score: {score.correct}/{score.total} ({score.percentage}%)
              </div>
              <div style={{ marginTop: '8px', color: score.percentage >= 70 ? '#28a745' : '#dc3545' }}>
                {score.percentage >= 70 ? 'Great job!' : 'Keep studying!'}
              </div>
            </div>

            {questions.map((question, index) => (
              <div key={index} className="quiz-question">
                <h4 style={{ marginBottom: '12px' }}>
                  Question {index + 1}: {question.question}
                </h4>
                <div className="quiz-options">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`quiz-option ${getOptionClass(index, option)}`}
                    >
                      {option}
                      {isCorrect(index, option) && (
                        <CheckCircle size={16} style={{ marginLeft: '8px', color: '#28a745' }} />
                      )}
                      {selectedAnswers[index] === option && !isCorrect(index, option) && (
                        <XCircle size={16} style={{ marginLeft: '8px', color: '#dc3545' }} />
                      )}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))}

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button className="btn" onClick={resetQuiz}>
                <RotateCcw size={20} style={{ marginRight: '8px' }} />
                Take Another Quiz
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Zap size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
        Generate Quiz
      </h1>

      <form onSubmit={(e) => { e.preventDefault(); generateQuiz(); }} style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="topic" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            What topic would you like to quiz yourself on?
          </label>
          <input
            id="topic"
            type="text"
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., machine learning, photosynthesis, economics..."
            disabled={isGenerating}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="numQuestions" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Number of questions:
          </label>
          <select
            id="numQuestions"
            className="input"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            disabled={isGenerating}
          >
            <option value={3}>3 questions</option>
            <option value={5}>5 questions</option>
            <option value={10}>10 questions</option>
            <option value={15}>15 questions</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn" 
          disabled={isGenerating || !topic.trim()}
          style={{ width: '100%' }}
        >
          {isGenerating ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
              Generating quiz...
            </>
          ) : (
            <>
              <Play size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Generate Quiz
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>
          <Zap size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          How it works
        </h3>
        <p>
          Our AI analyzes your uploaded study material to create personalized quiz questions:
        </p>
        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
          <li>Multiple choice questions with explanations</li>
          <li>Questions based on your specific study content</li>
          <li>Immediate feedback and scoring</li>
          <li>Detailed explanations for each answer</li>
        </ul>
      </div>
    </div>
  );
};

export default Quiz; 