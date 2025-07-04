import React, { useState } from 'react';
import { BookOpen, Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const Flashcards = () => {
  const [topic, setTopic] = useState('');
  const [numCards, setNumCards] = useState(10);
  const [cards, setCards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});
  const [error, setError] = useState('');

  const generateFlashcards = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError('');
    setCards([]);
    setIsStudying(false);
    setFlippedCards({});
    setCurrentCard(0);

    try {
      const response = await axios.post('/generate_flashcards/', {
        topic: topic.trim(),
        num_cards: numCards
      });
      
      setCards(response.data.cards);
      setIsStudying(true);
    } catch (error) {
      console.error('Flashcard generation error:', error);
      setError(error.response?.data?.detail || 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const flipCard = (cardIndex) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardIndex]: !prev[cardIndex]
    }));
  };

  const nextCard = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  const resetFlashcards = () => {
    setCards([]);
    setIsStudying(false);
    setFlippedCards({});
    setCurrentCard(0);
  };

  const goToCard = (index) => {
    setCurrentCard(index);
  };

  if (isStudying && cards.length > 0) {
    const card = cards[currentCard];
    const isFlipped = flippedCards[currentCard];

    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Flashcards: {topic}</h1>
          <div style={{ textAlign: 'right' }}>
            <div>Card {currentCard + 1} of {cards.length}</div>
            <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
              {Object.keys(flippedCards).filter(key => flippedCards[key]).length} flipped
            </div>
          </div>
        </div>

        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={() => flipCard(currentCard)}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div>
                <h3 style={{ marginBottom: '16px' }}>Question</h3>
                <p>{card.front}</p>
                <p style={{ marginTop: '16px', fontSize: '14px', opacity: 0.8 }}>
                  Click to flip
                </p>
              </div>
            </div>
            <div className="flashcard-back">
              <div>
                <h3 style={{ marginBottom: '16px' }}>Answer</h3>
                <p>{card.back}</p>
                <p style={{ marginTop: '16px', fontSize: '14px', opacity: 0.8 }}>
                  Click to flip back
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flashcard-nav">
          <button
            className="btn-secondary"
            onClick={previousCard}
            disabled={currentCard === 0}
          >
            <ChevronLeft size={20} style={{ marginRight: '4px' }} />
            Previous
          </button>
          
          <button
            className="btn-secondary"
            onClick={() => flipCard(currentCard)}
          >
            Flip Card
          </button>
          
          <button
            className="btn-secondary"
            onClick={nextCard}
            disabled={currentCard === cards.length - 1}
          >
            Next
            <ChevronRight size={20} style={{ marginLeft: '4px' }} />
          </button>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h4 style={{ marginBottom: '12px' }}>Card Navigation</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {cards.map((_, index) => (
              <button
                key={index}
                className={`btn-secondary ${currentCard === index ? 'selected' : ''}`}
                onClick={() => goToCard(index)}
                style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  padding: '8px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {index + 1}
                {flippedCards[index] && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '2px', 
                    right: '2px', 
                    width: '8px', 
                    height: '8px', 
                    background: '#667eea', 
                    borderRadius: '50%' 
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button className="btn" onClick={resetFlashcards}>
            <RotateCcw size={20} style={{ marginRight: '8px' }} />
            Generate New Set
          </button>
        </div>

        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Study Tips</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Try to answer the question before flipping the card</li>
            <li>Review cards you find difficult more frequently</li>
            <li>Use the navigation to jump between cards</li>
            <li>Practice regularly for better retention</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
        <BookOpen size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
        Generate Flashcards
      </h1>

      <form onSubmit={(e) => { e.preventDefault(); generateFlashcards(); }} style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="topic" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            What topic would you like to study with flashcards?
          </label>
          <input
            id="topic"
            type="text"
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., vocabulary, concepts, definitions..."
            disabled={isGenerating}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="numCards" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Number of flashcards:
          </label>
          <select
            id="numCards"
            className="input"
            value={numCards}
            onChange={(e) => setNumCards(parseInt(e.target.value))}
            disabled={isGenerating}
          >
            <option value={5}>5 cards</option>
            <option value={10}>10 cards</option>
            <option value={15}>15 cards</option>
            <option value={20}>20 cards</option>
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
              Generating flashcards...
            </>
          ) : (
            <>
              <Play size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Generate Flashcards
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="grid">
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>
            <BookOpen size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            How it works
          </h3>
          <p>
            Our AI creates interactive flashcards from your study material:
          </p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Question and answer format</li>
            <li>Click to flip cards</li>
            <li>Navigate between cards</li>
            <li>Track your progress</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>
            <BookOpen size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Study effectively
          </h3>
          <p>
            Flashcards are great for:
          </p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
            <li>Memorizing vocabulary</li>
            <li>Learning definitions</li>
            <li>Understanding concepts</li>
            <li>Quick review sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Flashcards; 