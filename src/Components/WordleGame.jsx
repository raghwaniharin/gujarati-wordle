import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gujaratiBarakhadi } from '../constants/gujaratiletters';
import { getWordleFeedback, getBarakhadiId } from '../Utils/WordleLogic';
import { isValidGujaratiWord } from '../Utils/Dictionary';
import Navbar from '../Components/Navbar';

const idLetterMap = gujaratiBarakhadi.reduce((map, obj) => {
  map[obj.id] = obj.gu;
  return map;
}, {});

const TARGET_WORD = [14, 21, 230]; // Example target word (update as needed)

const WordleGame = () => {
  const [currentGuess, setCurrentGuess] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const maxConsonants = 5;
  const navigate = useNavigate();

  // Track last consonant pressed for combining
  const [lastConsonantId, setLastConsonantId] = useState(null);

  // Improved input logic
  const isConsonant = (id) => {
    // Assuming consonant ids start from 13 and are every 12th after that
    return id >= 13 && ((id - 13) % 12 === 0);
  };

  const countConsonants = (guessArr) => guessArr.filter(isConsonant).length;

  const handleVowelClick = (vowelId) => {
    if (lastConsonantId && currentGuess.length > 0) {
      const combinedId = getBarakhadiId(lastConsonantId, vowelId);
      if (combinedId) {
        // Replace last consonant with combined
        const newGuess = [...currentGuess.slice(0, -1), combinedId];
        if (countConsonants(newGuess) <= maxConsonants) {
          setCurrentGuess(newGuess);
        }
        setLastConsonantId(null);
        return;
      }
    }
    // Direct vowel input
    setCurrentGuess((prev) => {
      if (countConsonants(prev) <= maxConsonants) {
        return [...prev, vowelId];
      }
      return prev;
    });
    setLastConsonantId(null);
  };

  const handleConsonantClick = (consonantId) => {
    setCurrentGuess((prev) => {
      if (countConsonants(prev) < maxConsonants) {
        return [...prev, consonantId];
      }
      return prev;
    });
    setLastConsonantId(consonantId);
  };

  const handleDelete = () => {
    setCurrentGuess((prev) => prev.slice(0, -1));
    setLastConsonantId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (countConsonants(currentGuess) !== maxConsonants) {
      alert(`Word must have exactly ${maxConsonants} consonants.`);
      return;
    }
    if (!isValidGujaratiWord(currentGuess)) {
      alert('Not a valid Gujarati word!');
      return;
    }
    const feedback = getWordleFeedback(currentGuess, TARGET_WORD);
    setGuesses((prev) => [...prev, feedback]);
    setCurrentGuess([]);
  };

  const handleRetry = () => {
    setGuesses([]);
    setCurrentGuess([]);
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const attemptCount = guesses.length;
  const success = guesses.some(guess =>
    guess.every(({ color }) => color === 'green')
  );
  const failed = attemptCount >= 6 && !success;

  const targetWordReadable = TARGET_WORD.map(id => idLetterMap[id] || '?').join('');

  return (
    <>
      <Navbar />
      <div className="container">
        <h1><b>GUJARATI WORDLE</b></h1>

        <div className="attempt-info">
          {!success && !failed && <p>Attempt {attemptCount + 1} of 6</p>}
          {failed && (
            <div className="failure-message">
              <p><b>You failed!</b> The correct word was: <span style={{ color: 'red' }}>{targetWordReadable}</span></p>
            </div>
          )}
          {success && (
            <div className="success-message">
              <p><b>Congratulations!</b> You guessed the word in {attemptCount} {attemptCount === 1 ? 'try' : 'tries'}.</p>
            </div>
          )}
        </div>

        <div className="guesses">
          {guesses.map((guessFeedback, index) => (
            <div key={index} className="guess-row">
              {guessFeedback.map(({ letter, color }, i) => (
                <div key={i} className={`guess-box ${color}`}>
                  {letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        {!success && !failed && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={currentGuess.map(id => idLetterMap[id] || '?').join('')}
              readOnly
              className="wordle-input"
            />
            <div className="input-buttons">
              <button type="submit" className="button submit" disabled={attemptCount >= 6}>SUBMIT</button>
                <button type="button" onClick={handleDelete} className="button delete">DELETE</button>
            </div>
            <br /><br />
          </form>
        )}

        {(failed || success) && (
          <div className="endgame-buttons">
            <button onClick={handleRetry} className="button">Retry</button>
            <button onClick={handleBackToMenu} className="button">Back to Main Menu</button>
          </div>
        )}

        <div className="keyboard-split-container">
          <div className="keyboard-split-divider"></div>
          <div className="vowel-box">
            {/* Vowel keys: ids 1-12, split into 2 rows */}
            {gujaratiBarakhadi.slice(0, 12).map((vowel, i) => (
              <button key={vowel.id} onClick={() => handleVowelClick(vowel.id)} className="key-button" disabled={failed || success}>
                {vowel.gu}
              </button>
            ))}
          </div>
          <div className="consonant-box">
            {/* Consonant keys: ids 13, 25, 37, ... (first of each block) */}
            {gujaratiBarakhadi.filter((l, i) => (l.id >= 13 && (l.id - 13) % 12 === 0)).map((consonant, i) => (
              <button key={consonant.id} onClick={() => handleConsonantClick(consonant.id)} className={`key-button${lastConsonantId === consonant.id ? ' selected' : ''}`} disabled={failed || success} style={lastConsonantId === consonant.id ? { backgroundColor: '#00796b', color: '#fff' } : {}}>
                {consonant.gu}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default WordleGame;
