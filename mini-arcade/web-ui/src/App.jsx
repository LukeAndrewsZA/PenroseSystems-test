import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import { sendMessage } from './messaging/gateway';
import { getLeaderboard, saveScore, getHighScore } from './lib/leaderboard';

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

const DEFAULT_PLAYER = '';
const DEFAULT_SOUND = true;
const DEFAULT_DIFFICULTY = 'easy';

// Get a value from localStorage or use fallback
function getPersisted(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// Save a value to localStorage as stated by project scope
function setPersisted(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function App() {
  // State hooks for player, sound, difficulty and game status
  const [player, setPlayer] = useState(getPersisted('player', DEFAULT_PLAYER));
  const [sound, setSound] = useState(getPersisted('sound', DEFAULT_SOUND));
  const [difficulty, setDifficulty] = useState(getPersisted('difficulty', DEFAULT_DIFFICULTY));
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(getHighScore(player));
  const [leaderboard, setLeaderboard] = useState(getLeaderboard());
  const [phase, setPhase] = useState('boot');
  const iframeRef = useRef(null);
  const warningTimeoutRef = useRef();
  // Persist settings when changed (This works but mostly placeholder as game gradally changes in difficulty)
  useEffect(() => { setPersisted('player', player); }, [player]);
  useEffect(() => { setPersisted('sound', sound); }, [sound]);
  useEffect(() => { setPersisted('difficulty', difficulty); }, [difficulty]);
  // Listen for messages from the game
  useEffect(() => {
    function handleMsg(e) {
      const m = e?.data;
      if (!m || typeof m !== 'object') return;
      if (m.type === 'ready') {
        setReady(true);
        setWarning(false);
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = null;
        }
        setPhase(prev => (prev === 'playing' || prev === 'gameover' || prev === 'paused' ? prev : 'boot'));
      } else if (m.type === 'score') {
        setScore(m.value ?? 0);
      } else if (m.type === 'gameover') {
        const final = Number(m.finalScore || 0);
        setScore(final);
        saveScore(player || 'Player', final);
        setHighScore(getHighScore(player));
        setLeaderboard(getLeaderboard());
        setPhase('gameover');
      }
    }
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [player]);
  // Show warning if game not ready after 5s
  useEffect(() => {
    warningTimeoutRef.current = setTimeout(() => {
      if (!ready) setWarning(true);
    }, 5000);
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
    };
  }, []);
  // Send settings to game when ready or changed
  useEffect(() => {
    if (ready) {
      sendMessage({ type: 'settings', sound, difficulty });
    }
  }, [ready, sound, difficulty]);
  // Start game
  const handleStart = () => {
    if (!ready || !player || phase !== 'boot') return;
    sendMessage({ type: 'start' });
    setScore(0);
    setPhase('playing');
  };
  // Pause game
  const handlePause = () => {
    if (!ready || phase !== 'playing') return;
    sendMessage({ type: 'pause' });
    setPhase('paused');
  };
  // Resume game
  const handleResume = () => {
    if (!ready || phase !== 'paused') return;
    sendMessage({ type: 'resume' });
    setPhase('playing');
  };
  // Restart game
  const handleRestart = () => {
    if (!ready || phase !== 'gameover') return;
    sendMessage({ type: 'restart' });
    setScore(0);
    setPhase('boot');
  };
  // Focus player input if empty
  const playerInputRef = useRef(null);
  useEffect(() => { if (!player) playerInputRef.current?.focus(); }, [player]);
  return (
      <div className="arcade-root">
        <h1 id="arcade-title">Mini Arcade</h1>
        <form className="arcade-controls" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="player" className="arcade-label">Player Name</label>
          <input
              id="player"
              ref={playerInputRef}
              className="arcade-input"
              value={player}
              onChange={(e) => setPlayer(e.target.value.slice(0, 16))}
              maxLength={16}
              required
              aria-required="true"
          />
          <label className="arcade-label" htmlFor="sound">Sound</label>
          <input
              id="sound"
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="arcade-checkbox"
          />
          <label className="arcade-label" htmlFor="difficulty">Difficulty</label>
          <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="arcade-select"
          >
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
          </select>
          <div className="arcade-buttons">
            <button
                type="button"
                onClick={handleStart}
                disabled={!ready || !player || phase !== 'boot'}
            >
              Start
            </button>
            <button
                type="button"
                onClick={handlePause}
                disabled={!ready || phase !== 'playing'}
            >
              Pause
            </button>
            <button
                type="button"
                onClick={handleResume}
                disabled={!ready || phase !== 'paused'}
            >
              Resume
            </button>
            <button
                type="button"
                onClick={handleRestart}
                disabled={!ready || phase !== 'gameover'}
            >
              Restart
            </button>
          </div>
        </form>
        <div>Score: <span>{score}</span></div>
        <div>High Score: <span>{highScore}</span></div>
        <div>Leaderboard:</div>
        <ol>
          {leaderboard.map((entry) => (
              <li key={entry.name}>{entry.name}: {entry.score}</li>
          ))}
        </ol>
        <div className="arcade-game-outer">
          <div
              className="arcade-game-inner"
              style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            <iframe
                ref={iframeRef}
                title="Mini Arcade Game"
                src="/game/index.html"
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                className="arcade-iframe"
                tabIndex={-1}
                allowFullScreen
                aria-label="Game area"
            />
          </div>
        </div>
        <div className="arcade-phase" style={{ marginTop: 12, fontWeight: 'bold' }}>
          Phase: {phase}
        </div>
        {warning && (
            <div className="arcade-warning" role="alert">
              Game not ready! Please check if the game loaded correctly.
            </div>
        )}
      </div>
  );
}
