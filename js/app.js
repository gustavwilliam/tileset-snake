class Snake {
  constructor(gameWidth, gameHeight) {
    // Coordinates are [x, y]
    this.body = [
      [1, 1],
      [2, 1],
      [3, 1],
    ];
    this.direction = [1, 0];
    this.faceDirection = [1, 0];
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
  }

  score() {
    return this.body.length - 3;
  }

  getNextPoint() {
    const head = this.body[this.body.length - 1];
    return [head[0] + this.direction[0], head[1] + this.direction[1]];
  }

  getNextApple() {
    const randomPoint = () => [
      Math.floor(Math.random() * this.gameWidth),
      Math.floor(Math.random() * this.gameHeight),
    ];
    let point = randomPoint();
    while (this.pointCollides(point)) {
      point = randomPoint();
    }
    return point;
  }

  pointCollides(point) {
    if (point[0] < 0 || point[0] >= this.gameWidth) return true;
    if (point[1] < 0 || point[1] >= this.gameHeight) return true;
    return this.body
      .slice(1) // Don't include tail piece. Might cause unwanted collision
      .some(
        (snakePoint) => snakePoint[0] === point[0] && snakePoint[1] === point[1]
      );
  }

  move() {
    this.direction = this.faceDirection;
    const newHead = this.getNextPoint();
    if (this.pointCollides(game.apple)) {
      game.apple = snake.getNextApple();
    } else {
      if (this.pointCollides(newHead)) throw new Error("Game Over");
      this.body.shift();
    }
    this.body.push(newHead);
  }

  nextDirectionFromKey(key) {
    if (key === "ArrowUp" || key === "w") return [0, -1];
    if (key === "ArrowDown" || key === "s") return [0, 1];
    if (key === "ArrowLeft" || key === "a") return [-1, 0];
    if (key === "ArrowRight" || key === "d") return [1, 0];
    return null;
  }

  handleKeyPress(e) {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        e.code
      ) > -1
    ) {
      e.preventDefault(); // Don't scroll the page when using arrow keys or space
    }
    if (e.key === " ") {
      if (gameHasStarted) return;
      startGame();
      return;
    }
    const key = e.key;
    const newDirection = this.nextDirectionFromKey(key);
    if (newDirection === null) return;
    if (
      this.direction[0] === -newDirection[0] ||
      this.direction[1] === -newDirection[1]
    ) {
      return;
    }
    this.faceDirection = newDirection;
  }
}

function gameOver() {
  clearInterval(gameTickId);
  localStorage.setItem("lastScore", snake.score());
  localStorage.setItem("lastGameId", gameId);
  localStorage.setItem("previousGameId", gameId);
  let allScores = JSON.parse(localStorage.getItem("allScores")) || [];
  allScores.push({
    score: snake.score(),
    date: new Date(),
    id: gameId || 0, // GameID = 0 marks as invalid
  });
  localStorage.setItem("highScore", Math.max(snake.score(), highScore));
  localStorage.setItem("allScores", JSON.stringify(allScores));
  window.location.reload();
}

function tick(game, snake) {
  try {
    snake.move();
  } catch (error) {
    if (error.message === "Game Over") {
      gameOver();
      return;
    }
  }
  game.snake = snake.body;
  game.render();
  gameScoreLabel.innerText = snake.score();
}

function startGame() {
  if (gameHasStarted) return;
  gameTickId = setInterval(() => tick(game, snake), 160);
  startButton.disabled = true;
  startScreen.style.display = "none";
  gameHasStarted = true;
}

// Swipe detection
document.addEventListener("touchstart", handleTouchStart);
document.addEventListener("touchmove", handleTouchMove, { passive: false });

var xDown = null;
var yDown = null;

function getTouches(evt) {
  return evt.touches || evt.originalEvent.touches;
}

function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
  evt.preventDefault(); // Prevent scrolling when swiping
  if (!xDown || !yDown) {
    return;
  }

  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      /* right swipe */
      snake.handleKeyPress({ key: "ArrowLeft" });
    } else {
      /* left swipe */
      snake.handleKeyPress({ key: "ArrowRight" });
    }
  } else {
    if (yDiff > 0) {
      /* down swipe */
      snake.handleKeyPress({ key: "ArrowUp" });
    } else {
      /* up swipe */
      snake.handleKeyPress({ key: "ArrowDown" });
    }
  }
  xDown = null;
  yDown = null;
}

// Initialize and run
let gameHasStarted = false;
const game = document.getElementById("game");
const snake = new Snake(
  game.getAttribute("game-width"),
  game.getAttribute("game-height")
);
game.apple = snake.getNextApple();
const tilesetSelector = document.getElementById("tileset-selector");
const gameScoreLabel = document.getElementById("game-score");
const highScoreLabel = document.getElementById("high-score");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const gameLeaderboard = document.getElementById("game-leaderboard");
document.addEventListener("keydown", (e) => snake.handleKeyPress(e));
tilesetSelector.onchange = (e) => {
  game.setAttribute("tileset", e.target.value);
  localStorage.setItem("tileset", e.target.value);
  tilesetSelector.blur();
};
if (localStorage.getItem("tileset")) {
  game.setAttribute("tileset", localStorage.getItem("tileset"));
  tilesetSelector.value = localStorage.getItem("tileset");
}
let highScore = localStorage.getItem("highScore") || 0;
highScoreLabel.innerText = highScore;
gameScoreLabel.innerText = localStorage.getItem("lastScore") || 0;
let gameTickId = null;
const lastGameId = localStorage.getItem("lastGameId") || 0;
const previousGameId = localStorage.getItem("previousGameId") || 200; // Ensure no collisions with legacy games
const gameId = parseInt(previousGameId) + 1;
startButton.onclick = startGame;
