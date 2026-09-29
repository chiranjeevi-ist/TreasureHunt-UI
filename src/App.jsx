import { useState } from "react";
import "./App.css";

const clues = {
  1: {
    question: (
      <>
        I have keys but no locks.
        <br />
        I have space but no room.
        <br />
        What am I?
      </>
    ),
  },
  2: {
    question: (
      <>
        I have hands but cannot clap.
        <br />
        What am I?
      </>
    ),
  },
  3: {
    question: (
      <>
        I am always in front of you,
        <br />
        but can never be seen.
        <br />
        What am I?
      </>
    ),
  },
};

function App() {
  const [playerName, setPlayerName] = useState("");
  const [game, setGame] = useState(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  const startGame = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7093/api/v1/game/start?playerName=${encodeURIComponent(
          playerName
        )}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data);
        return;
      }

      setGame(data);
      setMessage("");
      setAnswer("");
    } catch (error) {
      console.error("Start game error:", error);
      setMessage("Unable to connect to the game server.");
    }
  };

  const solveClue = async () => {
    if (!answer.trim()) {
      setMessage("Please enter your answer.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7093/api/v1/game/${game.id}/solve?answer=${encodeURIComponent(
          answer
        )}`,
        {
          method: "POST",
        }
      );

      // Backend can return either JSON or plain text
      const contentType = response.headers.get("content-type");

      const data = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      console.log("Solve response:", response.status, data);

      if (response.ok) {
        setGame({
          ...game,
          score: data.score,
          currentClue: data.currentClue,
          completed: data.completed,
        });

        setAnswer("");
        setMessage(data.message);
      } else {
        // Handles "Wrong answer. Try again!" from the API
        setMessage(
          typeof data === "string"
            ? data
            : data.title || "Wrong answer. Try again!"
        );
      }
    } catch (error) {
      console.error("Solve clue error:", error);
      setMessage("Unable to connect to the game server.");
    }
  };

  // Final screen
  if (game?.completed) {
    return (
      <div className="game-container">
        <div className="game-card">
          <div className="icon">🏆</div>

          <h1>Treasure Found!</h1>

          <p>Congratulations, {game.playerName}!</p>

          <div className="final-score">
            Final Score: <strong>{game.score}</strong>
          </div>

          <p>You successfully completed all 3 clues.</p>

          <button onClick={() => window.location.reload()}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Game screen
  if (game) {
    return (
      <div className="game-container">
        <div className="game-card">
          <h1>🗺️ Treasure Hunt</h1>

          <div className="game-info">
            <span>Player: {game.playerName}</span>
            <span>Score: {game.score}</span>
          </div>

          <div className="clue-box">
            <h2>🔐 Clue {game.currentClue}</h2>

            <p>
              {clues[game.currentClue]?.question}
            </p>
          </div>

          <input
            type="text"
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                solveClue();
              }
            }}
          />

          <button onClick={solveClue}>
            Solve Clue
          </button>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

          <p>
            Clue {game.currentClue} of 3
          </p>
        </div>
      </div>
    );
  }

  // Start screen
  return (
    <div className="game-container">
      <div className="game-card">
        <div className="icon">🗺️</div>

        <h1>Treasure Hunt</h1>

        <p>
          Embark on your adventure and find the hidden treasure!
        </p>

        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              startGame();
            }
          }}
        />

        <button onClick={startGame}>
          Start Game
        </button>

        {message && (
          <p className="message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;